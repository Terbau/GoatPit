import type { RandomMatchupPayload, RandomMatchupFinishedResponse, RandomMatchup } from './types.d';
import jwt, { type Secret } from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import type { GenerateMatchupOptions, ItemEloMatchup } from './types';
import {
	getTwoRandomImdbItemsMatchingRandomGenre,
	getTwoRandomImdbItemsIgnoreMatchingGenre,
	insertEloMatchup,
	updateEloItem,
	getTwoSimilarImdbItemsIgnoreMatchingGenre,
	getTwoSimilarImdbItemsMatchingRandomGenre
} from './db';
import { roundTo } from '$lib/utils';

// Actual elo functions

export const probability = (itemElo1: number, itemElo2: number): number => {
	return (1.0 * 1.0) / (1 + 1.0 * Math.pow(10, (1.0 * (itemElo1 - itemElo2)) / 400));
};

export const getUpdatedElo = (
	itemElo1: number,
	itemElo2: number,
	winnerIsItem1: boolean
): { itemElo1: number; itemElo2: number } => {
	const k = 30;

	const p1 = probability(itemElo1, itemElo2);
	const p2 = probability(itemElo2, itemElo1);
	console.log('p1', p1);
	console.log('p2', p2);

	if (winnerIsItem1) {
		itemElo1 = itemElo1 + k * (1 - p1);
		itemElo2 = itemElo2 + k * (0 - p2);
	} else {
		itemElo1 = itemElo1 + k * (0 - p1);
		itemElo2 = itemElo2 + k * (1 - p2);
	}

	console.log('itemElo1', itemElo1);
	console.log('itemElo2', itemElo2);

	return {
		itemElo1: roundTo(itemElo1, 3),
		itemElo2: roundTo(itemElo2, 3)
	};
};

// Other functions

export const generateMatchupToken = (
	userId: string,
	imdbItemId1: string,
	imdbItemId2: string,
	itemElo1: number,
	itemElo2: number,
	compareFactor: string | null,
	compareFactorType: string | null
): string => {
	const payload = {
		userId,
		imdbItemId1,
		imdbItemId2,
		itemElo1,
		itemElo2,
		compareFactor,
		compareFactorType,
		startedAt: new Date()
	};

	return jwt.sign(payload, JWT_SECRET);
};

export const decodeMatchupToken = (token: string): ItemEloMatchup => {
	let decoded: ItemEloMatchup;
	try {
		decoded = jwt.verify(token, JWT_SECRET as Secret) as ItemEloMatchup;
	} catch (err) {
		throw err;
	}

	return decoded;
};

export const validateMatchupResponse = (
	userId: string,
	token: string,
	winnerImdbItemId: string
): ItemEloMatchup => {
	const decoded = decodeMatchupToken(token);
	if (decoded.userId !== userId) {
		throw new Error('Invalid user');
	}

	if (decoded.imdbItemId1 !== winnerImdbItemId && decoded.imdbItemId2 !== winnerImdbItemId) {
		throw new Error('Invalid winner');
	}

	return decoded;
};

export const handleMatchupCreate = async (
	userId: string,
	watchlistIds: string[],
	genreNames: string[],
	compareFactorTypes: string[],
	itemElo1?: number,
	itemElo2?: number,
): Promise<RandomMatchupPayload> => {
	let compareFactorType: string | null = null;

	if (compareFactorTypes.length == 1) {
		compareFactorType = compareFactorTypes[0];
	} else if (compareFactorTypes.length > 1) {
		compareFactorType = compareFactorTypes[Math.floor(Math.random() * compareFactorTypes.length)];
	}

	let randomMatchup: RandomMatchup | null = null;
	switch (compareFactorType) {
		case 'genre':
			randomMatchup = await getTwoSimilarImdbItemsMatchingRandomGenre(
				userId,
				watchlistIds,
				genreNames
			);
			break;
		default:
			randomMatchup = await getTwoSimilarImdbItemsIgnoreMatchingGenre(
				userId,
				watchlistIds,
				genreNames
			);
	}

	if (!randomMatchup) {
		throw new Error('Could not find two random items');
	}

	const token = generateMatchupToken(
		userId,
		randomMatchup.imdbItem1.id,
		randomMatchup.imdbItem2.id,
		itemElo1 ?? randomMatchup.itemElo1,
		itemElo2 ?? randomMatchup.itemElo2,
		randomMatchup.compareFactor,
		randomMatchup.compareFactorType
	);

	return {
		token,
		items: [randomMatchup.imdbItem1, randomMatchup.imdbItem2],
		compareFactor: randomMatchup.compareFactor,
		compareFactorType: randomMatchup.compareFactorType,
		compareFactorTypes: compareFactorTypes,
		genreNames,
		watchlistIds
	};
};

export const handleMatchupResponse = async (
	userId: string,
	data: RandomMatchupFinishedResponse
) => {
	let decoded: ItemEloMatchup;
	try {
		decoded = validateMatchupResponse(userId, data.token, data.winnerImdbItemId);
	} catch (err) {
		throw err;
	}

	const result = getUpdatedElo(
		decoded.itemElo1,
		decoded.itemElo2,
		decoded.imdbItemId1 === data.winnerImdbItemId
	);

	await Promise.all([
		updateEloItem(userId, decoded.imdbItemId1, result.itemElo1),
		updateEloItem(userId, decoded.imdbItemId2, result.itemElo2),
	]);

	await insertEloMatchup(
		userId,
		decoded.imdbItemId1,
		decoded.imdbItemId2,
		data.winnerImdbItemId,
		decoded.compareFactor,
		decoded.startedAt
	)

	return await handleMatchupCreate(
		userId,
		data.watchlistIds,
		data.genreNames,
		data.compareFactorTypes,
	);
};
