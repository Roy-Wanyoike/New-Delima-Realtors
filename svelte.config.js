import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Vercel is the deploy target (see vercel.json). adapter-auto was producing
		// "Could not detect a supported production environment" and no deployable output.
		// adapter-vercel is already a devDependency and matches vercel.json.
		adapter: adapter()
	}
};

export default config;
