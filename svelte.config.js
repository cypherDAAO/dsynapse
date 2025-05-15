import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			fallback: 'index.html', // Esto hace que todas las rutas se sirvan con index.html
			strict: false // Esto permite que las rutas no encontradas no causen errores
		}),
		paths: {
			relative: true // Establecemos esta propiedad para usar rutas absolutas
		},
		// Configuración específica para manejar rutas
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				// Ignorar específicamente la ruta de Chrome DevTools
				if (path.includes('.well-known/appspecific/com.chrome.devtools.json')) {
					return;
				}
				// Para cualquier otro error, lanzar el error para que sea visible
				throw new Error(message);
			}
		}
	}
};

export default config;
export const prerender = true;