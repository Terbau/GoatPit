import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	build: { commonjsOptions: { transformMixedEsModules: true, exclude: [ 'node_modules/lodash-es/**', 'node_modules/@types/lodash-es/**', ] } },
	plugins: [sveltekit()],
	server: {
		host: '127.0.0.1',
		// port: 6137
	}
};

export default config;
