import raceData from '../../../data/2024_data.json';

// Add team mapping
const TEAM_MAPPING = {
    'red_bull': ['max_verstappen', 'perez'],
    'ferrari': ['leclerc', 'sainz'],
    'mercedes': ['hamilton', 'russell'],
    'mclaren': ['norris', 'piastri'],
    'aston_martin': ['alonso', 'stroll'],
    'alpine': ['ocon', 'gasly'],
    'alfa_romeo': ['bottas', 'zhou'],
    'haas': ['magnussen', 'hulkenberg'],
    'williams': ['albon', 'sargeant'],
    'rb': ['ricciardo', 'tsunoda']
};

export function getHeadToHeadComparison(driverId, raceResults) {
    console.log('Driver ID:', driverId);
    console.log('Team Mapping:', TEAM_MAPPING);
    
    const driverTeam = Object.keys(TEAM_MAPPING).find(team => 
        TEAM_MAPPING[team].includes(driverId)
    );
    
    console.log('Driver Team:', driverTeam);
    
    if (!driverTeam) {
        console.warn(`No team found for driver: ${driverId}`);
        return null;
    }

    const teammate = TEAM_MAPPING[driverTeam].find(id => id !== driverId);
    
    console.log('Teammate:', teammate);
    
    // Get all race results for the entire season
    const races = Object.values(raceData.races['2024']);
    
    // Collect race results for both driver and teammate
    const headToHeadResults = races.map(race => {
        const driverRaceResult = race.results.race.find(r => r.driverId === driverId);
        const teammateRaceResult = race.results.race.find(r => r.driverId === teammate);
        
        return {
            race: race.info.name,
            driverPosition: driverRaceResult?.position || null,
            teammatePosition: teammateRaceResult?.position || null
        };
    });

    // Calculate head-to-head statistics
    const totalRaces = headToHeadResults.length;
    const completedRaces = headToHeadResults.filter(
        race => race.driverPosition !== null && race.teammatePosition !== null
    );
    
    const driverWins = completedRaces.filter(
        race => race.driverPosition < race.teammatePosition
    ).length;
    
    const teammateWins = completedRaces.filter(
        race => race.teammatePosition < race.driverPosition
    ).length;

    return {
        teammate: getDriverName(teammate),
        headToHeadResults: headToHeadResults,
        stats: {
            totalRaces,
            completedRaces: completedRaces.length,
            driverWins,
            teammateWins,
            driverWinPercentage: (driverWins / completedRaces.length) * 100,
            teammateWinPercentage: (teammateWins / completedRaces.length) * 100
        }
    };
}

export function getDriverSeasonStats(driverId) {
    const races = Object.values(raceData.races['2024']);
    
    const raceResults = races.map(race => {
        const result = race.results.race.find(r => r.driverId === driverId);
        const sprintResult = race.results.sprint?.results?.find(r => r.driverId === driverId);
        
        return {
            raceName: race.info.name,
            position: result?.position || null,
            racePoints: result?.points || 0,
            sprintPoints: sprintResult?.points || 0,
            points: (result?.points || 0) + (sprintResult?.points || 0),
            gridPosition: result?.gridPosition || null,
            status: result?.status || null,
            performance: race.driverPerformance[driverId] || null,
            driverId: driverId
        };
    });

    // Calculate season statistics with cumulative points including sprint points
    const stats = {
        // Points Progression (cumulative points after each race, including sprint points)
        pointsProgression: raceResults.reduce((acc, race, index) => {
            const previousPoints = index > 0 ? acc[index - 1].points : 0;
            acc.push({
                race: race.raceName,
                racePoints: race.racePoints,
                sprintPoints: race.sprintPoints,
                points: previousPoints + race.points
            });
            return acc;
        }, []),

        // Position changes across races
        positionChanges: raceResults.map(race => ({
            race: race.raceName,
            position: race.position
        })),

        // Win percentage
        wins: raceResults.filter(r => r.position === 1).length,
        winPercentage: (raceResults.filter(r => r.position === 1).length / raceResults.length) * 100,

        // Podium percentage (top 3)
        podiums: raceResults.filter(r => r.position && r.position <= 3).length,
        podiumPercentage: (raceResults.filter(r => r.position && r.position <= 3).length / raceResults.length) * 100,

        // Average finishing position (excluding DNFs)
        finishedRaces: raceResults.filter(r => r.position !== null),
        averageFinishingPosition: raceResults.filter(r => r.position !== null)
            .reduce((acc, race) => acc + race.position, 0) / 
            raceResults.filter(r => r.position !== null).length,

        // DNF rate
        dnfs: raceResults.filter(r => r.status !== 'Finished').length,
        dnfRate: (raceResults.filter(r => r.status !== 'Finished').length / raceResults.length) * 100,
        
        // Total points (including sprint points)
        totalPoints: raceResults.reduce((acc, race) => acc + race.points, 0),

        // New Performance Metrics
        qualifyingVsRacePositionDelta: raceResults.map(race => ({
            race: race.raceName,
            gridPosition: race.gridPosition,
            finishPosition: race.position,
            delta: (race.gridPosition || 0) - (race.position || 0)
        })),
        
        headToHeadComparison: getHeadToHeadComparison(driverId, raceResults),

        // Raw race results for detailed analysis
        raceResults: raceResults
    };

    return stats;
}

