<script lang="ts">
	import type { HeliaLibp2p } from 'helia';
	import type { Libp2p } from '@libp2p/interface';
	import type { UnixFS } from '@helia/unixfs';
	import { onMount } from 'svelte';
	import SuperformulaAnimation from '$lib/components/SuperformulaAnimation.svelte';
	interface ipfsStruct {
		node: HeliaLibp2p<Libp2p<{ x: Record<string, unknown> }>>;
		fs: UnixFS;
	}
	let message: string = 'Hello helia';
	let cid: string;
	let peerID: string;

	onMount(async () => {
		let ipfs: ipfsStruct;
		let { default: initHelia } = await import('$lib/heliaModule');
		ipfs = await initHelia();
		window.node = ipfs.node;
		peerID = ipfs.node.libp2p.peerId.toString();
		cid = await ipfs.fs.addBytes(new TextEncoder().encode(message));
		//cid = cidTemp.toString();
		console.log('CID:', cid);
		console.log('peerID:', peerID);
	});
</script>

<section class="relative w-full min-h-screen">
	<div class="absolute inset-0 w-full h-full">
		<SuperformulaAnimation />
	</div>
	<div class="absolute inset-0 flex items-center justify-center">
		<div
			class="relative z-10 flex flex-col items-center justify-center px-4 md:px-8 lg:px-0 py-8 max-w-7xl"
		>
			<h1 class="text-3xl font-bold">IPFS DApp Manager</h1>
			<h3>message: {message}</h3>
			<h3>CID: {cid}</h3>
			<h3>peerID: {peerID}</h3>
		</div>
	</div>
</section>

<style lang="postcss">
	@reference "tailwindcss";
	:global(html) {
		background-color: theme(--color-gray-100);
	}
</style>
