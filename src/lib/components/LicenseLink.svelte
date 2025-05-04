<script>
  import { page } from '$app/stores';
  
  let isActive;
  $: isActive = $page.url.pathname === '/creditos';
</script>

<a 
  href="/creditos" 
  class="text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors duration-200 {isActive ? 'underline font-medium' : ''}"
>
  Licencias y Créditos
</a> 