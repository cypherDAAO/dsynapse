<script lang="ts">
  import { onMount } from 'svelte';
  import { getAllLLMs } from '$lib/contracts/LLMIndexer';
  import type { LLM } from '$lib/contracts/LLMIndexer';
  import { web3Store } from './web3store';

  export let onSelectLLM: (llm: LLM) => void = () => {};
  export let disabled = false;

  let llms: LLM[] = [];
  let isLoading = false;
  let error: string | null = null;
  let selectedLLM: LLM | null = null;
  let isWalletConnected = false;

  // Suscribirse al web3Store para saber si hay una wallet conectada
  const unsubscribe = web3Store.subscribe(state => {
    isWalletConnected = state.isConnected;
    
    // Si la wallet se conecta y no tenemos LLMs, cargarlos
    if (state.isConnected && llms.length === 0 && !isLoading) {
      loadLLMs();
    }
  });

  onMount(() => {
    return unsubscribe;
  });

  async function loadLLMs() {
    if (!isWalletConnected) {
      error = "Conecta tu wallet para ver los prompts disponibles";
      return;
    }

    isLoading = true;
    error = null;

    try {
      llms = await getAllLLMs();
      console.log('🔍 LLMSelector - LLMs cargados de blockchain:', llms);
      
      if (llms.length === 0) {
        error = "No se encontraron LLMs en el contrato";
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Error al cargar LLMs";
      console.error("Error loading LLMs:", err);
    } finally {
      isLoading = false;
    }
  }

  function handleSelect(llm: LLM) {
    selectedLLM = llm;
    console.log('🔍 LLMSelector - LLM seleccionado:', {
      nombre: llm.name,
      cid: llm.cid,
      packedCid: llm.packedCid
    });
    onSelectLLM(llm);
  }
</script>

<div class="">
  <h3 class="text-2xl font-bold mb-4 text-fuchsia-800 dark:text-fuchsia-200">Prompts disponibles en blockchain</h3>
  
  {#if !isWalletConnected}
    <div class="message warning">
      <p>👆 Conecta tu wallet de Ethereum para acceder a los prompts disponibles en la blockchain</p>
    </div>
  {:else if isLoading}
    <div class="loading">Cargando prompts desde la blockchain...</div>
  {:else if error}
    <div class="message error">
      <p>{error}</p>
      <button on:click={loadLLMs} disabled={disabled || isLoading}>
        Reintentar
      </button>
    </div>
  {:else if llms.length === 0}
    <div class="message info">
      <p>No hay prompts disponibles en el contrato</p>
    </div>
  {:else}
    <div class="llms-list">
      {#each llms as llm}
        <div 
          class="llm-item {selectedLLM?.name === llm.name ? 'selected' : ''}"
          on:click={() => handleSelect(llm)}
          on:keydown={(e) => e.key === 'Enter' && handleSelect(llm)}
          tabindex="0"
        >
          <div class="llm-name">{llm.name}</div>
          <div class="llm-cid">{llm.cid.substring(0, 20)}...</div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .llm-selector {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  :global(.dark) .llm-selector {
    background-color: #2d3748;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  .message {
    padding: 0.75rem;
    border-radius: 6px;
    margin-bottom: 1rem;
  }

  .message.warning {
    background-color: #fff3cd;
    color: #856404;
  }

  .message.error {
    background-color: #f8d7da;
    color: #721c24;
  }

  .message.info {
    background-color: #d1ecf1;
    color: #0c5460;
  }

  :global(.dark) .message.warning {
    background-color: #463c1b;
    color: #ffe69c;
  }

  :global(.dark) .message.error {
    background-color: #442223;
    color: #f5c6cb;
  }

  :global(.dark) .message.info {
    background-color: #1a4a54;
    color: #bee5eb;
  }

  .loading {
    font-style: italic;
    color: #6c757d;
  }

  :global(.dark) .loading {
    color: #adb5bd;
  }

  .llms-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 300px;
    overflow-y: auto;
  }

  .llm-item {
    background-color: white;
    padding: 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
  }

  :global(.dark) .llm-item {
    background-color: #374151;
    border-color: #4b5563;
  }

  .llm-item:hover {
    background-color: #f1f5f9;
    transform: translateY(-2px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  :global(.dark) .llm-item:hover {
    background-color: #4b5563;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }

  .llm-item.selected {
    border-color: #3b82f6;
    background-color: #ebf5ff;
  }

  :global(.dark) .llm-item.selected {
    border-color: #60a5fa;
    background-color: #1e3a8a;
  }

  .llm-name {
    font-weight: bold;
    margin-bottom: 0.25rem;
  }

  .llm-cid {
    font-size: 0.8rem;
    color: #6b7280;
    font-family: monospace;
  }

  :global(.dark) .llm-cid {
    color: #9ca3af;
  }
</style> 