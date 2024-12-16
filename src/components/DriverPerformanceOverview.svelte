<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import * as echarts from 'echarts/core';
    import { 
        TitleComponent,
        TooltipComponent,
        GridComponent,
        LegendComponent 
    } from 'echarts/components';
    import { 
        LineChart,
        ScatterChart,
        BarChart
    } from 'echarts/charts';
    import { 
        CanvasRenderer 
    } from 'echarts/renderers';
    import { slide } from 'svelte/transition';
    import { getDriverSeasonStats, getAllDriverIds, getDriverName } from '../lib/utils/driverAnalytics';
    import ConstructorPerformanceOverview from './ConstructorPerformanceOverview.svelte';

    // Register necessary ECharts components
    echarts.use([
        TitleComponent,
        TooltipComponent,
        GridComponent,
        LegendComponent,
        LineChart,
        ScatterChart,
        BarChart,
        CanvasRenderer
    ]);

    // Set a default driver
    export let driverId: string | null = 'VER';

    let driverStats: any = null;
    let pointsChartInstance: echarts.ECharts | null = null;
    let positionChartInstance: echarts.ECharts | null = null;
    let qualifyingDeltaChartInstance: echarts.ECharts | null = null;
    let headToHeadChartInstance: echarts.ECharts | null = null;
    let pointsChartEl: HTMLElement;
    let positionChartEl: HTMLElement;
    let qualifyingDeltaChartEl: HTMLElement;
    let headToHeadChartEl: HTMLElement;

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
        if (qualifyingDeltaChartInstance) qualifyingDeltaChartInstance.dispose();
        if (headToHeadChartInstance) headToHeadChartInstance.dispose();

        // Points Progression Chart
        if (pointsChartEl && driverStats) {
            pointsChartInstance = echarts.init(pointsChartEl);
            pointsChartInstance.setOption({
                title: {
                    text: 'Points Progression',
                    left: 'center',
                    textStyle: {
                        color: '#fff'
                    }
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
                    data: driverStats.pointsProgression.map((p: { race: any; }) => p.race),
                    axisLabel: {
                        color: '#fff'
                    }
                },
                yAxis: {
                    type: 'value',
                    name: 'Cumulative Points',
                    nameTextStyle: {
                        color: '#fff'
                    },
                    axisLabel: {
                        color: '#fff'
                    }
                },
                series: [
                    {
                        data: driverStats.pointsProgression.map((p: { points: any; }) => p.points),
                        type: 'line',
                        smooth: true,
                        lineStyle: {
                            width: 3
                        },
                        color: '#5470C6'
                    },
                    {
                        name: 'Race Wins',
                        type: 'scatter',
                        data: driverStats.raceResults.map((result: { racePoints: number; }, index: number) => 
                            (result.racePoints === 25 || result.racePoints === 26) ? driverStats.pointsProgression[index].points : null
                        ),
                        symbol: 'circle',
                        symbolSize: 12,
                        itemStyle: {
                            color: '#FFD700'
                        },
                        z: 10
                    },
                    {
                        name: 'Grand Slam',
                        type: 'scatter',
                        data: driverStats.raceResults.map((result: { racePoints: number; }, index: number) => 
                            result.racePoints === 26 ? driverStats.pointsProgression[index].points : null
                        ),
                        symbol: 'circle',
                        symbolSize: 12,
                        itemStyle: {
                            color: '#aa3ddd'  // Purple color
                        },
                        z: 11  // Higher z-index to appear above gold circles
                    }
                ]
            });
        }

        // Position Changes Chart
        if (positionChartEl && driverStats) {
            positionChartInstance = echarts.init(positionChartEl);
            positionChartInstance.setOption({
                title: {
                    text: 'Race Positions',
                    left: 'center',
                    textStyle: {
                        color: '#fff'
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: function(params: {
                        value: any; name: any; 
                    }[]) {
                        const position = params[0].value;
                        return `
                            <b>${params[0].name}</b><br/>
                            Position: ${position || 'DNF'}
                        `;
                    }
                },
                xAxis: {
                    type: 'category',
                    data: driverStats.positionChanges.map((p: { race: any; }) => p.race),
                    axisLabel: {
                        color: '#fff'
                    }
                },
                yAxis: {
                    type: 'value',
                    name: 'Position',
                    inverse: true,
                    min: 1,
                    max: 20,
                    nameTextStyle: {
                        color: '#fff'
                    },
                    axisLabel: {
                        color: '#fff'
                    }
                },
                series: [
                    {
                        data: driverStats.positionChanges.map((p: { position: any; }) => p.position),
                        type: 'line',
                        smooth: true,
                        lineStyle: {
                            width: 3
                        },
                        color: '#EE6666'
                    },
                    {
                        name: 'Race Wins',
                        type: 'scatter',
                        data: driverStats.raceResults.map((result: { position: number; }, index: number) => 
                            result.position === 1 ? result.position : null
                        ),
                        symbol: 'circle',
                        symbolSize: 12,
                        itemStyle: {
                            color: '#FFD700'
                        },
                        z: 10
                    }
                ]
            });
        }

        // Qualifying vs Race Position Delta Chart
        if (qualifyingDeltaChartEl && driverStats) {
            qualifyingDeltaChartInstance = echarts.init(qualifyingDeltaChartEl);
            qualifyingDeltaChartInstance.setOption({
                title: {
                    text: 'Qualifying vs Race Position Delta',
                    left: 'center',
                    textStyle: { color: '#fff' }
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: function(params) {
                        const delta = driverStats.qualifyingVsRacePositionDelta[params[0].dataIndex];
                        return `
                            <b>${delta.race}</b><br/>
                            Grid Position: ${delta.gridPosition}<br/>
                            Finish Position: ${delta.finishPosition}<br/>
                            Position Delta: ${delta.delta > 0 ? '+' : ''}${delta.delta}
                        `;
                    }
                },
                xAxis: {
                    type: 'category',
                    data: driverStats.qualifyingVsRacePositionDelta.map(d => d.race),
                    axisLabel: { color: '#fff', rotate: 45 }
                },
                yAxis: {
                    type: 'value',
                    name: 'Position Change',
                    nameTextStyle: { color: '#fff' },
                    axisLabel: { color: '#fff' }
                },
                series: [{
                    data: driverStats.qualifyingVsRacePositionDelta.map(d => d.delta),
                    type: 'bar',
                    itemStyle: {
                        color: function(params) {
                            return params.value > 0 ? '#4CAF50' : 
                                   params.value < 0 ? '#F44336' : '#2196F3';
                        }
                    }
                }]
            });
        }

        // Head-to-Head Comparison Chart
        if (headToHeadChartEl && driverStats && driverStats.headToHeadComparison) {
            headToHeadChartInstance = echarts.init(headToHeadChartEl);
            headToHeadChartInstance.setOption({
                title: {
                    show: false  // Remove the title
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                    formatter: function(params) {
                        const comparison = driverStats.headToHeadComparison.headToHeadResults[params[0].dataIndex];
                        return `
                            <b>${comparison.race}</b><br/>
                            ${getDriverName(driverId)}: ${comparison.driverPosition || 'DNF'}<br/>
                            ${driverStats.headToHeadComparison.teammate}: ${comparison.teammatePosition || 'DNF'}
                        `;
                    }
                },
                legend: {
                    data: [getDriverName(driverId), driverStats.headToHeadComparison.teammate],
                    textStyle: { color: '#fff' }
                },
                xAxis: {
                    type: 'category',
                    data: driverStats.headToHeadComparison.headToHeadResults.map(d => d.race),
                    axisLabel: { color: '#fff', rotate: 45 }
                },
                yAxis: {
                    type: 'value',
                    name: 'Race Position',
                    inverse: true,
                    min: 1,
                    max: 20,
                    nameTextStyle: { color: '#fff' },
                    axisLabel: { color: '#fff' }
                },
                series: [
                    {
                        name: getDriverName(driverId),
                        data: driverStats.headToHeadComparison.headToHeadResults.map(d => d.driverPosition),
                        type: 'line',
                        smooth: true,
                        color: '#3498DB'
                    },
                    {
                        name: driverStats.headToHeadComparison.teammate,
                        data: driverStats.headToHeadComparison.headToHeadResults.map(d => d.teammatePosition),
                        type: 'line',
                        smooth: true,
                        color: '#E74C3C'
                    }
                ]
            });
        }
    }

    // Handle window resize
    function handleResize() {
        if (pointsChartInstance) pointsChartInstance.resize();
        if (positionChartInstance) positionChartInstance.resize();
        if (qualifyingDeltaChartInstance) qualifyingDeltaChartInstance.resize();
        if (headToHeadChartInstance) headToHeadChartInstance.resize();
    }

    // Driver selection dropdown
    let drivers: string[] = [];
    let activeTab = 'drivers';
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
        if (qualifyingDeltaChartInstance) qualifyingDeltaChartInstance.dispose();
        if (headToHeadChartInstance) headToHeadChartInstance.dispose();
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
            <div class="tab-select">
                <button class={`tab-button ${activeTab === 'drivers' ? 'active' : ''}`} on:click={() => activeTab = 'drivers'}>Drivers</button>
                <button class={`tab-button ${activeTab === 'constructors' ? 'active' : ''}`} on:click={() => activeTab = 'constructors'}>Constructors</button>
            </div>
        </div>
        
        {#if activeTab === 'drivers'}
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
                <div class="chart-wrapper points-chart-wide">
                    <div bind:this={pointsChartEl} class="echarts-container"></div>
                </div>
                <div class="chart-wrapper">
                    <div bind:this={positionChartEl} class="echarts-container"></div>
                </div>
                <div class="chart-wrapper">
                    <div bind:this={qualifyingDeltaChartEl} class="echarts-container"></div>
                </div>
                {#if driverStats.headToHeadComparison}
                    <div class="chart-wrapper">
                        <div class="head-to-head-container">
                            <div class="chart-header">
                                <h3>Head-to-Head: {getDriverName(driverId)} vs {driverStats.headToHeadComparison.teammate}</h3>
                            </div>
                            <div bind:this={headToHeadChartEl} class="echarts-container"></div>
                        </div>
                    </div>
                    <div class="chart-wrapper">
                        <div class="head-to-head-stats-container">
                            <div class="chart-header">
                                <h3>Season Performance Comparison</h3>
                            </div>
                            <div class="head-to-head-stats-grid">
                                <div class="head-to-head-stat-column">
                                    <div class="head-to-head-stat-item">
                                        <span class="head-to-head-stat-label">Total Races</span>
                                        <span class="head-to-head-stat-value">{driverStats.headToHeadComparison.stats.totalRaces}</span>
                                    </div>
                                    <div class="head-to-head-stat-item">
                                        <span class="head-to-head-stat-label">{driverStats.headToHeadComparison.teammate} Wins</span>
                                        <span class="head-to-head-stat-value">{driverStats.headToHeadComparison.stats.teammateWins}</span>
                                    </div>
                                    <div class="head-to-head-stat-item">
                                        <span class="head-to-head-stat-label">{driverStats.headToHeadComparison.teammate} Win %</span>
                                        <span class="head-to-head-stat-value">{driverStats.headToHeadComparison.stats.teammateWinPercentage.toFixed(1)}%</span>
                                    </div>
                                </div>
                                <div class="head-to-head-stat-column">
                                    <div class="head-to-head-stat-item">
                                        <span class="head-to-head-stat-label">Completed Races</span>
                                        <span class="head-to-head-stat-value">{driverStats.headToHeadComparison.stats.completedRaces}</span>
                                    </div>
                                    <div class="head-to-head-stat-item">
                                        <span class="head-to-head-stat-label">{getDriverName(driverId)} Wins</span>
                                        <span class="head-to-head-stat-value">{driverStats.headToHeadComparison.stats.driverWins}</span>
                                    </div>
                                    <div class="head-to-head-stat-item">
                                        <span class="head-to-head-stat-label">{getDriverName(driverId)} Win %</span>
                                        <span class="head-to-head-stat-value">{driverStats.headToHeadComparison.stats.driverWinPercentage.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}
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
        {/if}

        {#if activeTab === 'constructors'}
            <ConstructorPerformanceOverview />
        {/if}
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
        color: var(--text-muted);
        font-size: 0.8rem;
        margin-bottom: 0.25rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .stat-value {
        color: var(--text);
        font-weight: bold;
        font-size: 1.1rem;
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

    .chart-wrapper.points-chart-wide {
        grid-column: span 2;
        min-height: 450px;
    }

    .points-chart-wide .echarts-container {
        height: 450px;
    }

    .echarts-container {
        width: 100%;
        height: 300px;
    }

    .head-to-head-container {
        display: flex;
        flex-direction: column;
        background-color: var(--secondary);
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .chart-header h3 {
        color: var(--text);
        margin: 0;
        padding: 1rem;
        background-color: rgba(255, 255, 255, 0.05);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .head-to-head-stats-container {
        background-color: var(--secondary);
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .head-to-head-stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0;
        background-color: rgba(255, 255, 255, 0.05);
        padding: 1rem;
    }

    .head-to-head-stat-column {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 0 1rem;
    }

    .head-to-head-stat-item {
        margin-bottom: 1.5rem;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
    }

    .head-to-head-stat-item::after {
        content: '';
        position: absolute;
        bottom: -0.75rem;
        left: 50%;
        transform: translateX(-50%);
        width: 50%;
        height: 1px;
        background-color: rgba(255, 255, 255, 0.1);
    }

    .head-to-head-stat-item:last-child::after {
        display: none;
    }

    .head-to-head-stat-label {
        color: var(--text-muted);
        font-size: 0.8rem;
        margin-bottom: 0.25rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .head-to-head-stat-value {
        color: var(--text);
        font-weight: bold;
        font-size: 1.1rem;
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
        }
    }

    .tab-select {
        margin-top: 1rem;
    }

    .tab-button {
        background-color: var(--secondary);
        color: var(--text);
        border: 2px solid var(--primary);
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .tab-button:hover {
        border-color: var(--accent);
    }

    .tab-button.active {
        background-color: var(--primary);
        color: var(--text);
    }
</style>
