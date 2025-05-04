<script lang="ts">
    import { onMount } from 'svelte';
    import * as webllm from '@mlc-ai/web-llm';
    import type { LLM } from '$lib/contracts/LLMIndexer';
    
    // Añadir los props para recibir LLM seleccionado y estado de wallet
    export let selectedLLM: LLM | null = null;
    export let isWalletConnected: boolean = false;
    
    // Interfaces para tipos
    interface MultiAddr {
      toString: () => string;
    }
    
    interface PeerConnectEvent {
      detail: {
        toString: () => string;
      };
    }
    
    interface PubSubMessageEvent {
      detail: {
        topic: string;
        data: Uint8Array;
      };
    }
    
    interface PeerProvider {
      id: {
        toString: () => string;
      };
      multiaddrs: MultiAddr[];
    }
    
    // Estado del componente
    let chatMessages: {role: string, content: string}[] = [];
    let inputMessage = '';
    let isLoading = false;
    let modelLoaded = false;
    let statusMessage = 'Preparando el modelo...';
    let selectedModel = 'Llama-3.1-8B-Instruct-q4f32_1-MLC';
    let ipfsCid = '';
    let systemPrompt = "Eres un asistente de IA útil y preciso.";
    let isLoadingPrompt = false;
    let heliaLoaded = false;
    let heliaInstance: any;
    let heliaError = '';
    let isPinned = false;
    let isPinning = false;
    let peersSharing: string[] = [];
    let pubsubTopic = '';
    
    let engine: webllm.MLCEngineInterface;
    
    // Vigilar cambios en selectedLLM para actualizar ipfsCid
    $: if (selectedLLM && selectedLLM.cid) {
      console.log('🔍 ChatLLM - selectedLLM detectado:', {
        nombre: selectedLLM.name,
        cid: selectedLLM.cid,
        packedCid: selectedLLM.packedCid
      });
      
      ipfsCid = selectedLLM.cid;
      console.log('🔍 ChatLLM - ipfsCid actualizado:', ipfsCid);
      
      // Solo cargar automáticamente si Helia ya está inicializado
      if (heliaLoaded) {
        console.log('🔍 ChatLLM - Helia ya inicializado, cargando prompt desde IPFS');
        loadPromptFromIPFS();
      } else {
        // Si Helia aún no está inicializado, inicializarlo y luego cargar el prompt
        console.log('🔍 ChatLLM - Inicializando Helia para cargar prompt');
        initializeHelia().then(heliaInitialized => {
          if (heliaInitialized) {
            console.log('🔍 ChatLLM - Helia inicializado correctamente, cargando prompt');
            loadPromptFromIPFS();
          } else {
            console.error('❌ ChatLLM - Error al inicializar Helia');
          }
        });
      }
    }
    
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
    
    // Función para inicializar Helia bajo demanda
    async function initializeHelia() {
      if (heliaLoaded) return true;
      
      try {
        statusMessage = "Inicializando Helia...";
        // Importaciones dinámicas para que no se carguen al inicio
        const { createHelia } = await import('helia');
        
        // Crear Helia con la configuración por defecto
        // que es más estable para el navegador
        heliaInstance = await createHelia();
        
        // Obtener el ID del peer local
        const peerId = heliaInstance.libp2p.peerId.toString();
        console.log('🔌 Conectado a IPFS como:', peerId);
        console.log('🌐 Direcciones disponibles:', heliaInstance.libp2p.getMultiaddrs().map((addr: MultiAddr) => addr.toString()));
        
        // Verificar capacidades disponibles
        console.log('✅ Capacidades disponibles en esta instancia de Helia:');
        console.log('- ContentRouting:', heliaInstance.libp2p.contentRouting ? '✓' : '✗');
        console.log('- DHT:', heliaInstance.libp2p.dht ? '✓' : '✗');
        console.log('- PubSub:', heliaInstance.libp2p.pubsub ? '✓' : '✗');
        
        heliaLoaded = true;
        statusMessage = "Helia inicializado correctamente";
        
        // Escuchar a conexiones entrantes
        heliaInstance.libp2p.addEventListener('peer:connect', (evt: PeerConnectEvent) => {
          const remotePeerId = evt.detail.toString();
          console.log('🔗 Nuevo peer conectado:', remotePeerId);
        });
        
        return true;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        heliaError = errorMessage;
        statusMessage = `Error al inicializar Helia: ${errorMessage}`;
        console.error('Error detallado al inicializar Helia:', error);
        return false;
      }
    }
    
    // Función para suscribirse a actualizaciones sobre un CID específico
    async function subscribeToContentUpdates(cid: any) {
      try {
        // Crear un tema único basado en el CID
        pubsubTopic = `/ipfs/sharing/${cid.toString()}`;
        
        // Comprobar si tenemos acceso a pubsub
        if (!heliaInstance.libp2p.pubsub) {
          console.warn('PubSub no disponible, no se puede monitorear a otros usuarios');
          return;
        }
        
        // Suscribirse al tema
        await heliaInstance.libp2p.pubsub.subscribe(pubsubTopic);
        console.log('📡 Suscrito al canal de compartición:', pubsubTopic);
        
        // Escuchar a mensajes en este tema
        heliaInstance.libp2p.pubsub.addEventListener('message', (evt: PubSubMessageEvent) => {
          if (evt.detail.topic !== pubsubTopic) return;
          
          // Decodificar el mensaje
          try {
            const decoder = new TextDecoder();
            const msgData = JSON.parse(decoder.decode(evt.detail.data));
            
            // Verificar que no sea nuestro propio mensaje
            if (msgData.peerId !== heliaInstance.libp2p.peerId.toString()) {
              console.log(`👤 Usuario ${msgData.peerId} está accediendo al mismo contenido`, msgData);
              
              // Añadir a la lista de peers si no existe
              if (!peersSharing.includes(msgData.peerId)) {
                peersSharing = [...peersSharing, msgData.peerId];
                console.log(`📊 Total de usuarios compartiendo: ${peersSharing.length}`);
              }
            }
          } catch (err) {
            console.warn('Error al procesar mensaje:', err);
          }
        });
        
        // Con o sin PubSub, podemos intentar usar otras formas de descubrir peers
        try {
          if (heliaInstance.libp2p.contentRouting) {
            console.log('🔍 Buscando otros proveedores para este contenido...');
            for await (const provider of heliaInstance.libp2p.contentRouting.findProviders(cid)) {
              console.log('👥 Otro proveedor encontrado:', provider.id.toString());
              
              // Añadir a la lista de peers si no existe y no es nuestro propio ID
              const providerId = provider.id.toString();
              if (providerId !== heliaInstance.libp2p.peerId.toString() && 
                  !peersSharing.includes(providerId)) {
                peersSharing = [...peersSharing, providerId];
                console.log(`📊 Proveedor añadido. Total de usuarios compartiendo: ${peersSharing.length}`);
              }
            }
          }
        } catch (err) {
          console.warn('Error al buscar otros proveedores:', err);
        }
        
        // Si PubSub está disponible, anunciar nuestra presencia
        if (heliaInstance.libp2p.pubsub) {
          announcePresence();
          // Configurar anuncios periódicos cada 30 segundos
          setInterval(announcePresence, 30000);
        }
        
      } catch (error) {
        console.warn('Error al configurar la monitorización de usuarios:', error);
      }
    }
    
    // Función para anunciar nuestra presencia a otros usuarios
    async function announcePresence() {
      if (!heliaInstance?.libp2p?.pubsub || !pubsubTopic) return;
      
      try {
        const message = {
          peerId: heliaInstance.libp2p.peerId.toString(),
          timestamp: Date.now(),
          action: 'sharing'
        };
        
        const encoder = new TextEncoder();
        const msgData = encoder.encode(JSON.stringify(message));
        
        await heliaInstance.libp2p.pubsub.publish(pubsubTopic, msgData);
        console.log('📢 Anunciada presencia en la red');
      } catch (err) {
        console.warn('Error al anunciar presencia:', err);
      }
    }
    
    // Función para cargar prompt desde IPFS usando Helia
    async function loadPromptFromIPFS() {
      if (!ipfsCid.trim()) return;
      
      console.log('🔍 ChatLLM - Iniciando carga de prompt desde IPFS. CID:', ipfsCid);
      isLoadingPrompt = true;
      statusMessage = "Preparando para cargar desde IPFS...";
      peersSharing = []; // Reiniciar la lista de peers
      
      try {
        // Inicializar Helia si aún no está inicializado
        const heliaReady = await initializeHelia();
        if (!heliaReady) {
          throw new Error("No se pudo inicializar Helia: " + heliaError);
        }
        
        statusMessage = "Cargando prompt desde IPFS...";
        console.log('🔍 Buscando contenido con CID:', ipfsCid);
        
        // Importaciones dinámicas
        const { strings } = await import('@helia/strings');
        const { unixfs } = await import('@helia/unixfs');
        const { CID } = await import('multiformats/cid');
        
        // Crear instancia para manejar strings con Helia
        const s = strings(heliaInstance);
        const fs = unixfs(heliaInstance);
        
        // Convertir string a CID
        const cid = CID.parse(ipfsCid);
        
        // Iniciar escucha de actualizaciones sobre este contenido
        subscribeToContentUpdates(cid);
        
        // Log de los proveedores antes de intentar recuperar
        console.log('🌍 Buscando proveedores para:', cid.toString());
        if (heliaInstance.libp2p.contentRouting) {
          try {
            for await (const provider of heliaInstance.libp2p.contentRouting.findProviders(cid)) {
              console.log('📍 Proveedor encontrado:', provider.id.toString(), 'con direcciones:', 
                provider.multiaddrs.map((addr: MultiAddr) => addr.toString()));
            }
          } catch (err) {
            console.warn('Error al buscar proveedores:', err);
          }
        }
        
        try {
          // Intentar obtener como string
          const startTime = Date.now();
          systemPrompt = await s.get(cid);
          const endTime = Date.now();
          statusMessage = "Prompt cargado correctamente como String";
          console.log(`⏱️ Contenido cargado en ${endTime - startTime}ms`);
          console.log('📄 Contenido:', systemPrompt.substring(0, 100) + '...');
          console.log('🔍 ChatLLM - System Prompt completo:', systemPrompt);
          
          // Iniciar el pinning automáticamente
          pinContent(cid);
        } catch (error) {
          // Si falla como string, intentar como unixfs
          console.log('❌ Error al cargar como string, intentando como UnixFS');
          let content = '';
          const startTime = Date.now();
          for await (const chunk of fs.cat(cid)) {
            const decoder = new TextDecoder();
            content += decoder.decode(chunk, { stream: true });
          }
          const endTime = Date.now();
          
          if (content) {
            systemPrompt = content;
            statusMessage = "Prompt cargado correctamente como UnixFS";
            console.log(`⏱️ Contenido cargado como UnixFS en ${endTime - startTime}ms`);
            console.log('📄 Contenido:', content.substring(0, 100) + '...');
            console.log('🔍 ChatLLM - System Prompt completo:', systemPrompt);
            
            // Iniciar el pinning automáticamente
            pinContent(cid);
          } else {
            throw new Error("No se pudo cargar el contenido del CID");
          }
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        statusMessage = `Error al cargar el prompt: ${errorMessage}`;
        console.error('🚫 Error completo:', error);
      } finally {
        isLoadingPrompt = false;
      }
    }
    
    // Función para hacer pin del contenido en IPFS
    async function pinContent(cid: any) {
      if (isPinning || isPinned) return;
      
      isPinning = true;
      try {
        statusMessage = "Anclando contenido en IPFS (compartiendo recursos)...";
        console.log('📌 Iniciando proceso de anclaje para:', cid.toString());
        
        // En lugar de usar un módulo dedicado de pins, usar directamente el blockstore de Helia
        // Esto asegura que los bloques permanezcan en el almacenamiento local
        
        // Si tenemos acceso al CID, significa que ya está en nuestro blockstore
        // Solo necesitamos mantener la referencia y anunciar a la red
        
        // Anunciar el contenido a la red
        try {
          // Importar el módulo de libp2p
          const libp2p = heliaInstance.libp2p;
          
          // Anunciar que tenemos este contenido a la DHT
          if (libp2p.contentRouting) {
            await libp2p.contentRouting.provide(cid);
            console.log('📣 Contenido anunciado correctamente a la red IPFS mediante contentRouting');
          }
          
          // También podemos intentar publicar en la DHT de libp2p si está disponible
          if (libp2p.dht) {
            await libp2p.dht.provide(cid);
            console.log('📣 Contenido provisto a través de DHT');
            
            // Intentar encontrar peers cercanos
            for await (const peer of libp2p.dht.getClosestPeers(cid.bytes)) {
              console.log('👥 Peer cercano encontrado:', peer.toString());
            }
          }
          
          isPinned = true;
          statusMessage = "Contenido anclado correctamente. ¡Estás contribuyendo a la red!";
          console.log('✅ Anclaje completado exitosamente');
        } catch (err) {
          console.warn('⚠️ No se pudo anunciar el contenido, pero sigue disponible localmente', err);
          // Consideramos que está pinneado aunque no se haya podido anunciar
          isPinned = true;
          statusMessage = "Contenido almacenado localmente, pero con limitaciones para compartir";
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error('❌ Error al hacer pin del contenido:', errorMessage);
        statusMessage = "Contenido cargado, pero no se pudo anclar para compartir";
      } finally {
        isPinning = false;
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
          { role: "system", content: systemPrompt },
          ...chatMessages.map(msg => ({ 
            role: msg.role, 
            content: msg.content 
          }))
        ];
        
        console.log('🔍 ChatLLM - Enviando mensajes a la IA:', messages);
        
        // Llamada a la API para generar respuesta
        const response = await engine.chat.completions.create({
          messages: messages as any,
          temperature: 0.7,
          max_tokens: 500
        });
        
        console.log('🔍 ChatLLM - Respuesta de la IA:', response);
        
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
      
      {#if !isWalletConnected}
        <div class="wallet-warning">
          <p>Conecta tu wallet para acceder a los prompts de la blockchain</p>
        </div>
      {:else if selectedLLM}
        <div class="selected-llm">
          <p>Prompt cargado: <strong>{selectedLLM.name}</strong></p>
          <p class="cid-info">CID: {selectedLLM.cid.substring(0, 20)}...</p>
        </div>
      {:else}
        <div class="select-prompt-message">
          <p>Selecciona un prompt de la lista para comenzar</p>
        </div>
      {/if}
      
      <p class="status-message">{statusMessage}</p>
      {#if isPinned}
        <p class="sharing-info">🌐 Estás compartiendo recursos con la red IPFS - ¡Gracias por contribuir!</p>
        {#if peersSharing.length > 0}
          <p class="peers-info">👥 {peersSharing.length} usuario(s) adicional(es) están accediendo a este contenido</p>
        {/if}
      {/if}
    </header>
    
    <main class="chat-messages">
      {#if chatMessages.length === 0}
        <div class="empty-state">
          {#if !isWalletConnected}
            <p>Conecta tu wallet para comenzar</p>
          {:else if !selectedLLM}
            <p>Selecciona un prompt para comenzar</p>
          {:else if modelLoaded}
            <p>¡Escribe tu primer mensaje para comenzar!</p>
            {#if systemPrompt !== "Eres un asistente de IA útil y preciso."}
              <p class="prompt-loaded">Prompt especializado cargado</p>
            {/if}
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
        placeholder={isWalletConnected && selectedLLM ? "Escribe tu mensaje..." : "Conecta tu wallet y selecciona un prompt para comenzar"}
        disabled={!isWalletConnected || !selectedLLM || !modelLoaded || isLoading}
        on:keydown={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button 
        on:click={sendMessage} 
        disabled={!isWalletConnected || !selectedLLM || !modelLoaded || isLoading}>
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
    
    .wallet-warning {
      background-color: #fff3cd;
      color: #856404;
      padding: 0.75rem;
      border-radius: 0.5rem;
      margin: 1rem 0;
    }
    
    :global(.dark) .wallet-warning {
      background-color: #463c1b;
      color: #ffe69c;
    }
    
    .selected-llm {
      background-color: #d1e7dd;
      color: #0f5132;
      padding: 0.75rem;
      border-radius: 0.5rem;
      margin: 1rem 0;
    }
    
    :global(.dark) .selected-llm {
      background-color: #1f2937;
      color: #10b981;
      border: 1px solid #10b981;
    }
    
    .cid-info {
      font-size: 0.75rem;
      margin-top: 0.25rem;
      opacity: 0.8;
    }
    
    .select-prompt-message {
      background-color: #e0f2fe;
      color: #0369a1;
      padding: 0.75rem;
      border-radius: 0.5rem;
      margin: 1rem 0;
    }
    
    :global(.dark) .select-prompt-message {
      background-color: #1e3a8a;
      color: #60a5fa;
    }
    
    .sharing-info {
      color: #388e3c;
      font-weight: bold;
      font-size: 0.9rem;
      padding: 0.5rem;
      background-color: rgba(56, 142, 60, 0.1);
      border-radius: 0.5rem;
      margin-top: 0.5rem;
    }
    
    .peers-info {
      color: #ff9800;
      font-weight: bold;
      font-size: 0.9rem;
      padding: 0.5rem;
      background-color: rgba(255, 152, 0, 0.1);
      border-radius: 0.5rem;
      margin-top: 0.5rem;
    }
    
    :global(.dark) .sharing-info {
      color: #4caf50;
      background-color: rgba(76, 175, 80, 0.1);
    }
    
    :global(.dark) .peers-info {
      color: #ffc107;
      background-color: rgba(255, 193, 7, 0.1);
    }
    
    .prompt-loaded {
      color: #2196f3;
      font-weight: bold;
    }
    
    :global(.dark) .prompt-loaded {
      color: #3b82f6;
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
      flex-direction: column;
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