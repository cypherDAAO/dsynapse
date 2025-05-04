import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			fallback: 'index.html' // Esto hace que todas las rutas se sirvan con index.html
		}),
		paths: {
			relative: true // Establecemos esta propiedad para usar rutas absolutas
		}
	}
};

export default config;
export const prerender = true;