export function getAllDriverIds() {
    const firstRace = Object.values(raceData.races['2024'])[0];
    
    // Create a mapping of driver IDs to their full names
    const driverMap = firstRace.results.race.reduce((acc, result) => {
        // You might want to enhance this with more comprehensive driver information
        acc[result.driverId] = result.driverId; // Placeholder for now
        return acc;
    }, {});

    return Object.keys(driverMap);
}

export function getDriverName(driverId) {
    const driverNames = {
        'max_verstappen': 'Max Verstappen',
        'perez': 'Sergio Perez',
        'leclerc': 'Charles Leclerc',
        'sainz': 'Carlos Sainz',
        'norris': 'Lando Norris',
        'piastri': 'Oscar Piastri',
        'hamilton': 'Lewis Hamilton',
        'russell': 'George Russell',
        'alonso': 'Fernando Alonso',
        'stroll': 'Lance Stroll',
        'ocon': 'Esteban Ocon',
        'gasly': 'Pierre Gasly',
        'bottas': 'Valtteri Bottas',
        'zhou': 'Guanyu Zhou',
        'magnussen': 'Kevin Magnussen',
        'hulkenberg': 'Nico Hulkenberg',
        'albon': 'Alexander Albon',
        'sargeant': 'Logan Sargeant',
        'ricciardo': 'Daniel Ricciardo',
        'tsunoda': 'Yuki Tsunoda'
    };

    return driverNames[driverId] || driverId;
}

export function getConstructorSeasonStats(constructorId) {
    const races = Object.values(raceData.races['2024']);

    const raceResults = races.map(race => {
        const results = race.results.race.filter(r => r.constructorId === constructorId);
        const totalPoints = results.reduce((acc, r) => acc + r.points, 0);
        const dnfCount = results.filter(r => r.status !== 'Finished').length;
        return {
            raceName: race.info.name,
            totalPoints,
            dnfCount,
            driverResults: results
        };
    });

    // Calculate constructor statistics
    const totalRaces = raceResults.length;
    const completedRaces = raceResults.filter(r => r.driverResults.length > 0);
    const combinedDriverPoints = completedRaces.reduce((acc, r) => acc + r.totalPoints, 0);

    return {
        raceResults,
        totalRaces,
        completedRaces: completedRaces.length,
        combinedDriverPoints,
        dnfCount: raceResults.reduce((acc, r) => acc + r.dnfCount, 0)
    };
}

export function getConstructorStandingChanges(constructorId) {
    const races = Object.values(raceData.races['2024']);
    const standings = races.map(race => {
        // Logic to calculate standing changes for the constructor
        return {
            raceName: race.info.name,
            position: race.standings.constructors.find(c => c.constructorId === constructorId)?.position
        };
    });
    return standings;
}

export function getConstructorPointsProgression(constructorId) {
    const races = Object.values(raceData.races['2024']);
    const pointsProgression = races.map(race => {
        const totalPoints = race.results.race
            .filter(r => r.constructorId === constructorId)
            .reduce((acc, r) => acc + r.points, 0);
        return {
            raceName: race.info.name,
            points: totalPoints
        };
    });
    return pointsProgression;
}

