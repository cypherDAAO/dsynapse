<script>
    import ChatLLM from '$lib/components/ChatLLM.svelte';
  </script>
  
  <section class="mt-[64px]">
    <ChatLLM />
  </section>
  
  <style>
    :global(body) {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
        Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      background-color: #fafafa;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    :global(.dark) :global(body) {
      background-color: #111827;
      color: #f3f4f6;
    }

    main {
      width: 100%;
      height: 100%;
    }
  </style>