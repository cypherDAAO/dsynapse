<script>
  import { onMount } from 'svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  
  let menuOpen = false;
  let scrolled = false;
  
  function toggleMenu() {
    menuOpen = !menuOpen;
  }
  
  // Cerrar el menú en pantallas pequeñas cuando se hace clic en un enlace
  function closeMenu() {
    if (window.innerWidth < 768) {
      menuOpen = false;
    }
  }

  // Detectar scroll para cambiar el estilo del navbar
  onMount(() => {
    const handleScroll = () => {
      scrolled = window.scrollY > 0;
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<nav class={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 pointer-events-none ${scrolled ? 'backdrop-blur bg-black/20' : ''}`}>
  <div class="w-full px-2 sm:px-6 lg:px-8 mx-0">
    <div class="relative flex h-16 items-center justify-between z-50 max-w-7xl mx-auto py-4 pointer-events-auto">
      <!-- Botón de menú móvil -->
      <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
        <button 
          on:click={toggleMenu}
          class="relative rounded-full bg-black/30 px-3 py-2 shadow-lg backdrop-blur-sm transition hover:bg-black/40 hover:cursor-pointer"
        >
          <span class="absolute -inset-0.5"></span>
          <span class="sr-only">Menú</span>
          {#if menuOpen}
            <!-- Icono X -->
            <svg class="block h-6 w-6 stroke-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          {:else}
            <!-- Icono menú hamburguesa -->
            <svg class="block h-6 w-6 stroke-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          {/if}
        </button>
      </div>

      <div class="flex flex-1 items-center justify-center sm:justify-start">
        <!-- Logo -->
        <div class="flex flex-shrink-0 items-center md:mr-2">
          <a href="/" class="flex items-center">
            <span class="text-xl font-bold text-gray-800 dark:text-white drop-shadow-md">DSynapse</span>
          </a>
        </div>
        
        <!-- Enlaces de navegación (escritorio) -->
        <div class="hidden sm:block">
          <div class="flex gap-x-4">
            <a href="/" 
               class="text-gray-800 dark:text-white drop-shadow-md hover:bg-black/20 hover:text-white rounded-lg px-3 py-2 font-medium text-lg">
              Inicio
            </a>
            <a href="/chat_ia" 
               class="text-gray-800 dark:text-white drop-shadow-md hover:bg-black/20 hover:text-white rounded-lg px-3 py-2 font-medium text-lg">
              Chat IA
            </a>
          </div>
        </div>
      </div>
      
      <!-- Botones de acción (escritorio) -->
      <div class="absolute inset-y-0 right-0 flex items-center sm:static sm:inset-auto sm:ml-6 sm:pr-0">
        <ThemeToggle />
      </div>
    </div>
  </div>

  <!-- Menú móvil (desplegable) con animación de deslizamiento -->
  <div class="fixed inset-0 z-40 overflow-hidden pointer-events-none" style="display: {menuOpen ? 'block' : 'none'}">
    <div class="fixed inset-0 bg-black/50 pointer-events-auto" on:click={toggleMenu} aria-hidden="true"></div>
    
    <div class="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
      <div class="pointer-events-auto w-screen max-w-xs transform transition duration-300 ease-in-out"
           style="transform: {menuOpen ? 'translateX(0)' : 'translateX(-100%)'}">
        <div class="flex h-full flex-col overflow-y-scroll bg-white dark:bg-gray-900 shadow-xl">
          <div class="px-4 py-6">
            <div class="flex items-center justify-between mb-4">
              <div class="text-xl font-bold text-gray-800 dark:text-white">Menú</div>
              <button
                type="button"
                class="rounded-md bg-white dark:bg-gray-900 text-gray-700 dark:text-white hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                on:click={toggleMenu}
              >
                <span class="sr-only">Cerrar menú</span>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div>
              <ul class="space-y-2">
                <li>
                  <a 
                    href="/" 
                    on:click={closeMenu}
                    class="block px-3 py-2 rounded-md text-base font-medium text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    Inicio
                  </a>
                </li>
                <li>
                  <a 
                    href="/chat_ia" 
                    on:click={closeMenu}
                    class="block px-3 py-2 rounded-md text-base font-medium text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    Chat IA
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</nav>

<!-- Espacio para evitar que el contenido quede debajo del navbar -->
<div class="h-16"></div> 