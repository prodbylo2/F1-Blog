<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import * as echarts from 'echarts/core';
    import { 
        LineChart, 
    } from 'echarts/charts';
    import { 
        GridComponent, 
        TitleComponent,
        TooltipComponent,
    } from 'echarts/components';
    import { 
        CanvasRenderer 
    } from 'echarts/renderers';
    import { fade, slide } from 'svelte/transition';
    import { getDriverSeasonStats, getAllDriverIds, getDriverName } from '../lib/utils/driverAnalytics';

    // Register necessary ECharts components
    echarts.use([
        LineChart,
        GridComponent,
        CanvasRenderer,
        TitleComponent,
        TooltipComponent
    ]);

    // Set a default driver
    export let driverId: string | null = 'VER';

    let driverStats: any = null;
    let pointsChartInstance: echarts.ECharts | null = null;
    let positionChartInstance: echarts.ECharts | null = null;
    let pointsChartEl: HTMLElement;
    let positionChartEl: HTMLElement;

    // Reactive statement to update stats when driver changes
    $: if (driverId) {
        try {
            driverStats = getDriverSeasonStats(driverId);
            createCharts();
        } catch (error) {
            console.error('Error getting driver stats:', error);
        }
    }

    function createCharts() {
        // Destroy existing charts
        if (pointsChartInstance) pointsChartInstance.dispose();
        if (positionChartInstance) positionChartInstance.dispose();

        // Points Progression Chart
        if (pointsChartEl && driverStats) {
            pointsChartInstance = echarts.init(pointsChartEl);
            pointsChartInstance.setOption({
                title: {
                    text: 'Points Progression',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: function(params: { dataIndex: string | number; }[]) {
                        const point = driverStats.pointsProgression[params[0].dataIndex];
                        return `
                            <b>${point.race}</b><br/>
                            Race Points: ${point.racePoints}<br/>
                            Sprint Points: ${point.sprintPoints}<br/>
                            Total Points: ${point.points}
                        `;
                    }
                },
                xAxis: {
                    type: 'category',
                    data: driverStats.pointsProgression.map((p: any) => p.race)
                },
                yAxis: {
                    type: 'value',
                    name: 'Cumulative Points'
                },
                series: [{
                    data: driverStats.pointsProgression.map((p: any) => p.points),
                    type: 'line',
                    smooth: true,
                    color: '#5470C6'
                }]
            });
        }

        // Position Changes Chart
        if (positionChartEl && driverStats) {
            positionChartInstance = echarts.init(positionChartEl);
            positionChartInstance.setOption({
                title: {
                    text: 'Race Positions',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis'
                },
                xAxis: {
                    type: 'category',
                    data: driverStats.positionChanges.map((p: any) => p.race)
                },
                yAxis: {
                    type: 'value',
                    name: 'Position',
                    inverse: true
                },
                series: [{
                    data: driverStats.positionChanges.map((p: any) => p.position),
                    type: 'line',
                    smooth: true,
                    color: '#EE6666'
                }]
            });
        }
    }

    // Handle window resize
    function handleResize() {
        if (pointsChartInstance) pointsChartInstance.resize();
        if (positionChartInstance) positionChartInstance.resize();
    }

    // Driver selection dropdown
    let drivers: string[] = [];
    onMount(() => {
        drivers = getAllDriverIds();
        window.addEventListener('resize', handleResize);
        
        // Ensure initial chart is created
        if (driverId) {
            driverStats = getDriverSeasonStats(driverId);
            createCharts();
        }
    });

    onDestroy(() => {
        // Clean up charts and event listeners
        if (pointsChartInstance) pointsChartInstance.dispose();
        if (positionChartInstance) positionChartInstance.dispose();
        window.removeEventListener('resize', handleResize);
    });

    // Wrapper function to safely get driver name
    function getDriverNameSafe(id: string | null): string {
        return id ? getDriverName(id) : 'Unknown Driver';
    }

    // Add state for table expansion
    let isTableExpanded = false;
</script>

