<script>
    import { onMount } from 'svelte';
    import SunIcon from './SunIcon.svelte';
    import MoonIcon from './MoonIcon.svelte';
    
    let isDarkMode = false;
    let mounted = false;
    
    onMount(() => {
        if (typeof document !== 'undefined') {
            // Verificar si ya tiene la clase dark
            isDarkMode = document.documentElement.classList.contains('dark');
            mounted = true;
        }
    });
    
    function disableTransitionsTemporarily() {
        document.documentElement.classList.add("[&_*]:!transition-none");
        window.setTimeout(() => {
            document.documentElement.classList.remove("[&_*]:!transition-none");
        }, 0);
    }
    
    function toggleDarkMode() {
        disableTransitionsTemporarily();
        isDarkMode = !isDarkMode;
        if (typeof document !== 'undefined') {
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
                document.body.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                document.body.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        }
    }
</script>

{#if !mounted}
    <button
        type="button"
        aria-label="Cambiar modo oscuro"
        class="group rounded-full bg-white/90 px-3 py-2 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur transition dark:bg-black/90 dark:ring-zinc-800/10 dark:hover:ring-zinc-700/20 dark:hover:bg-black/50"
    >
        <div class="h-6 w-6"></div>
    </button>
{:else}
    <button 
        type="button"
        on:click={toggleDarkMode}
        aria-label="Cambiar modo oscuro"
        class="group rounded-full bg-white/90 px-3 py-2 shadow-lg shadow-zinc-800/5 backdrop-blur transition dark:bg-black/90 dark:ring-zinc-800/10 dark:hover:ring-zinc-700/20 dark:hover:bg-black/50 hover:cursor-pointer"
    >
        <div class="relative h-6 w-6">
            <div 
                class={`absolute inset-0 transform transition-transform duration-500 ${
                    isDarkMode ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'
                }`}
            >
                <MoonIcon 
                    className="h-6 w-6 fill-zinc-100 stroke-zinc-400 transition group-hover:stroke-zinc-200 group-hover:fill-slate-200" 
                />
            </div>
            <div 
                class={`absolute inset-0 transform transition-transform duration-500 ${
                    isDarkMode ? '-rotate-90 opacity-0' : 'rotate-0 opacity-100'
                }`}
            >
                <SunIcon 
                    className="h-6 w-6 fill-zinc-100 stroke-zinc-400 transition group-hover:fill-zinc-200 group-hover:stroke-zinc-500" 
                />
            </div>
        </div>
    </button>
{/if}