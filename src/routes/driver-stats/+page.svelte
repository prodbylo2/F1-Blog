<script>
  import DriverPerformanceOverview from '../../components/DriverPerformanceOverview.svelte';
</script>

<div class="driver-stats-page">
  <h1>Driver Statistics</h1>
  <DriverPerformanceOverview />
</div>

<style>
  .driver-stats-page {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  h1 {
    color: var(--primary);
    font-size: 2.5em;
    margin-bottom: 1em;
    text-align: center;
  }

  @media (max-width: 768px) {
    .driver-stats-page {
      padding: 1rem;
    }

    h1 {
      font-size: 2em;
    }
  }
</style>
