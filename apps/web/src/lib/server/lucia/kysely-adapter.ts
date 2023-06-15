import { LuciaError} from "lucia-auth";
import type { Adapter, UserSchema, SessionSchema } from "lucia-auth";
import { getUpdateData } from "lucia-auth/adapter";
import type { Kysely } from "kysely";
import type { DatabaseError } from "pg";
import { convertToSessionSchema, convertToUserSchema } from "./utils.js";
import type { Session, User } from "../database/types/user.js";

interface DB {
  user: User,
  session: Session,
}

const adapter = (
	db: Kysely<DB>,
	errorHandler: (error: DatabaseError) => void = () => {}
): Adapter => {
	return {
		getUser: async (userId): Promise<UserSchema | null> => {
			try {
				const data = await db
					.selectFrom("user")
					.selectAll()
					.where("id", "=", userId)
					.executeTakeFirst();
				if (!data) return null;
				return convertToUserSchema(data);
			} catch (e) {
				errorHandler(e as any);
				throw e;
			}
		},
		getUserByProviderId: async (providerId): Promise<UserSchema | null> => {
			try {
				const data = await db
					.selectFrom("user")
					.selectAll()
					.where("providerId", "=", providerId)
					.executeTakeFirst();
				if (!data) return null;
				return convertToUserSchema(data);
			} catch (e) {
				errorHandler(e as any);
				throw e;
			}
		},
		getSessionAndUserBySessionId: async (sessionId): Promise<{
			user: UserSchema;
			session: SessionSchema; 
		} | null> => {
			try {
				const data = await db
					.selectFrom("user")
					.innerJoin("session", "user.id", "session.userId")
					.selectAll()
					.where("session.id", "=", sessionId)
					.executeTakeFirst();
				if (!data) return null;

				const { id, userId, expires, idleExpires, ...user } = data;
				return {
					user: convertToUserSchema({ ...user, id: userId }),
					session: convertToSessionSchema({ id, userId, expires, idleExpires }),
				};
			} catch (e) {
				errorHandler(e as any);
				throw e;
			}
		},
		getSession: async (sessionId): Promise<SessionSchema | null> => {
			try {
				const data = await db
					.selectFrom("session")
					.selectAll()
					.where("id", "=", sessionId)
					.executeTakeFirst();
				if (!data) return null;
				return convertToSessionSchema(data);
			} catch (e) {
				errorHandler(e as any);
				throw e;
			}
		},
		getSessionsByUserId: async (userId): Promise<SessionSchema[]> => {
			try {
				const data = await db
					.selectFrom("session")
					.selectAll()
					.where("userId", "=", userId)
					.execute();
				return data.map((session) => convertToSessionSchema(session));
			} catch (e) {
				errorHandler(e as any);
				throw e;
			}
		},
		setUser: async (userId, data): Promise<UserSchema> => {
			try {
				const user = await db
					.insertInto("user")
					.values({
						id: userId || undefined,
						providerId: data.providerId,
						hashedPassword: data.hashedPassword,
						email: data.attributes.email,
						provider: data.attributes.provider,
						createdAt: data.attributes.createdAt,
					})
					.returningAll()
					.executeTakeFirstOrThrow();
				return convertToUserSchema(user);
			} catch (e) {
				const error = e as DatabaseError;
				if (error.code === "23505" && error.detail?.includes("Key (provider_id)")) {
					throw new LuciaError("AUTH_DUPLICATE_PROVIDER_ID");
				}
				errorHandler(e as any);
				throw e;
			}
		},
		deleteUser: async (userId) => {
			try {
				await db.deleteFrom("user").where("id", "=", userId).execute();
			} catch (e) {
				errorHandler(e as any);
				throw e;
			}
		},
		setSession: async (sessionId, data) => {
			try {
				await db
					.insertInto("session")
					.values({
						id: sessionId,
						userId: data.userId,
						expires: data.expires,
						idleExpires: data.idlePeriodExpires
					})
					.returningAll()
					.execute();
			} catch (e) {
				const error = e as DatabaseError;
				if (error.code === "23503" && error.detail?.includes("Key (user_id)")) {
					throw new LuciaError("AUTH_INVALID_USER_ID");
				} else if (error.code === "23505" && error.detail?.includes("Key (id)")) {
					throw new LuciaError("AUTH_DUPLICATE_SESSION_ID");
				}
				errorHandler(e as any);
				throw e;
			}
		},
		deleteSession: async (...sessionIds) => {
			try {
				await db.deleteFrom("session").where("id", "in", sessionIds).execute();
			} catch (e) {
				errorHandler(e as any);
				throw e;
			}
		},
		deleteSessionsByUserId: async (userId) => {
			try {
				await db.deleteFrom("session").where("userId", "=", userId).execute();
			} catch (e) {
				errorHandler(e as any);
				throw e;
			}
		},
		updateUser: async (userId, newData): Promise<UserSchema> => {
			const partialData = getUpdateData(newData);
			try {
				let user;
				if (Object.keys(partialData).length === 0) {
					user = await db
						.selectFrom("user")
						.where("id", "=", userId)
						.selectAll()
						.executeTakeFirst();
				} else {
					user = await db
						.updateTable("user")
						.set(partialData)
						.where("id", "=", userId)
						.returningAll()
						.executeTakeFirst();
				}
				if (!user) throw new LuciaError("AUTH_INVALID_USER_ID");
				return convertToUserSchema(user);
			} catch (e) {
				if (e instanceof LuciaError) throw e;
				const error = e as DatabaseError;
				if (error.code === "23505" && error.detail?.includes("Key (provider_id)")) {
					throw new LuciaError("AUTH_DUPLICATE_PROVIDER_ID");
				}
				errorHandler(e as any);
				throw e;
			}
		}
	};
};

export default adapter;
