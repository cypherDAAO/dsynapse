<script lang="ts">
	import WalletButton from '$lib/components/WalletButton.svelte';
</script>

<main>
	<h1>Conexión a Ethereum con SvelteKit</h1>
	<div class="wallet-container">
		<WalletButton />
	</div>
	
	<div class="actions">
		<a href="/wallet/test" class="test-link">Ir a Modo de Prueba</a>
	</div>
</main>

<style>
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
	
	.actions {
		margin-top: 2rem;
	}
	
	.test-link {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: #f0f0f0;
		color: #666;
		text-decoration: none;
		border-radius: 4px;
		font-weight: bold;
		transition: all 0.2s ease;
	}
	
	.test-link:hover {
		background: #e0e0e0;
		color: #444;
	}
</style> 