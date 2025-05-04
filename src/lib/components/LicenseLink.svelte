<script>
  import { page } from '$app/stores';
  
  let isActive;
  $: isActive = $page.url.pathname === '/creditos';
</script>

<a 
  href="/creditos" 
  class="text-sm text-white hover:text-zinc-100 transition-colors duration-200 {isActive ? 'underline font-medium' : ''}"
>
  Licencias y Créditos
</a> 