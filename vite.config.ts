import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	// Asegurarse de que los archivos JS se procesen correctamente
	build: {
		target: 'es2020',
	},
	// Mejorar la resolución de módulos
	resolve: {
		extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.svelte']
	}
});
