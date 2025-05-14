<script lang="ts">
    import ChatLLM from '$lib/components/ChatLLM.svelte';
    import WalletConect from '$lib/components/WalletConect.svelte';
    import LLMSelector from '$lib/components/LLMSelector.svelte';
    import type { LLM } from '$lib/contracts/LLMIndexer';
    import { web3Store } from '$lib/components/web3store';
    import { t } from '$lib/i18n/i18n';
    
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

<section class="mt-[64px] container mx-auto px-4 mb-16">
  {#if !isWalletConnected}
    <!-- Pantalla de conexión de wallet -->
    <div class="flex justify-center items-center min-h-[70vh]">
      <div class="bg-white dark:bg-[#1a1a2e] p-10 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center animate-fadeIn border border-fuchsia-100 dark:border-fuchsia-900/30 backdrop-blur-sm">
        <div class="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 dark:from-fuchsia-900/20 dark:to-fuchsia-800/30 text-fuchsia-600 dark:text-fuchsia-300 mb-8 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
            <path d="M22 10h-4v4h4"></path>
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-fuchsia-50 tracking-tight">{$t('chat.wallet.title')}</h1>
        <p class="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          {$t('chat.wallet.description')}
        </p>
        <div class="mb-8 transform hover:scale-105 transition-transform duration-300">
          <WalletConect />
        </div>
        <div class="flex items-start bg-gradient-to-br from-fuchsia-50 to-transparent dark:from-fuchsia-900/10 dark:to-fuchsia-900/5 p-5 rounded-2xl text-left border border-fuchsia-100/70 dark:border-fuchsia-700/20 backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-4 mt-0.5 text-fuchsia-500 dark:text-fuchsia-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <p class="text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {$t('chat.wallet.info')}
          </p>
        </div>
      </div>
    </div>
  {:else}
    <!-- Interfaz principal cuando la wallet está conectada -->
    <div class="">
      <!-- Barra superior con información de wallet (visible solo en desktop) -->
      <div class="hidden md:flex justify-between items-center mb-6 p-4 bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-lg border border-gray-100 dark:border-fuchsia-900/30 backdrop-blur-sm">
        <div class="flex items-center text-sm text-gray-700 dark:text-fuchsia-200">
          <span class="w-2 h-2 rounded-full bg-fuchsia-500 mr-2 animate-pulse"></span>
          <span>{$t('chat.wallet.connected')}</span>
        </div>
        <div class="transform hover:scale-105 transition-transform duration-300">
          <WalletConect />
        </div>
      </div>
      
      <!-- Contenido principal en dos columnas en desktop, reordenado en móvil -->
      <div class="grid md:grid-cols-[300px_1fr] gap-8">
        <!-- En móvil, el chat aparece primero -->
        <div class="order-2 md:order-2 md:col-start-2">
          <ChatLLM {selectedLLM} {isWalletConnected} />
        </div>
        
        <!-- En móvil, el sidebar aparece después del chat -->
        <div class="order-3 md:order-1 md:col-start-1 md:row-start-1 bg-white dark:bg-[#1a1a2e] rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-fuchsia-900/30 mt-8 md:mt-0 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
          <h2 class="text-xl sm:text-2xl font-bold mb-4 text-fuchsia-700 dark:text-fuchsia-300 tracking-tight">{$t('chat.prompts.title')}</h2>
          <LLMSelector onSelectLLM={handleSelectLLM} />
        </div>
        
        <!-- Barra inferior con información de wallet (visible solo en móvil) -->
        <div class="order-1 md:hidden flex justify-between items-center mb-6 p-4 bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-lg border border-gray-100 dark:border-fuchsia-900/30 backdrop-blur-sm">
          <div class="flex items-center text-sm text-gray-700 dark:text-fuchsia-200">
            <span class="w-2 h-2 rounded-full bg-fuchsia-500 mr-2 animate-pulse"></span>
            <span>{$t('chat.wallet.connected')}</span>
          </div>
          <div class="transform hover:scale-105 transition-transform duration-300">
            <WalletConect />
          </div>
        </div>
      </div>
    </div>
  {/if}
</section>

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out;
  }
  
  /* Estilo global para mejorar el tema oscuro */
  :global(body.dark) {
    background-color: #0f0f23;
    background-image: radial-gradient(circle at top right, rgba(139, 92, 246, 0.05), transparent 400px);
  }
  
  :global(.dark) :global(.backdrop-blur-sm) {
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
</style>