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
                    formatter: function(params) {
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
</script>

{#if driverStats}
    <div class="driver-performance-overview">
        <h2>Driver Performance Overview: {getDriverNameSafe(driverId)}</h2>
        
        <div class="stats-summary">
            <div class="stat-card">
                <h3>Season Summary</h3>
                <p>Wins: {driverStats.wins} ({driverStats.winPercentage.toFixed(1)}%)</p>
                <p>Podiums: {driverStats.podiums} ({driverStats.podiumPercentage.toFixed(1)}%)</p>
                <p>Avg. Finishing Position: {driverStats.averageFinishingPosition.toFixed(2)}</p>
                <p>DNF Rate: {driverStats.dnfRate.toFixed(1)}%</p>
            </div>
        </div>

        <div class="charts-container">
            <div class="chart-wrapper">
                <div 
                    bind:this={pointsChartEl} 
                    class="echarts-container"
                ></div>
            </div>
            <div class="chart-wrapper">
                <div 
                    bind:this={positionChartEl} 
                    class="echarts-container"
                ></div>
            </div>
        </div>

        <div class="race-results">
            <h3>Race Results</h3>
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
    </div>
{/if}

<div>
    <label for="driver-select">Select a Driver:</label>
    <select 
        id="driver-select" 
        bind:value={driverId}
    >
        {#each drivers as driver}
            <option value={driver}>{getDriverNameSafe(driver)}</option>
        {/each}
    </select>
</div>

<style>
    .driver-performance-overview {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }

    .stats-summary {
        display: flex;
        justify-content: center;
        margin-bottom: 20px;
    }

    .stat-card {
        background-color: #f4f4f4;
        border-radius: 8px;
        padding: 15px;
        text-align: center;
    }

    .charts-container {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
    }

    .chart-wrapper {
        width: 48%;
        height: 400px;
    }

    .echarts-container {
        width: 100%;
        height: 100%;
    }

    .race-results table {
        width: 100%;
        border-collapse: collapse;
    }

    .race-results th, 
    .race-results td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }

    .race-results th {
        background-color: #f2f2f2;
    }
</style>
