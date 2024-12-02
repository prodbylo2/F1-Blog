<script>
  import Navbar from './components/Navbar.svelte';
  import Hero from './components/Hero.svelte';
</script>

<main>
  <Navbar />
  <Hero />
</main>

<style>
  :global(:root) {
    --primary: #FF1E1E;
    --secondary: #1E1E1E;
    --accent: #E10600;
    --background: #0A0A0A;
    --text: #FFFFFF;
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                 Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
    background-color: var(--background);
    color: var(--text);
    line-height: 1.6;
    overflow-x: hidden;
  }

  :global(button) {
    font-family: inherit;
  }

  main {
    width: 100%;
    min-height: 100vh;
  }
</style>
