<script>
  import { onMount } from 'svelte';
  let isVisible = false;

  onMount(() => {
    isVisible = true;
  });
</script>

<section class="hero">
  <div class="hero-content" class:visible={isVisible}>
    <h1>Welcome to F1 Insights</h1>
    <p>Your premier destination for Formula 1 statistics, race reviews, and expert analysis</p>
    <div class="cta-buttons">
      <button class="cta primary">Latest Reviews</button>
      <button class="cta secondary">View Statistics</button>
    </div>
  </div>
  <div class="hero-background"></div>
</section>

<style>
  .hero {
    height: 100vh;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: var(--background);
  }

  .hero-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: linear-gradient(rgba(10, 10, 10, 0.7), rgba(10, 10, 10, 0.8)),
      url('https://images.unsplash.com/photo-1541773367336-d3f7263b9422?ixlib=rb-4.0.3');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    z-index: 1;
  }

  .hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 0 2rem;
    max-width: 800px;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hero-content.visible {
    opacity: 1;
    transform: translateY(0);
  }

  h1 {
    font-size: 4rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, var(--primary), var(--accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1.2;
  }

  p {
    font-size: 1.25rem;
    color: var(--text);
    margin-bottom: 2.5rem;
    opacity: 0.9;
  }

  .cta-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .cta {
    padding: 1rem 2rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .cta.primary {
    background: var(--primary);
    color: var(--text);
  }

  .cta.secondary {
    background: transparent;
    color: var(--text);
    border: 2px solid var(--text);
  }

  .cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(225, 6, 0, 0.3);
  }

  .cta.primary:hover {
    background: var(--accent);
  }

  .cta.secondary:hover {
    background: var(--text);
    color: var(--background);
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 2.5rem;
    }

    p {
      font-size: 1.1rem;
    }

    .cta-buttons {
      flex-direction: column;
    }

    .cta {
      width: 100%;
    }
  }
</style>
