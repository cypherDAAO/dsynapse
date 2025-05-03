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
</script>

<ThemeToggle />

{@render children()}