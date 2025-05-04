<script lang="ts">
	import type { HeliaLibp2p } from 'helia';
	import type { Libp2p } from '@libp2p/interface';
	import type { UnixFS } from '@helia/unixfs';
	import { onMount } from 'svelte';
	import SuperformulaAnimation from '$lib/components/SuperformulaAnimation.svelte';
	import { t } from '$lib/i18n';
	import WalletButton from '$lib/components/WalletButton.svelte';

	interface ipfsStruct {
		node: any; // Simplificando el tipo para evitar errores de linter
		fs: UnixFS;
	}
	let message: string = 'Hello helia';
	let cid: any; // Cambiado a any para evitar errores de linter
	let peerID: string = '';

	onMount(async () => {
		try {
			let ipfs: ipfsStruct;
			let { default: initHelia } = await import('$lib/heliaModule');
			ipfs = (await initHelia()) as ipfsStruct; // Forzar el tipo para evitar errores
			// @ts-ignore - Ignorando el error del tipado
			window.node = ipfs.node;
			peerID = ipfs.node.libp2p.peerId.toString();
			cid = await ipfs.fs.addBytes(new TextEncoder().encode(message));
			console.log('CID:', cid);
			console.log('peerID:', peerID);
		} catch (error) {
			console.error('Error initializing Helia:', error);
		}
	});
</script>

<section class="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
	<div class="absolute inset-0 w-full h-full">
		<SuperformulaAnimation />
	</div>
	<div class="relative z-10 container mx-auto px-4 py-16 text-center">
		<h1
			class="text-5xl md:text-7xl xl:text-8xl font-bold mb-4 !text-fuchsia-900 dark:!text-white drop-shadow-lg"
		>
			{$t('home.hero.title')}
		</h1>
		<p
			class="text-xl md:text-2xl mb-8 max-w-3xl mx-auto !text-fuchsia-800 dark:!text-white drop-shadow-md"
		>
			{$t('home.hero.subtitle')}
		</p>
		<div class="flex flex-wrap justify-center gap-4">
			<a
				href="#learn-more"
				class="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
			>
				{$t('home.hero.learn_more')}
			</a>
			<a
				href="#tokenomics"
				class="bg-transparent border-2 border-fuchsia-600 hover:bg-fuc-600/10 text-fuchsia-700 dark:text-white dark:border-fuchsia-600 font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
			>
				{$t('home.hero.tokenomics')}
			</a>
		</div>
	</div>
</section>

<section
	id="learn-more"
	class="py-16 bg-zinc-50 dark:bg-zinc-950 min-h-screen flex flex-col justify-center items-center max-w-7xl mx-auto"
>
	<div class="container mx-auto px-4">
		<h2
			class="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-8 text-center !text-fuchsia-900 dark:!text-white"
		>
			{$t('home.about.title')}
		</h2>
		<div class="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
			<div
				class="bg-white dark:bg-fuchsia-800 p-6 rounded-2xl shadow-md border border-zinc-200 dark:border-fuchsia-700"
			>
				<h3 class="text-xl font-semibold mb-3 !text-fuchsia-700 dark:!text-white">
					{$t('home.about.research_title')}
				</h3>
				<p class="!text-zinc-800 dark:!text-zinc-300">
					{$t('home.about.research_text')}
				</p>
			</div>
			<div
				class="bg-white dark:bg-fuchsia-800 p-6 rounded-2xl shadow-md border border-zinc-200 dark:border-fuchsia-700"
			>
				<h3 class="text-xl font-semibold mb-3 !text-fuchsia-700 dark:!text-white">
					{$t('home.about.technology_title')}
				</h3>
				<p class="!text-zinc-800 dark:!text-zinc-300">
					{$t('home.about.technology_text')}
				</p>
			</div>
		</div>
	</div>
</section>

<section
	id="tokenomics"
	class="py-16 bg-zinc-50 dark:bg-zinc-950 min-h-screen flex flex-col justify-center items-center max-w-7xl mx-auto"
