<svelte:head>
  <script>
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
      document.body && document.body.classList.add('dark');
    }
  </script>
  <style>
    html, body {
      background-color: white;
      transition: background-color 300ms;
    }
    
    html.dark, body.dark {
      background-color: #111827; /* Mismo color que bg-gray-900 */
    }
  </style>
</svelte:head>

<script>
  let { children } = $props();
  import Navbar from '$lib/components/Navbar.svelte';
  import '../app.css';
  import { onMount } from 'svelte';

  onMount(() => {
    // Detectar preferencia guardada o del sistema
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  });
</script>

<div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
  <Navbar />
  {@render children()}
</div>