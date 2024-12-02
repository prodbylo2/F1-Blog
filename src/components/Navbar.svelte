<script>
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import Stats from './Stats.svelte';
  
  let isMenuOpen = false;
  let showStats = false;
  let scrollY;

  // Toggle mobile menu
  const toggleMenu = () => {
    isMenuOpen = !isMenuOpen;
  };

  // Toggle stats modal
  const toggleStats = () => {
    showStats = !showStats;
    if (isMenuOpen) {
      isMenuOpen = false;
    }
  };

  // Handle scroll effects
  $: navClass = scrollY > 50 ? 'navbar scrolled' : 'navbar';
</script>

<svelte:window bind:scrollY />

<nav class={navClass}>
  <div class="nav-brand" in:fade={{ duration: 300, delay: 150 }}>
    <div class="logo">
      <svg viewBox="0 0 24 24" class="f1-logo">
        <path d="M4 4h16v16H4z" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M4 8h16M8 4v16" stroke="currentColor" stroke-width="2"/>
      </svg>
    </div>
    <span>F1 INSIGHTS</span>
  </div>

  {#if isMenuOpen}
    <div class="nav-links" transition:slide>
      <a href="/" class="nav-link">Home</a>
      <a href="/races" class="nav-link">Races</a>
      <button class="nav-link stats-button" on:click={toggleStats}>Statistics</button>
      <a href="/drivers" class="nav-link">Drivers</a>
      <a href="/teams" class="nav-link">Teams</a>
    </div>
  {:else}
    <div class="nav-links">
      <a href="/" class="nav-link">Home</a>
      <a href="/races" class="nav-link">Races</a>
      <button class="nav-link stats-button" on:click={toggleStats}>Statistics</button>
      <a href="/drivers" class="nav-link">Drivers</a>
      <a href="/teams" class="nav-link">Teams</a>
    </div>
  {/if}

  <button 
    class="hamburger" 
    class:active={isMenuOpen} 
    on:click={toggleMenu}
    on:keydown={(e) => e.key === 'Enter' && toggleMenu()}
    role="button"
    tabindex="0"
    aria-label="Toggle menu"
    type="button"
  >
    <span></span>
    <span></span>
    <span></span>
  </button>
</nav>

{#if showStats}
  <div class="stats-modal" transition:fade>
    <button 
      class="stats-overlay" 
      on:click={toggleStats}
      type="button"
      aria-label="Close stats overlay"
    ></button>
    <div class="stats-content" transition:slide>
      <button class="close-button" on:click={toggleStats}>×</button>
      <Stats />
    </div>
  </div>
{/if}

<style>
  /* Variables */
  :root {
    --primary: #FF1E1E;
    --secondary: #1E1E1E;
    --accent: #E10600;
    --background: #0A0A0A;
    --text: #FFFFFF;
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background: rgba(10, 10, 10, 0.8);
    backdrop-filter: blur(10px);
    z-index: 1000;
    transition: var(--transition);
  }

  .navbar.scrolled {
    padding: 1rem 2rem;
    background: rgba(10, 10, 10, 0.95);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--text);
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 1px;
  }

  .f1-logo {
    width: 2rem;
    height: 2rem;
    color: var(--primary);
    animation: spin 10s linear infinite;
  }

  .nav-links {
    display: flex;
    gap: 2rem;
  }

  .nav-link {
    color: var(--text);
    text-decoration: none;
    font-weight: 500;
    position: relative;
    padding: 0.5rem 0;
    transition: var(--transition);
  }

  .nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--primary);
    transition: var(--transition);
  }

  .nav-link:hover {
    color: var(--primary);
  }

  .nav-link:hover::after {
    width: 100%;
  }

  .hamburger {
    display: none;
    flex-direction: column;
    gap: 6px;
    cursor: pointer;
    padding: 0.5rem;
    background: none;
    border: none;
  }

  .hamburger span {
    display: block;
    width: 25px;
    height: 2px;
    background: var(--text);
    transition: var(--transition);
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .nav-links {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      flex-direction: column;
      gap: 0;
      background: rgba(10, 10, 10, 0.95);
      padding: 1rem 0;
    }

    .nav-link {
      padding: 1rem 2rem;
      width: 100%;
      text-align: center;
    }

    .hamburger {
      display: flex;
    }

    .hamburger.active span:first-child {
      transform: translateY(8px) rotate(45deg);
    }

    .hamburger.active span:nth-child(2) {
      opacity: 0;
    }

    .hamburger.active span:last-child {
      transform: translateY(-8px) rotate(-45deg);
    }
  }

  .stats-button {
    background: none;
    border: none;
    color: var(--text);
    font-size: inherit;
    font-family: inherit;
    padding: 0;
    cursor: pointer;
    text-decoration: none;
  }

  .stats-button:hover {
    color: var(--accent);
  }

  .stats-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  }

  .stats-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
  }

  .stats-content {
    position: relative;
    background: var(--background);
    border-radius: 8px;
    width: 90%;
    max-width: 1200px;
    max-height: 90vh;
    overflow-y: auto;
    z-index: 2001;
    padding: 2rem;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    color: var(--text);
    font-size: 2rem;
    cursor: pointer;
    padding: 0.5rem;
    line-height: 1;
    z-index: 2002;
  }

  .close-button:hover {
    color: var(--accent);
  }

  /* Make sure scrollbar matches theme */
  .stats-content::-webkit-scrollbar {
    width: 8px;
  }

  .stats-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  .stats-content::-webkit-scrollbar-thumb {
    background: var(--accent);
    border-radius: 4px;
  }
</style>
