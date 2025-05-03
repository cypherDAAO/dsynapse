<svelte:head>
  <script>
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  </script>
</svelte:head>

<script>
  let { children } = $props();
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import '../app.css';
  import { onMount } from 'svelte';

  onMount(() => {
    // Detectar preferencia guardada o del sistema
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  });
</script>

<div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
  {@render children()}
  
  <div class="fixed top-4 right-4 z-50">
    <ThemeToggle />
  </div>
</div>