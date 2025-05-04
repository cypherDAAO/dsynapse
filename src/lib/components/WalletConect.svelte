<!-- src/lib/components/WalletConnect.svelte -->
<script>
    import { web3Store, connectWallet, disconnectWallet } from '$lib/stores/web3Store.js';
    import { onDestroy } from 'svelte';

    // Suscribirse al store para obtener valores reactivos
    let provider = null;
    let account = null;
    let isConnected = false;
    let isLoading = false;
    let error = null;

    const unsubscribe = web3Store.subscribe(state => {
        provider = state.provider;
        account = state.account;
        isConnected = state.isConnected;
        isLoading = state.isLoading;
        error = state.error;
    });

    // Limpiar suscripción al destruir componente
    onDestroy(unsubscribe);
</script>

<div class="wallet-container">
    {#if isLoading}
        <button disabled>Conectando...</button>
    {:else if isConnected && account}
        <div class="wallet-info">
            <span>Conectado: {account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
            <button on:click={disconnectWallet}>Desconectar</button>
        </div>
    {:else}
        <button on:click={connectWallet}>Conectar Billetera</button>
    {/if}

    {#if error}
        <p class="error">Error: {error}</p>
    {/if}
</div>

<style>
    .wallet-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .wallet-info {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .wallet-info span {
        font-family: monospace;
        background-color: #e0e0e0;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
    }
    
    button {
        padding: 0.5rem 1rem;
        cursor: pointer;
    }
    
    .error {
        color: red;
        font-size: 0.9em;
        margin-top: 0.5rem;
    }
</style>