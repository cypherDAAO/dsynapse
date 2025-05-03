<script>
    let isDarkMode = false;
  
    if (typeof window!== 'undefined') {
      isDarkMode = localStorage.getItem('theme') === 'dark';
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      }
    }
  
    function toggleDarkMode() {
      isDarkMode =!isDarkMode;
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  </script>
  
  <button on:click={toggleDarkMode}>
    {#if isDarkMode}
      Modo Claro
    {:else}
      Modo Oscuro
    {/if}
  </button>