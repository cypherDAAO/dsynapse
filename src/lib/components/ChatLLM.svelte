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
      } catch (error) {
        statusMessage = `Error al inicializar: ${error.message}`;
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
          ...chatMessages
        ];
        
        // Llamada a la API para generar respuesta
        const response = await engine.chat.completions.create({
          messages,
          temperature: 0.7,
          max_tokens: 500
        });
        
        // Añadir respuesta de la IA
        chatMessages = [...chatMessages, 
          { role: 'assistant', content: response.choices[0].message.content }
        ];
      } catch (error) {
        statusMessage = `Error al generar respuesta: ${error.message}`;
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
    }
    
    header {
      text-align: center;
      margin-bottom: 1rem;
    }
    
    .status-message {
      font-size: 0.8rem;
      color: #666;
    }
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      color: #666;
    }
    
    .message {
      padding: 0.8rem;
      border-radius: 0.5rem;
      margin-bottom: 0.8rem;
      max-width: 80%;
    }
    
    .message.user {
      background-color: #e3f2fd;
      margin-left: auto;
    }
    
    .message.assistant {
      background-color: #fff;
      margin-right: auto;
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
    }
    
    button {
      padding: 0.8rem 1.5rem;
      background-color: #2196f3;
      color: white;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
    }
    
    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  </style>