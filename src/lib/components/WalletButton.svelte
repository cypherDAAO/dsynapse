<script lang="ts">
	import { web3Store, connectWallet, disconnectWallet } from '$lib/components/web3store';
</script>

<div class="wallet-button">
	{#if $web3Store.isLoading}
		<button disabled>Conectando...</button>
	{:else if $web3Store.isConnected}
		<div class="connected">
			<span class="account">{$web3Store.account?.substring(0, 6)}...{$web3Store.account?.substring($web3Store.account.length - 4)}</span>
			<button on:click={disconnectWallet}>Desconectar</button>
		</div>
	{:else}
		<button on:click={connectWallet}>Conectar Wallet</button>
		{#if $web3Store.error}
			<p class="error">{$web3Store.error}</p>
		{/if}
	{/if}
</div>

<style>
	.wallet-button {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.connected {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.account {
		font-family: monospace;
		padding: 0.5rem;
		background: #f1f1f1;
		border-radius: 4px;
	}

	button {
		background: #4a56e2;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		font-weight: bold;
	}

	button:hover {
		background: #3a46c2;
	}

	button:disabled {
		background: #9ca3f4;
		cursor: wait;
	}

	.error {
		color: red;
		margin-top: 0.5rem;
		font-size: 0.8rem;
	}
</style> 