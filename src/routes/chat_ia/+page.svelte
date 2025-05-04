<script lang="ts">
    import ChatLLM from '$lib/components/ChatLLM.svelte';
    import WalletConect from '$lib/components/WalletConect.svelte';
    import LLMSelector from '$lib/components/LLMSelector.svelte';
    import type { LLM } from '$lib/contracts/LLMIndexer';
    import { web3Store } from '$lib/components/web3store';
    
    let selectedLLM: LLM | null = null;
    let isWalletConnected = false;
    
    // Suscribirse al estado de la wallet
    const unsubscribe = web3Store.subscribe(state => {
      const prevConnected = isWalletConnected;
      isWalletConnected = state.isConnected;
      
      if (prevConnected !== isWalletConnected) {
        console.log('🔍 ChatPage - Estado de wallet actualizado:', { 
          conectada: isWalletConnected,
          cuenta: state.account
        });
      }
    });
    
    function handleSelectLLM(llm: LLM) {
      console.log('🔍 ChatPage - LLM seleccionado en la página:', llm);
      selectedLLM = llm;
    }
</script>

<section class="mt-[64px] container mx-auto px-4">
  <div class="wallet-section {isWalletConnected ? 'connected' : ''}">
    <h2>Conecta tu Wallet</h2>
    <p class="description">
      <strong>Importante:</strong> Debes conectar tu wallet de Ethereum para acceder a los prompts almacenados en la blockchain.
    </p>
    <WalletConect />
  </div>
  
  {#if isWalletConnected}
    <div class="llm-section">
      <LLMSelector onSelectLLM={handleSelectLLM} />
    </div>
    
    <ChatLLM {selectedLLM} {isWalletConnected} />
  {:else}
    <div class="locked-message">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      <h3>Acceso Bloqueado</h3>
      <p>Para utilizar el chat con IA, primero debes conectar tu wallet de Ethereum.</p>
    </div>
  {/if}
</section>

<style>
    :global(body) {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
        Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      background-color: #fafafa;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    :global(.dark) :global(body) {
      background-color: #111827;
      color: #f3f4f6;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .wallet-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #f97316;
      transition: all 0.3s ease;
    }
    
    .wallet-section.connected {
      border-left-color: #10b981;
    }
    
    :global(.dark) .wallet-section {
      background-color: #1f2937;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    h2 {
      margin-top: 0;
      font-size: 1.5rem;
      margin-bottom: 0.75rem;
    }
    
    .description {
      margin-bottom: 1.5rem;
      color: #4b5563;
    }
    
    :global(.dark) .description {
      color: #9ca3af;
    }
    
    .llm-section {
      margin-bottom: 2rem;
    }
    
    .locked-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      text-align: center;
      color: #6b7280;
    }
    
    :global(.dark) .locked-message {
      background-color: #1f2937;
      color: #9ca3af;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .locked-message svg {
      margin-bottom: 1rem;
      color: #f97316;
    }
    
    :global(.dark) .locked-message svg {
      color: #f59e0b;
    }
    
    .locked-message h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    
    .locked-message p {
      max-width: 400px;
    }
</style>