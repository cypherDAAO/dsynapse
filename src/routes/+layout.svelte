<script>
	let { children } = $props();
	import Navbar from '$lib/components/Navbar.svelte';
	import LicenseLink from '$lib/components/LicenseLink.svelte';
	import '../app.css';
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';

	onMount(() => {
		// Detectar preferencia guardada o del sistema
		const savedTheme = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

		if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
			document.documentElement.classList.add('dark');
			document.body.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
			document.body.classList.remove('dark');
		}
	});
</script>

<svelte:head>
	<script>
		if (localStorage.getItem('theme') === 'dark') {
			document.documentElement.classList.add('dark');
			document.body && document.body.classList.add('dark');
		}
	</script>
	<style>
		html,
		body {
			background-color: white;
			transition: background-color 300ms;
			font-family: var(--font-inter);
			text-rendering: optimizeLegibility;
			-webkit-font-smoothing: antialiased;
			-moz-osx-font-smoothing: grayscale;
		}

		html.dark,
		body.dark {
			background-color: var(--color-zinc-950); /* Mismo color que bg-gray-900 */
		}

		h1, h2, h3, h4, h5, h6 {
			font-family: var(--font-geist);
		}
	</style>
	<link rel="preload" as="font" href="/fonts/inter/Inter-Regular.woff2" type="font/woff2" crossorigin="anonymous">
	<link rel="preload" as="font" href="/fonts/inter/Inter-Medium.woff2" type="font/woff2" crossorigin="anonymous">
	<link rel="preload" as="font" href="/fonts/inter/InterVariable.woff2" type="font/woff2" crossorigin="anonymous">
	<link rel="preload" as="font" href="/fonts/geist/Geist-Regular.woff2" type="font/woff2" crossorigin="anonymous">
	<link rel="preload" as="font" href="/fonts/geist/Geist-Medium.woff2" type="font/woff2" crossorigin="anonymous">
	<link rel="preload" as="font" href="/fonts/geist/Geist[wght].woff2" type="font/woff2" crossorigin="anonymous">
</svelte:head>

<div
	class="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white transition-colors duration-300"
>
	<Navbar />
	<main class="mt-[-64px] flex-grow">
		{@render children()}
	</main>
	<footer class="py-6 px-4 border-t border-gray-200 dark:border-zinc-800 mt-12">
		<div class="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
			<p class="text-sm text-zinc-500 dark:text-zinc-400 mb-4 sm:mb-0">
				© {new Date().getFullYear()} DSynapse. {$t('common.footer.all_rights_reserved')}
			</p>
			<div class="flex space-x-6">
				<LicenseLink />
			</div>
		</div>
	</footer>
</div>