export function getConstructorReliabilityStatistics(constructorId) {
    const races = Object.values(raceData.races['2024']);
    const reliabilityStats = races.map(race => {
        const dnfCount = race.results.race
            .filter(r => r.constructorId === constructorId && r.status !== 'Finished').length;
        return {
            raceName: race.info.name,
            dnfCount
        };
    });
    return reliabilityStats;
}

export function getPerformanceByCircuitType(constructorId) {
    const races = Object.values(raceData.races['2024']);
    const performanceByCircuit = races.reduce((acc, race) => {
        const circuitType = race.info.circuit.circuitName; // Assuming circuit type can be derived from the circuit name
        const totalPoints = race.results.race
            .filter(r => r.constructorId === constructorId)
            .reduce((sum, r) => sum + r.points, 0);
        if (!acc[circuitType]) {
            acc[circuitType] = 0;
        }
        acc[circuitType] += totalPoints;
        return acc;
    }, {});
    return performanceByCircuit;
}

export function getCombinedDriverPoints(constructorId) {
    const races = Object.values(raceData.races['2024']);
    let totalCombinedPoints = 0;

    races.forEach(race => {
        const raceResults = race.results.race;
        const constructorResults = raceResults.filter(r => r.constructorId === constructorId);

        // Sum points from both drivers in the constructor
        const racePoints = constructorResults.reduce((acc, r) => acc + r.points, 0);
        const sprintPoints = race.results.sprint?.results
            ? race.results.sprint.results.filter(r => r.constructorId === constructorId).reduce((acc, r) => acc + r.points, 0) : 0;

        console.log(`Race: ${race.info.name}, Race Points: ${racePoints}, Sprint Points: ${sprintPoints}`);

        totalCombinedPoints += racePoints + sprintPoints;
    });

    console.log(`Total Combined Points for ${constructorId}: ${totalCombinedPoints}`);

    return totalCombinedPoints;
}

export function getConstructorFastestLaps(constructorId) {
    const races = Object.values(raceData.races['2024']);
    const fastestLaps = races.map(race => {
        const driverResults = race.results.race.filter(r => r.constructorId === constructorId);
        const fastestLap = driverResults.reduce((fastest, current) => {
            return (current.fastestLap && (!fastest || current.fastestLap.time < fastest.fastestLap.time)) ? current : fastest;
        }, null);
        return {
            raceName: race.info.name,
            time: fastestLap ? fastestLap.fastestLap.time : null
        };
    });
    return fastestLaps;
}

export function getConstructorPitStopStatistics(constructorId) {
    const races = Object.values(raceData.races['2024']);
    const pitStopStats = races.map(race => {
        const driverResults = race.results.race.filter(r => r.constructorId === constructorId);
        const totalPitStops = driverResults.reduce((total, current) => {
            return total + (current.pitStops ? current.pitStops.length : 0);
        }, 0);
        
        return {
            raceName: race.info.name,
            count: totalPitStops,
            averageTime: driverResults.reduce((total, current) => {
                if (!current.pitStops || current.pitStops.length === 0) return total;
                const avgTime = current.pitStops.reduce((sum, stop) => sum + stop.duration, 0) / current.pitStops.length;
                return total + avgTime;
            }, 0) / (driverResults.length || 1)
        };
    });
    return pitStopStats;
}

export function getAllConstructorIds() {
    return Object.keys(TEAM_MAPPING);
}

export function getConstructorName(constructorId) {
    const names = {
        'red_bull': 'Red Bull Racing',
        'ferrari': 'Ferrari',
        'mercedes': 'Mercedes',
        'mclaren': 'McLaren',
        'aston_martin': 'Aston Martin',
        'alpine': 'Alpine',
        'alfa_romeo': 'Alfa Romeo',
        'haas': 'Haas F1',
        'williams': 'Williams',
        'rb': 'Racing Bulls'
    };
    return names[constructorId] || constructorId;
}

export function getConstructorFastestLapsCount(constructorId) {
    let fastestLapCount = 0;

    for (const raceId in raceData.races["2024"]) {
        const raceResults = raceData.races["2024"][raceId].results.race;
        raceResults.forEach(result => {
            if (result.constructorId === constructorId && result.fastestLap && result.fastestLap.wasFastest) {
                fastestLapCount++;
            }
        });
    }

    return fastestLapCount;
}
