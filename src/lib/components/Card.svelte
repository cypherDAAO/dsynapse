<script>
	import SuperformulaWireframe from './Morphing.svelte';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	// Props básicos como en el original
	export let titulo = 'Arte';
	export let descripcion = 'Colección de fotografías y grabados artísticos';

	let visible = false;

	onMount(() => {
		visible = true;
	});
</script>

<div
	class="relative overflow-hidden rounded-3xl min-h-[650px]"
	transition:fade={{ duration: 700 }}
	class:opacity-0={!visible}
	class:opacity-100={visible}
>
	<div class="absolute inset-x-0 top-0 h-4/5">
		<SuperformulaWireframe />
	</div>

	<!-- Contenedor para el efecto glassmorphism - tema claro visible solo en modo claro -->
	<div
		class="absolute left-0 right-0 bottom-0 h-2/5 pointer-events-none backdrop-blur-md block dark:hidden light-mask"
	></div>
	
	<!-- Contenedor para el efecto glassmorphism - tema oscuro visible solo en modo oscuro -->
	<div
		class="absolute left-0 right-0 bottom-0 h-2/5 pointer-events-none backdrop-blur-md hidden dark:block dark-mask"
	></div>

	<!-- Contenedor del texto separado del blur -->
	<div class="absolute left-0 right-0 bottom-0 h-2/5 flex items-center z-20">
		<div class="p-8 w-full">
			<h3 class="text-4xl font-medium mb-4 text-fuchsia-950 dark:text-white">{titulo}</h3>
			<p class="text-xl text-zinc-700 dark:text-zinc-200 leading-tight">
				{descripcion}
			</p>
		</div>
	</div>
</div>

<style>
	:global(.light-mask) {
		background: linear-gradient(to top, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.5) 40%, rgba(255,255,255,0) 100%);
		mask-image: linear-gradient(to top, black 0%, black 40%, transparent 100%);
		-webkit-mask-image: linear-gradient(to top, black 0%, black 40%, transparent 100%);
	}
	
	:global(.dark-mask) {
		background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0) 100%);
		mask-image: linear-gradient(to top, black 0%, black 40%, transparent 100%);
		-webkit-mask-image: linear-gradient(to top, black 0%, black 40%, transparent 100%);
	}
</style>
