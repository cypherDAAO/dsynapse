<script lang="ts">
    import { onMount } from 'svelte';
    import * as webllm from '@mlc-ai/web-llm';
    
    // Estado del componente
    let chatMessages: {role: string, content: string}[] = [];
    let inputMessage = '';
    let isLoading = false;
    let modelLoaded = false;
    let statusMessage = 'Preparando el modelo...';
    let selectedModel = 'Llama-3.1-8B-Instruct-q4f32_1-MLC';
    
    let engine: webllm.MLCEngineInterface;
    
    // Función para inicializar el motor
    async function initializeEngine() {
      isLoading = true;
      try {
        engine = await webllm.CreateMLCEngine(
          selectedModel,
          {
            initProgressCallback: (progress) => {
              statusMessage = progress.text;
            }
          }
        );
        modelLoaded = true;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        statusMessage = `Error al inicializar: ${errorMessage}`;
        console.error(error);
      } finally {
        isLoading = false;
      }
    }
    
    // Función para enviar mensaje
    async function sendMessage() {
      if (!inputMessage.trim() || !modelLoaded) return;
      
      // Añadir mensaje del usuario
      chatMessages = [...chatMessages, { role: 'user', content: inputMessage }];
      const messageToSend = inputMessage;
      inputMessage = '';
      isLoading = true;
      
      try {
        // Preparar todos los mensajes para la API
        const messages = [
          { role: "system", content: "Eres un asistente de IA útil y preciso." },
          ...chatMessages.map(msg => ({ 
            role: msg.role, 
            content: msg.content 
          }))
        ];
        
        // Llamada a la API para generar respuesta
        const response = await engine.chat.completions.create({
          messages: messages as any,
          temperature: 0.7,
          max_tokens: 500
        });
        
        // Añadir respuesta de la IA
        const assistantContent = response.choices[0]?.message?.content || 'No se pudo generar una respuesta';
        chatMessages = [...chatMessages, 
          { role: 'assistant', content: assistantContent }
        ];
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        statusMessage = `Error al generar respuesta: ${errorMessage}`;
        console.error(error);
      } finally {
        isLoading = false;
      }
    }
    
    // Inicializar al montar el componente
    onMount(() => {
      initializeEngine();
    });
  </script>
  
  <div class="chat-container">
    <header>
      <h1>Chat con IA en el navegador</h1>
      <p class="status-message">{statusMessage}</p>
    </header>
    
    <main class="chat-messages">
      {#if chatMessages.length === 0}
        <div class="empty-state">
          {#if modelLoaded}
            <p>¡Escribe tu primer mensaje para comenzar!</p>
          {:else}
            <p>Cargando modelo de IA ({selectedModel})...</p>
          {/if}
        </div>
      {:else}
        {#each chatMessages as message}
          <div class="message {message.role}">
            <p>{message.content}</p>
          </div>
        {/each}
      {/if}
      
      {#if isLoading && chatMessages.length > 0}
        <div class="message assistant loading">
          <p>Pensando...</p>
        </div>
      {/if}
    </main>
    
    <footer class="chat-input">
      <input
        bind:value={inputMessage}
        placeholder="Escribe tu mensaje..."
        disabled={!modelLoaded || isLoading}
        on:keydown={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button on:click={sendMessage} disabled={!modelLoaded || isLoading}>
        Enviar
      </button>
    </footer>
  </div>
  
  <style>
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
      background-color: transparent;
    }
    
    header {
      text-align: center;
      margin-bottom: 1rem;
    }
    
    .status-message {
      font-size: 0.8rem;
      color: #666;
    }
    
    :global(.dark) .status-message {
      color: #aaa;
    }
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      transition: background-color 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    :global(.dark) .chat-messages {
      background-color: #1f2937;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
    
    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      color: #666;
    }
    
    :global(.dark) .empty-state {
      color: #aaa;
    }
    
    .message {
      padding: 0.8rem;
      border-radius: 0.5rem;
      margin-bottom: 0.8rem;
      max-width: 80%;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .message.user {
      background-color: #e3f2fd;
      margin-left: auto;
    }
    
    :global(.dark) .message.user {
      background-color: #1e3a5f;
      color: #f3f4f6;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    
    .message.assistant {
      background-color: #fff;
      margin-right: auto;
    }
    
    :global(.dark) .message.assistant {
      background-color: #374151;
      color: #f3f4f6;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    
    .message.loading {
      opacity: 0.7;
    }
    
    .chat-input {
      display: flex;
      gap: 0.5rem;
    }
    
    input {
      flex: 1;
      padding: 0.8rem;
      border: 1px solid #ddd;
      border-radius: 0.5rem;
      background-color: #fff;
      color: #333;
      transition: all 0.3s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    :global(.dark) input {
      background-color: #374151;
      color: #f3f4f6;
      border-color: #4b5563;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    
    button {
      padding: 0.8rem 1.5rem;
      background-color: #2196f3;
      color: white;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: background-color 0.3s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    :global(.dark) button {
      background-color: #3b82f6;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    
    button:hover {
      background-color: #1976d2;
    }
    
    :global(.dark) button:hover {
      background-color: #2563eb;
    }
    
    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
    
    :global(.dark) button:disabled {
      background-color: #4b5563;
      color: #9ca3af;
    }

    :global(html), :global(body) {
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
    }

    :global(.dark) {
      background-color: #111827;
      color: #f3f4f6;
    }
  </style>