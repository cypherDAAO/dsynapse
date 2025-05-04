<!-- src/lib/components/WalletConnect.svelte -->
<script lang="ts">
    import { web3Store, connectWallet, disconnectWallet } from './web3store';
    import { onDestroy } from 'svelte';
    import { t } from '$lib/i18n/i18n';

    // Suscribirse al store para obtener valores reactivos
    let provider: any = null;
    let account: string | null = null;
    let isConnected: boolean = false;
    let isLoading: boolean = false;
    let error: string | null = null;

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
        <button class="btn-connect loading" disabled>
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{$t('chat.wallet.status.connecting')}</span>
        </button>
    {:else if isConnected && account}
        <div class="wallet-info">
            <span class="account-display">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
            </span>
            <button class="btn-disconnect" on:click={disconnectWallet}>
                {$t('chat.wallet.disconnect')}
            </button>
        </div>
    {:else}
        <button class="btn-connect" on:click={connectWallet}>
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span>{$t('chat.wallet.connect')}</span>
        </button>
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
        width: 100%;
    }
    
    .wallet-info {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
    }
    
    .account-display {
        display: flex;
        align-items: center;
        font-family: monospace;
        background-color: rgba(255, 255, 255, 0.1);
        padding: 0.4rem 0.75rem;
        border-radius: 8px;
        border: 1px solid rgba(139, 92, 246, 0.3);
        color: #6b7280;
        font-size: 0.9rem;
        font-weight: 500;
        flex-grow: 1;
    }
    
    :global(.dark) .account-display {
        background-color: rgba(255, 255, 255, 0.05);
        color: #d1d5db;
        border-color: rgba(139, 92, 246, 0.2);
    }
    
    .btn-connect {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.75rem 1.5rem;
        font-weight: 600;
        border-radius: 9999px;
        cursor: pointer;
        transition: all 0.2s ease;
        background: linear-gradient(135deg, #c026d3 0%, #9333ea 100%);
        color: white;
        border: none;
        box-shadow: 0 4px 12px rgba(192, 38, 211, 0.2);
        width: 100%;
        font-size: 1rem;
        position: relative;
        overflow: hidden;
    }
    
    .btn-connect::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: 0.5s;
    }
    
    .btn-connect:hover::before {
        left: 100%;
    }
    
    .btn-connect:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(192, 38, 211, 0.4);
    }
    
    .btn-connect:active {
        transform: translateY(0);
    }
    
    .btn-connect.loading {
        background: linear-gradient(135deg, #9333ea 0%, #8b5cf6 100%);
        cursor: not-allowed;
        opacity: 0.8;
    }
    
    .btn-disconnect {
        padding: 0.5rem 1rem;
        cursor: pointer;
        background-color: transparent;
        color: #4b5563;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        font-size: 0.875rem;
        transition: all 0.2s ease;
    }
    
    :global(.dark) .btn-disconnect {
        color: #d1d5db;
        border-color: #374151;
    }
    
    .btn-disconnect:hover {
        background-color: #f3f4f6;
        color: #111827;
    }
    
    :global(.dark) .btn-disconnect:hover {
        background-color: #1f2937;
        color: #f9fafb;
    }
    
    .error {
        color: #ef4444;
        font-size: 0.9em;
        margin-top: 0.5rem;
        background-color: rgba(239, 68, 68, 0.1);
        padding: 0.5rem;
        border-radius: 6px;
        border-left: 3px solid #ef4444;
    }
    
    .animate-spin {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
</style>