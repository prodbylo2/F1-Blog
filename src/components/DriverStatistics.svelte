<script>
    import { onMount } from 'svelte';
    import { getSeasons, getDriversForSeason, getFilteredStats } from '../api/driverStats';

    // Filter states
    let selectedSeason = new Date().getFullYear().toString();
    let selectedDriver = '';
    let fetchingStats = false;

    // Data states
    let seasons = [];
    let drivers = [];
    let stats = null;
    let loading = true;
    let error = null;

    onMount(async () => {
        try {
            loading = true;
            seasons = await getSeasons();
            await loadSeasonData(selectedSeason);
            loading = false;
        } catch (err) {
            error = 'Failed to load initial data';
            loading = false;
        }
    });

    async function loadSeasonData(season) {
        try {
            drivers = await getDriversForSeason(season);
            selectedDriver = '';
        } catch (err) {
            error = 'Failed to load season data';
        }
    }

    $: if (selectedSeason) {
        loadSeasonData(selectedSeason);
    }

    async function fetchStats() {
        try {
            fetchingStats = true;
            error = null;
            const driver = drivers.find(d => d.id === selectedDriver);
            stats = await getFilteredStats({
                season: selectedSeason,
                driverId: selectedDriver,
                constructorId: driver?.constructor?.id || ''
            });
            fetchingStats = false;
        } catch (err) {
            error = 'Failed to load statistics';
            fetchingStats = false;
        }
    }

    function getSelectedEntityName() {
        if (selectedDriver) {
            const driver = drivers.find(d => d.id === selectedDriver);
            return driver ? `${driver.firstName} ${driver.lastName} - ${driver.constructor.name}` : '';
        }
        return 'All Drivers';
    }
</script>

