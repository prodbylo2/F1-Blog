<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { getRaces, getDrivers, getTeams, getDriverStats, getTeamStats, getRaceStats } from '../api/f1Stats.js';
    
    // Store for selected filters
    let selectedSeason = new Date().getFullYear();
    let selectedRace = null;
    let selectedDriver = null;
    let selectedTeam = null;
    
    // Data states
    let races = [];
    let drivers = [];
    let teams = [];
    let loading = true;
    let activeTab = 'driver';
    let error = null;
    
    // Stats data
    let driverStats = null;
    let teamStats = null;
    let raceStats = null;

    console.log('Selected Season:', selectedSeason);

    // Watch for changes in selections
    $: {
        console.log('Fetching stats for season:', selectedSeason);
        if (selectedDriver || selectedTeam || selectedRace) {
            fetchStats();
        }
    }
    
    $: {
        console.log('Loading data for season:', selectedSeason);
        if (selectedSeason) {
            loadSeasonData();
        }
    }

    async function loadSeasonData() {
        loading = true;
        error = null;
        try {
            console.log('Loading data for season:', selectedSeason);
            // Clear previous selections when season changes
            selectedDriver = null;
            selectedTeam = null;
            selectedRace = null;
            driverStats = null;
            teamStats = null;
            raceStats = null;

            // Load new data for the selected season
            const [racesData, driversData, teamsData] = await Promise.all([
                getRaces(selectedSeason),
                getDrivers(selectedSeason),
                getTeams(selectedSeason)
            ]);

            console.log('Received data:', {
                races: racesData,
                drivers: driversData,
                teams: teamsData
            });

            races = racesData;
            drivers = driversData;
            teams = teamsData;

            if (!races.length && !drivers.length && !teams.length) {
                error = `No data available for ${selectedSeason} season`;
            }
        } catch (err) {
            console.error('Error loading season data:', err);
            error = 'Error loading season data. Please try again later.';
            races = [];
            drivers = [];
            teams = [];
        } finally {
            loading = false;
        }
    }
    
    async function fetchStats() {
        if (loading) return;
        loading = true;
        error = null;
        
        try {
            switch (activeTab) {
                case 'driver':
                    if (!selectedDriver) {
                        error = 'Please select a driver';
                        break;
                    }
                    driverStats = await getDriverStats(selectedDriver, selectedSeason);
                    if (!driverStats) {
                        error = 'No stats available for selected driver';
                    }
                    break;
                case 'team':
                    if (!selectedTeam) {
                        error = 'Please select a team';
                        break;
                    }
                    teamStats = await getTeamStats(selectedTeam, selectedSeason);
                    if (!teamStats) {
                        error = 'No stats available for selected team';
                    }
                    break;
                case 'race':
                    if (!selectedRace) {
                        error = 'Please select a race';
                        break;
                    }
                    raceStats = await getRaceStats(selectedRace, selectedSeason);
                    if (!raceStats) {
                        error = 'No stats available for selected race';
                    }
                    break;
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
            error = 'Error fetching statistics. Please try again later.';
        } finally {
            loading = false;
        }
    }
    
    onMount(loadSeasonData);
</script>

<div class="stats-container" transition:fade>
    <div class="filters">
        <select bind:value={selectedSeason}>
            {#each Array.from({length: 5}, (_, i) => new Date().getFullYear() - i) as year}
                <option value={year}>{year}</option>
            {/each}
        </select>
        
        <div class="tabs">
            <button 
                class:active={activeTab === 'driver'}
                on:click={() => activeTab = 'driver'}>
                Driver Statistics
            </button>
            <button 
                class:active={activeTab === 'team'}
                on:click={() => activeTab = 'team'}>
                Team Statistics
            </button>
            <button 
                class:active={activeTab === 'race'}
                on:click={() => activeTab = 'race'}>
                Race Statistics
            </button>
        </div>
        
        {#if activeTab === 'driver'}
            <select bind:value={selectedDriver}>
                <option value={null}>Select Driver</option>
                {#each drivers as driver}
                    <option value={driver.id}>{driver.name}</option>
                {/each}
            </select>
        {:else if activeTab === 'team'}
            <select bind:value={selectedTeam}>
                <option value={null}>Select Team</option>
                {#each teams as team}
                    <option value={team.id}>{team.name}</option>
                {/each}
            </select>
        {:else}
            <select bind:value={selectedRace}>
                <option value={null}>Select Race</option>
                {#each races as race}
                    <option value={race.id}>{race.name}</option>
                {/each}
            </select>
        {/if}
        
        <button 
            class="fetch-stats" 
            on:click={fetchStats}
            disabled={loading || (!selectedDriver && !selectedTeam && !selectedRace)}>
            {loading ? 'Loading...' : 'Fetch Statistics'}
        </button>
    </div>
    
    {#if error}
        <div class="error" transition:fade>
            {error}
        </div>
    {/if}
    
    {#if loading}
        <div class="loading">Loading statistics...</div>
    {:else}
        <div class="stats-display">
            {#if activeTab === 'driver' && driverStats}
                <div class="driver-stats" transition:fade>
                    <h2>{driverStats.name} - {selectedSeason} Statistics</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <h3>Championship</h3>
                            <p>Position: {driverStats.championshipPosition}</p>
                            <p>Points: {driverStats.points}</p>
                        </div>
                        <div class="stat-card">
                            <h3>Race Performance</h3>
                            <p>Wins: {driverStats.wins}</p>
                            <p>Podiums: {driverStats.podiums}</p>
                            <p>DNFs: {driverStats.dnfs}</p>
                        </div>
                        <div class="stat-card">
                            <h3>Qualifying</h3>
                            <p>Pole Positions: {driverStats.poles}</p>
                            <p>Average Grid Position: {driverStats.avgGridPosition}</p>
                        </div>
                        <div class="stat-card">
                            <h3>Race Pace</h3>
                            <p>Fastest Laps: {driverStats.fastestLaps}</p>
                            <p>Avg Race Position: {driverStats.avgRacePosition}</p>
                        </div>
                    </div>
                </div>
            {:else if activeTab === 'team' && teamStats}
                <div class="team-stats" transition:fade>
                    <h2>{teamStats.name} - {selectedSeason} Statistics</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <h3>Championship</h3>
                            <p>Position: {teamStats.championshipPosition}</p>
                            <p>Points: {teamStats.points}</p>
                        </div>
                        <div class="stat-card">
                            <h3>Performance</h3>
                            <p>Wins: {teamStats.wins}</p>
                            <p>Podiums: {teamStats.podiums}</p>
                            <p>DNFs: {teamStats.dnfs}</p>
                        </div>
                        <div class="stat-card">
                            <h3>Qualifying</h3>
                            <p>Pole Positions: {teamStats.poles}</p>
                            <p>Front Row Starts: {teamStats.frontRows}</p>
                        </div>
                        <div class="stat-card">
                            <h3>Development</h3>
                            <p>Best Finish: {teamStats.bestFinish}</p>
                            <p>Points per Race: {teamStats.pointsPerRace}</p>
                        </div>
                    </div>
                </div>
            {:else if activeTab === 'race' && raceStats}
                <div class="race-stats" transition:fade>
                    <h2>{raceStats.name} Statistics</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <h3>Race Info</h3>
                            <p>Winner: {raceStats.winner}</p>
                            <p>Fastest Lap: {raceStats.fastestLap}</p>
                        </div>
                        <div class="stat-card">
                            <h3>Pit Stops</h3>
                            <p>Total Pit Stops: {raceStats.totalPitStops}</p>
                            <p>Fastest Pit: {raceStats.fastestPitStop}</p>
                        </div>
                        <div class="stat-card">
                            <h3>Race Events</h3>
                            <p>Safety Cars: {raceStats.safetyCars}</p>
                            <p>DNFs: {raceStats.raceDNFs}</p>
                        </div>
                        <div class="stat-card">
                            <h3>Track Stats</h3>
                            <p>Track Temp: {raceStats.trackTemp}°C</p>
                            <p>Air Temp: {raceStats.airTemp}°C</p>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .stats-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
        color: var(--text);
    }
    
    .filters {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
    }
    
    .tabs {
        display: flex;
        gap: 1rem;
    }
    
    .tabs button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        background: #333;
        color: white;
        cursor: pointer;
        transition: background 0.3s ease;
    }
    
    .tabs button.active {
        background: var(--accent);
    }
    
    select {
        padding: 0.5rem;
        border-radius: 4px;
        border: 1px solid #ddd;
        background: var(--background);
        color: var(--text);
    }
    
    .fetch-stats {
        padding: 0.75rem 1.5rem;
        background: var(--accent);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
    }
    
    .fetch-stats:disabled {
        background: #666;
        cursor: not-allowed;
    }
    
    .loading {
        text-align: center;
        padding: 2rem;
        font-size: 1.2rem;
        color: #888;
    }
    
    .error {
        background: rgba(255, 0, 0, 0.1);
        color: #ff4444;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
    }
    
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-top: 1.5rem;
    }
    
    .stat-card {
        background: rgba(255, 255, 255, 0.05);
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .stat-card h3 {
        color: var(--accent);
        margin-bottom: 1rem;
        font-size: 1.2rem;
    }
    
    .stat-card p {
        margin: 0.5rem 0;
        color: var(--text);
    }
    
    h2 {
        color: var(--text);
        margin-bottom: 1.5rem;
        font-size: 1.8rem;
    }
    
    @media (max-width: 768px) {
        .tabs {
            flex-direction: column;
        }
        
        .stats-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
