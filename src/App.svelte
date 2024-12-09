<script>
  import Navbar from './components/Navbar.svelte';
  import Hero from './components/Hero.svelte';
  import DriverPerformanceOverview from './components/DriverPerformanceOverview.svelte';
</script>

<main>
  <Navbar />
  <Hero />
  <h1>F1 2024 Analytics</h1>
  <DriverPerformanceOverview />
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
    max-width: 1400px; /* Increased max-width */
    min-height: 100vh;
    text-align: center;
    padding: 1em;
    margin: 0 auto; /* Center the content */
  }

  h1 {
    color: var(--primary);
    font-size: 2.5em;
    margin-bottom: 1em;
  }

  @media (max-width: 768px) {
    main {
      padding: 0.5em;
    }

    h1 {
      font-size: 2em;
    }
  }
</style>