<div class="f1-stats-container">
    {#if loading}
        <div class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>Loading...</p>
        </div>
    {:else if error}
        <div class="error-message">
            <p>{error}</p>
        </div>
    {:else}
        <div class="filters-section">
            <div class="filter-group">
                <select bind:value={selectedSeason} class="f1-select">
                    {#each seasons as season}
                        <option value={season}>{season} Season</option>
                    {/each}
                </select>

                <select bind:value={selectedDriver} class="f1-select">
                    <option value="">All Drivers</option>
                    {#each drivers as driver}
                        <option value={driver.id}>
                            {driver.firstName} {driver.lastName} - {driver.constructor.name}
                        </option>
                    {/each}
                </select>
            </div>

            <button 
                class="fetch-button" 
                on:click={fetchStats}
                disabled={fetchingStats}
            >
                {fetchingStats ? 'Fetching...' : 'Fetch Statistics'}
            </button>
        </div>

        {#if stats}
            <div class="stats-header">
                <h1>{getSelectedEntityName()} - {selectedSeason} Statistics</h1>
            </div>

            <div class="stats-grid">
                <!-- Championship Section -->
                <div class="stats-section">
                    <h2>Championship</h2>
                    <div class="stats-content">
                        <div class="stat-item">
                            <span class="stat-label">Position</span>
                            <span class="stat-value">P{stats.bestFinish}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Points</span>
                            <span class="stat-value">{stats.totalPoints.toFixed(0)}</span>
                        </div>
                    </div>
                </div>

                <!-- Race Performance -->
                <div class="stats-section">
                    <h2>Race Performance</h2>
                    <div class="stats-content">
                        <div class="stat-item">
                            <span class="stat-label">Wins</span>
                            <span class="stat-value">{stats.wins}</span>
                            <span class="stat-subtext">({((stats.wins / stats.totalRaces) * 100).toFixed(1)}%)</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Podiums</span>
                            <span class="stat-value">{stats.podiums}</span>
                            <span class="stat-subtext">({((stats.podiums / stats.totalRaces) * 100).toFixed(1)}%)</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">DNFs</span>
                            <span class="stat-value">
                                {stats.races.filter(r => r.result.status !== 'Finished').length}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Qualifying -->
                <div class="stats-section">
                    <h2>Qualifying</h2>
                    <div class="stats-content">
                        <div class="stat-item">
                            <span class="stat-label">Best Grid</span>
                            <span class="stat-value">
                                P{Math.min(...stats.races.map(r => r.result.grid))}
                            </span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Average Grid</span>
                            <span class="stat-value">
                                P{(stats.races.reduce((sum, r) => sum + r.result.grid, 0) / stats.races.length).toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Race Pace -->
                <div class="stats-section">
                    <h2>Race Pace</h2>
                    <div class="stats-content">
                        <div class="stat-item">
                            <span class="stat-label">Average Position</span>
                            <span class="stat-value">P{stats.averageFinish.toFixed(1)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Points Finishes</span>
                            <span class="stat-value">{stats.pointsFinishes}</span>
                            <span class="stat-subtext">({((stats.pointsFinishes / stats.totalRaces) * 100).toFixed(1)}%)</span>
                        </div>
                    </div>
                </div>
            </div>

            {#if stats.races.length > 0}
                <div class="races-section">
                    <h2>Race Results</h2>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Round</th>
                                    <th>Race</th>
                                    <th>Grid</th>
                                    <th>Position</th>
                                    <th>Points</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each stats.races as race}
                                    <tr>
                                        <td>{race.round}</td>
                                        <td>{race.raceName}</td>
                                        <td>P{race.result.grid}</td>
                                        <td>P{race.result.position}</td>
                                        <td>{race.result.points}</td>
                                        <td>{race.result.status}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            {/if}
        {/if}
    {/if}
</div>

<style>
    .f1-stats-container {
        background-color: #121212;
        color: #ffffff;
        min-height: 100vh;
        padding: 2rem;
    }

    .filters-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .filter-group {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .f1-select {
        background-color: #1e1e1e;
        color: #ffffff;
        border: 1px solid #333;
        padding: 0.75rem 1rem;
        border-radius: 4px;
        min-width: 200px;
        cursor: pointer;
    }

    .f1-select:hover {
        border-color: #e10600;
    }

    .fetch-button {
        background-color: #e10600;
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.2s;
        align-self: flex-start;
    }

    .fetch-button:hover {
        background-color: #b30500;
    }

    .fetch-button:disabled {
        background-color: #666;
        cursor: not-allowed;
    }

    .stats-header {
        margin: 2rem 0;
    }

    .stats-header h1 {
        color: #e10600;
        font-size: 2rem;
        font-weight: bold;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .stats-section {
        background-color: #1e1e1e;
        border-radius: 8px;
        padding: 1.5rem;
    }

    .stats-section h2 {
        color: #e10600;
        font-size: 1.25rem;
        margin-bottom: 1rem;
        font-weight: bold;
    }

    .stats-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .stat-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .stat-label {
        color: #999;
        font-size: 0.875rem;
    }

    .stat-value {
        font-size: 1.5rem;
        font-weight: bold;
    }

    .stat-subtext {
        color: #666;
        font-size: 0.875rem;
    }

    .races-section {
        background-color: #1e1e1e;
        border-radius: 8px;
        padding: 1.5rem;
        margin-top: 2rem;
    }

    .races-section h2 {
        color: #e10600;
        font-size: 1.25rem;
        margin-bottom: 1rem;
        font-weight: bold;
    }

    .table-container {
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #333;
    }

    th {
        color: #999;
        font-weight: normal;
    }

    tr:hover {
        background-color: #252525;
    }

    .loading-overlay {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 50vh;
        gap: 1rem;
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #333;
        border-top: 4px solid #e10600;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .error-message {
        color: #e10600;
        text-align: center;
        padding: 2rem;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
        .f1-stats-container {
            padding: 1rem;
        }

        .stats-grid {
            grid-template-columns: 1fr;
        }

        .filter-group {
            flex-direction: column;
        }

        .f1-select {
            width: 100%;
        }

        .fetch-button {
            width: 100%;
        }
    }
</style>
