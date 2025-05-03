<script>
    import { onMount } from 'svelte';
    
    let isDarkMode = false;
    
    onMount(() => {
        if (typeof document !== 'undefined') {
            // Verificar si ya tiene la clase dark
            isDarkMode = document.documentElement.classList.contains('dark');
        }
    });
    
    function toggleDarkMode() {
        isDarkMode = !isDarkMode;
        if (typeof document !== 'undefined') {
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        }
    }
</script>

<button 
    on:click={toggleDarkMode}
    class="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
>
    {#if isDarkMode}
        Modo Claro
    {:else}
        Modo Oscuro
    {/if}
</button>