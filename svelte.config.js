//import adapter from '@sveltejs/adapter-static';
//import adapter from 'svelte-adapter-github';
import adapter from '@sveltejs/adapter-vercel';
//import { vitePreprocess } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
    appDir: 'app',
		adapter: adapter({
      runtime: 'nodejs20.x', // TODO update this? - required for vercel
    }),
    outDir: 'build'
	}
};

export default config;
