<script>
  import { onMount } from 'svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  
  let menuOpen = false;
  
  function toggleMenu() {
    menuOpen = !menuOpen;
  }
  
  // Cerrar el menú en pantallas pequeñas cuando se hace clic en un enlace
  function closeMenu() {
    if (window.innerWidth < 768) {
      menuOpen = false;
    }
  }
</script>

<nav class="bg-white dark:bg-gray-800 shadow-md fixed w-full z-50 transition-colors duration-300">
  <div class="max-w-6xl mx-auto px-4">
    <div class="flex justify-between h-16">
      <!-- Logo y enlaces de navegación (escritorio) -->
      <div class="flex items-center">
        <a href="/" class="flex-shrink-0 flex items-center">
          <span class="text-xl font-bold text-gray-900 dark:text-white">DSynapse</span>
        </a>
        
        <!-- Enlaces de navegación (escritorio) -->
        <div class="hidden md:ml-6 md:flex md:space-x-4">
          <a href="/" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
            Inicio
          </a>
          <a href="/chat_ia" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
            Chat IA
          </a>
        </div>
      </div>
      
      <!-- Botones de acción (escritorio) -->
      <div class="hidden md:flex items-center">
        <ThemeToggle />
      </div>
      
      <!-- Botón de menú móvil -->
      <div class="flex items-center md:hidden">
        <ThemeToggle />
        <button 
          on:click={toggleMenu}
          class="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        >
          <svg 
            class="h-6 w-6" 
            stroke="currentColor" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            {#if menuOpen}
              <!-- Icono X -->
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            {:else}
              <!-- Icono menú hamburguesa -->
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            {/if}
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Menú móvil (desplegable) -->
  {#if menuOpen}
    <div class="md:hidden">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800">
        <a 
          href="/" 
          on:click={closeMenu}
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Inicio
        </a>
        <a 
          href="/chat_ia" 
          on:click={closeMenu}
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Chat IA
        </a>
      </div>
    </div>
  {/if}
</nav>

<!-- Espacio para evitar que el contenido quede debajo del navbar -->
<div class="h-16"></div> 