{#if driverStats}
    <div class="driver-performance-overview">
        <div class="header">
            <h2>Driver Performance Overview</h2>
            <div class="driver-select">
                <select bind:value={driverId}>
                    {#each drivers as driver}
                        <option value={driver}>{getDriverNameSafe(driver)}</option>
                    {/each}
                </select>
            </div>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-label">Wins</span>
                <span class="stat-value">{driverStats.wins}</span>
                <span class="stat-subtext">{driverStats.winPercentage.toFixed(1)}% win rate</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">Podiums</span>
                <span class="stat-value">{driverStats.podiums}</span>
                <span class="stat-subtext">{driverStats.podiumPercentage.toFixed(1)}% podium rate</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">Average Position</span>
                <span class="stat-value">{driverStats.averageFinishingPosition.toFixed(1)}</span>
                <span class="stat-subtext">across the season</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">DNFs</span>
                <span class="stat-value">{driverStats.dnfs}</span>
                <span class="stat-subtext">{driverStats.dnfRate.toFixed(1)}% DNF rate</span>
            </div>
        </div>

        <div class="charts-container">
            <div class="chart-wrapper">
                <div bind:this={pointsChartEl} class="echarts-container"></div>
            </div>
            <div class="chart-wrapper">
                <div bind:this={positionChartEl} class="echarts-container"></div>
            </div>
        </div>

        <div class="race-results-container">
            <div class="results-header" on:click={() => isTableExpanded = !isTableExpanded} on:keydown={(e) => e.key === 'Enter' && (isTableExpanded = !isTableExpanded)} role="button" tabindex="0">
                <h3>Race Results</h3>
                <span class="expand-icon">{isTableExpanded ? '−' : '+'}</span>
            </div>
            
            {#if isTableExpanded}
                <div class="table-wrapper" transition:slide={{ duration: 300 }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Race</th>
                                <th>Grid</th>
                                <th>Finish</th>
                                <th>Race Points</th>
                                <th>Sprint Points</th>
                                <th>Total Points</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each driverStats.raceResults as result}
                                <tr>
                                    <td>{result.raceName}</td>
                                    <td>{result.gridPosition || 'N/A'}</td>
                                    <td>{result.position || 'N/A'}</td>
                                    <td>{result.racePoints}</td>
                                    <td>{result.sprintPoints}</td>
                                    <td>{result.points}</td>
                                    <td>{result.status}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .driver-performance-overview {
        padding: 1rem;
        color: var(--text);
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding: 0 1rem;
    }

    h2 {
        margin: 0;
        font-size: 1.8rem;
        color: var(--primary);
    }

    .driver-select select {
        background-color: var(--secondary);
        color: var(--text);
        border: 2px solid var(--primary);
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .driver-select select:hover {
        border-color: var(--accent);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
        padding: 0 1rem;
    }

    .stat-card {
        background: var(--secondary);
        border-radius: 8px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        transition: transform 0.3s ease;
    }

    .stat-card:hover {
        transform: translateY(-5px);
    }

    .stat-label {
        font-size: 0.9rem;
        color: var(--text);
        opacity: 0.8;
        margin-bottom: 0.5rem;
    }

    .stat-value {
        font-size: 2rem;
        font-weight: bold;
        color: var(--primary);
        margin-bottom: 0.5rem;
    }

    .stat-subtext {
        font-size: 0.8rem;
        color: var(--text);
        opacity: 0.6;
    }

    .charts-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 2rem;
        margin-bottom: 2rem;
        padding: 0 1rem;
    }

    .chart-wrapper {
        background: var(--secondary);
        border-radius: 8px;
        padding: 1rem;
        min-height: 300px;
    }

    .echarts-container {
        width: 100%;
        height: 300px;
    }

    .race-results-container {
        background: var(--secondary);
        border-radius: 8px;
        padding: 1.5rem;
        margin: 0 1rem;
    }

    .results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
    }

    .results-header:hover {
        color: var(--primary);
    }

    .expand-icon {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--primary);
        transition: transform 0.3s ease;
    }

    .results-header:hover .expand-icon {
        transform: scale(1.2);
    }

    .table-wrapper {
        overflow-x: auto;
        margin-top: 1rem;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }

    th {
        background-color: rgba(255, 255, 255, 0.1);
        padding: 1rem;
        font-weight: 600;
        color: var(--primary);
    }

    td {
        padding: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    tr:hover {
        background-color: rgba(255, 255, 255, 0.05);
    }

    @media (max-width: 768px) {
        .header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
        }

        .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }

        .charts-container {
            grid-template-columns: 1fr;
        }
    }
</style>