>
	<div class="container mx-auto px-4">
		<h2
			class="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-8 text-center !text-fuchsia-900 dark:!text-white"
		>
			{$t('home.tokenomics.title')}
		</h2>
		<div class="max-w-4xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
			<div
				class="bg-white dark:bg-fuchsia-800 p-6 rounded-2xl shadow-md border border-zinc-200 dark:border-fuchsia-700"
			>
				<h3 class="text-xl font-semibold mb-3 !text-fuchsia-700 dark:!text-white">
					{$t('home.tokenomics.issuance_title')}
				</h3>
				<p class="!text-zinc-700 dark:!text-gray-300">
					{$t('home.tokenomics.issuance_text')}
				</p>
			</div>
			<div
				class="bg-white dark:bg-fuchsia-800 p-6 rounded-2xl shadow-md border border-zinc-200 dark:border-fuchsia-700"
			>
				<h3 class="text-xl font-semibold mb-3 !text-fuchsia-700 dark:!text-white">
					{$t('home.tokenomics.burning_title')}
				</h3>
				<p class="!text-zinc-700 dark:!text-gray-300">
					{$t('home.tokenomics.burning_text')}
				</p>
			</div>
			<div
				class="bg-white dark:bg-fuchsia-800 p-6 rounded-2xl shadow-md border border-zinc-200 dark:border-fuchsia-700"
			>
				<h3 class="text-xl font-semibold mb-3 !text-fuchsia-700 dark:!text-white">
					{$t('home.tokenomics.rewards_title')}
				</h3>
				<p class="!text-zinc-700 dark:!text-gray-300">
					{$t('home.tokenomics.rewards_text')}
				</p>
			</div>
		</div>
	</div>
</section>

<section
	class="py-16 bg-zinc-50 dark:bg-zinc-950 min-h-screen flex flex-col justify-center items-center max-w-7xl mx-auto"
>
	<div class="container mx-auto px-4">
		<h2
			class="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-8 text-center !text-fuchsia-900 dark:!text-white"
		>
			{$t('home.how_it_works.title')}
		</h2>
		<div class="max-w-4xl mx-auto space-y-8">
			<div class="flex flex-col md:flex-row gap-6 items-center">
				<div class="md:w-1/3 flex justify-center">
					<div
						class="w-24 h-24 rounded-full bg-fuchsia-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg"
					>
						1
					</div>
				</div>
				<div class="md:w-2/3">
					<h3 class="text-xl font-semibold mb-2 !text-fuchsia-700 dark:!text-fuchsia-400">
						{$t('home.how_it_works.step1_title')}
					</h3>
					<p class="!text-zinc-600 dark:!text-gray-300">
						{$t('home.how_it_works.step1_text')}
					</p>
				</div>
			</div>

			<div class="flex flex-col md:flex-row gap-6 items-center">
				<div class="md:w-1/3 flex justify-center">
					<div
						class="w-24 h-24 rounded-full bg-fuchsia-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg"
					>
						2
					</div>
				</div>
				<div class="md:w-2/3">
					<h3 class="text-xl font-semibold mb-2 !text-fuchsia-700 dark:!text-fuchsia-400">
						{$t('home.how_it_works.step2_title')}
					</h3>
					<p class="!text-zinc-600 dark:!text-gray-300">
						{$t('home.how_it_works.step2_text')}
					</p>
				</div>
			</div>

			<div class="flex flex-col md:flex-row gap-6 items-center">
				<div class="md:w-1/3 flex justify-center">
					<div
						class="w-24 h-24 rounded-full bg-fuchsia-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg"
					>
						3
					</div>
				</div>
				<div class="md:w-2/3">
					<h3 class="text-xl font-semibold mb-2 !text-fuchsia-700 dark:!text-fuchsia-400">
						{$t('home.how_it_works.step3_title')}
					</h3>
					<p class="!text-zinc-600 dark:!text-gray-300">
						{$t('home.how_it_works.step3_text')}
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="py-16 bg-fuchsia-700 text-white">
	<div class="container mx-auto px-4 text-center">
		<h2 class="text-3xl font-bold mb-6 text-white drop-shadow-md">
			{$t('home.cta.title')}
		</h2>
		<p class="text-xl mb-8 max-w-3xl mx-auto text-white">
			{$t('home.cta.subtitle')}
		</p>
		<a
			href="#"
			class="bg-white text-fuchsia-700 hover:bg-blue-50 font-bold py-3 px-8 rounded-lg transition-colors shadow-lg inline-block"
		>
			{$t('home.cta.button')}
		</a>
	</div>
</section>

<main>
	<h1>Conexión a Ethereum con SvelteKit</h1>
	<div class="wallet-container">
		<WalletButton />
	</div>
</main>

<div class="wallet-link">
	<a href="/wallet">Conectar con Wallet Ethereum</a>
</div>

<style lang="postcss">
	@reference "tailwindcss";
	:global(html) {
		scroll-behavior: smooth;
		background-color: theme(--color-zinc-50);
	}

	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		text-align: center;
	}

	h1 {
		margin-bottom: 2rem;
		color: #333;
	}

	.wallet-container {
		max-width: 400px;
		margin: 0 auto;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		background: white;
	}

	.wallet-link {
		display: flex;
		justify-content: center;
		margin-top: 2rem;
	}

	.wallet-link a {
		background: #4a56e2;
		color: white;
		text-decoration: none;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		font-weight: bold;
		transition: background 0.2s;
	}

	.wallet-link a:hover {
		background: #3a46c2;
	}
</style>
