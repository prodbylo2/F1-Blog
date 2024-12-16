<script lang="ts">
    import { onMount } from 'svelte';
    import { getAllConstructorIds, getConstructorName, getConstructorSeasonStats, getConstructorStandingChanges, getConstructorPointsProgression, getConstructorReliabilityStatistics, getCombinedDriverPoints, getPerformanceByCircuitType, getConstructorFastestLapsCount, getConstructorPitStopStatistics } from '../lib/utils/driverAnalytics';
    import * as echarts from 'echarts/core';
    import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
    import { LineChart, BarChart, PieChart } from 'echarts/charts';
    import { CanvasRenderer } from 'echarts/renderers';

    echarts.use([TitleComponent, TooltipComponent, GridComponent, LegendComponent, LineChart, BarChart, PieChart, CanvasRenderer]);

    export let constructorId: string = 'red_bull';
    let constructorStats: any = null;
    let standingChanges: any = null;
    let pointsProgression: any = null;
    let reliabilityStats: any = null;
    let combinedDriverPoints: any = null;
    let performanceByCircuit: any = null;
    let fastestLapsCount: number = 0;
    let pitStopStatistics: any = null;
    let constructors: string[] = [];
    let chartInstances: { [key: string]: echarts.ECharts } = {};

    let pointsChartEl: HTMLDivElement;
    let standingChartEl: HTMLDivElement;
    let reliabilityChartEl: HTMLDivElement;
    let circuitChartEl: HTMLDivElement;
    let pitStopChartEl: HTMLDivElement;

    onMount(() => {
        constructors = getAllConstructorIds();
        updateData();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            Object.values(chartInstances).forEach(chart => chart.dispose());
        };
    });

    function handleResize() {
        Object.values(chartInstances).forEach(chart => chart.resize());
    }

    async function updateData() {
        constructorStats = getConstructorSeasonStats(constructorId);
        standingChanges = getConstructorStandingChanges(constructorId);
        pointsProgression = getConstructorPointsProgression(constructorId);
        reliabilityStats = getConstructorReliabilityStatistics(constructorId);
        combinedDriverPoints = getCombinedDriverPoints(constructorId);
        performanceByCircuit = getPerformanceByCircuitType(constructorId);
        fastestLapsCount = getConstructorFastestLapsCount(constructorId);
        pitStopStatistics = getConstructorPitStopStatistics(constructorId);

        // Update all charts
        updateCharts();
    }

    function updateCharts() {
        // Points Progression Chart
        if (pointsChartEl && pointsProgression) {
            if (chartInstances.points) chartInstances.points.dispose();
            chartInstances.points = echarts.init(pointsChartEl);
            chartInstances.points.setOption({
                title: {
                    text: 'Points Progression',
                    left: 'center',
                    textStyle: { color: '#fff' }
                },
                tooltip: {
                    trigger: 'axis'
                },
                xAxis: {
                    type: 'category',
                    data: pointsProgression.map(p => p.raceName),
                    axisLabel: { color: '#fff' }
                },
                yAxis: {
                    type: 'value',
                    name: 'Points',
                    nameTextStyle: { color: '#fff' },
                    axisLabel: { color: '#fff' }
                },
                series: [{
                    data: pointsProgression.map(p => p.points),
                    type: 'line',
                    smooth: true,
                    lineStyle: { width: 3, color: '#5470C6' }
                }]
            });
        }

        // Constructor Standing Changes Chart
        if (standingChartEl && standingChanges) {
            if (chartInstances.standing) chartInstances.standing.dispose();
            chartInstances.standing = echarts.init(standingChartEl);
            chartInstances.standing.setOption({
                title: {
                    text: 'Constructor Standing Changes',
                    left: 'center',
                    textStyle: { color: '#fff' }
                },
                tooltip: {
                    trigger: 'axis'
                },
                xAxis: {
                    type: 'category',
                    data: standingChanges.map(s => s.raceName),
                    axisLabel: { color: '#fff' }
                },
                yAxis: {
                    type: 'value',
                    name: 'Position',
                    inverse: true,
                    min: 1,
                    max: 10,
                    nameTextStyle: { color: '#fff' },
                    axisLabel: { color: '#fff' }
                },
                series: [{
                    data: standingChanges.map(s => s.position),
                    type: 'line',
                    smooth: true,
                    lineStyle: { width: 3, color: '#EE6666' }
                }]
            });
        }

        // Reliability Statistics Chart
        if (reliabilityChartEl && reliabilityStats) {
            if (chartInstances.reliability) chartInstances.reliability.dispose();
            chartInstances.reliability = echarts.init(reliabilityChartEl);
            chartInstances.reliability.setOption({
                title: {
                    text: 'Reliability Statistics',
                    left: 'center',
                    textStyle: { color: '#fff' }
                },
                tooltip: {
                    trigger: 'axis'
                },
                xAxis: {
                    type: 'category',
                    data: reliabilityStats.map(r => r.raceName),
                    axisLabel: { color: '#fff' }
                },
                yAxis: {
                    type: 'value',
                    name: 'DNF Count',
                    nameTextStyle: { color: '#fff' },
                    axisLabel: { color: '#fff' }
                },
                series: [{
                    data: reliabilityStats.map(r => r.dnfCount),
                    type: 'bar',
                    itemStyle: { color: '#FFD700' }
                }]
            });
        }

        // Performance by Circuit Type Chart
        if (circuitChartEl && performanceByCircuit) {
            if (chartInstances.circuit) chartInstances.circuit.dispose();
            chartInstances.circuit = echarts.init(circuitChartEl);
            chartInstances.circuit.setOption({
                title: {
                    text: 'Performance by Circuit Type',
                    left: 'center',
                    textStyle: { color: '#fff' }
                },
                series: [{
                    type: 'pie',
                    data: Object.entries(performanceByCircuit).map(([key, value]) => ({
                        value,
                        name: key
                    })),
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            });
        }

        // Pit Stop Statistics Chart
        if (pitStopChartEl && pitStopStatistics) {
            if (chartInstances.pitStop) chartInstances.pitStop.dispose();
            chartInstances.pitStop = echarts.init(pitStopChartEl);
            chartInstances.pitStop.setOption({
                title: {
                    text: 'Pit Stop Statistics',
                    left: 'center',
                    textStyle: { color: '#fff' }
                },
                tooltip: {
                    trigger: 'axis'
                },
                xAxis: {
                    type: 'category',
                    data: pitStopStatistics.map(p => p.raceName),
                    axisLabel: { color: '#fff' }
                },
                yAxis: {
                    type: 'value',
                    name: 'Pit Stops',
                    nameTextStyle: { color: '#fff' },
                    axisLabel: { color: '#fff' }
                },
                series: [{
                    data: pitStopStatistics.map(p => p.count),
                    type: 'bar',
                    itemStyle: { color: '#FF6347' }
                }]
            });
        }
    }

    $: {
        if (constructorId) {
            updateData();
        }
    }
</script>

<div class="constructor-performance-overview">
    <div class="header">
        <h2>Constructor Performance Overview</h2>
    </div>
    
    <div class="constructor-selector">
        <select 
            id="constructor-select"
            bind:value={constructorId}
            class="constructor-dropdown"
        >
            {#each constructors as constructor}
                <option value={constructor}>{getConstructorName(constructor)}</option>
            {/each}
        </select>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <p class="stat-label">Combined Driver Points</p>
            <p class="stat-value">{constructorStats?.combinedDriverPoints}</p>
        </div>
        <div class="stat-card">
            <p class="stat-label">Fastest Laps</p>
            <p class="stat-value">{fastestLapsCount}</p>
        </div>
    </div>

    <div class="charts-container">
        <div class="chart-wrapper points-chart-wide" bind:this={pointsChartEl}></div>
        <div class="chart-wrapper" bind:this={standingChartEl}></div>
        <div class="chart-wrapper" bind:this={reliabilityChartEl}></div>
        <div class="chart-wrapper" bind:this={circuitChartEl}></div>
        <div class="chart-wrapper" bind:this={pitStopChartEl}></div>
    </div>
</div>

<style>
    .constructor-performance-overview {
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

    .constructor-selector select {
        background-color: var(--secondary);
        color: var(--text);
        border: 2px solid var(--primary);
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .constructor-selector select:hover {
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

    @media (max-width: 768px) {
        .charts-container {
            grid-template-columns: 1fr;
        }
    }
</style>
