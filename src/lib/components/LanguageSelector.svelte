<script>
  import { locale, locales, setLocale } from '$lib/i18n';
</script>

<div class="relative inline-block">
  <button 
    type="button" 
    class="group rounded-full bg-white/90 px-3 py-2 shadow-lg shadow-zinc-800/5 backdrop-blur transition dark:bg-black/90 dark:ring-zinc-800/10 dark:hover:ring-zinc-700/20 dark:hover:bg-black/50 hover:cursor-pointer"
    aria-label="Cambiar idioma"
    aria-expanded="true"
    aria-haspopup="true"
    on:click={() => document.getElementById('language-dropdown-menu')?.classList.toggle('hidden')}
  >
    <div class="flex items-center justify-center h-6 w-6">
      <span class="text-xl">{locales[$locale]?.flag}</span>
    </div>
  </button>

  <div 
    class="hidden origin-top-right absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white/90 dark:bg-black/90 ring-1 ring-zinc-900/5 dark:ring-zinc-800/10 backdrop-blur focus:outline-none z-10"
    role="menu"
    aria-orientation="vertical"
    aria-labelledby="language-menu-button"
    tabindex="-1"
    id="language-dropdown-menu"
  >
    <div class="py-1" role="none">
      {#each Object.entries(locales) as [code, { name, flag }]}
        <button
          class="flex w-full items-center px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors {$locale === code ? 'bg-zinc-100 dark:bg-zinc-800/70 font-medium' : ''}"
          role="menuitem"
          tabindex="-1"
          on:click={() => {
            setLocale(code);
            document.getElementById('language-dropdown-menu')?.classList.add('hidden');
          }}
        >
          <span class="mr-2 text-xl">{flag}</span>
          {name}
        </button>
      {/each}
    </div>
  </div>
</div> 