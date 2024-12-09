import raceData from '../../../data/2024_data.json';

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
            points: (result?.points || 0) + (sprintResult?.points || 0),  // Total points for the weekend
            gridPosition: result?.gridPosition || null,
            status: result?.status || null,
            performance: race.driverPerformance[driverId] || null
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
        'VER': 'Max Verstappen',
        'PER': 'Sergio Perez',
        'LEC': 'Charles Leclerc',
        'SAI': 'Carlos Sainz',
        'NOR': 'Lando Norris',
        'RIC': 'Daniel Ricciardo',
        'HAM': 'Lewis Hamilton',
        'RUS': 'George Russell',
        'ALO': 'Fernando Alonso',
        'STR': 'Lance Stroll',
        'OCO': 'Esteban Ocon',
        'GAZ': 'Pierre Gasly',
        'BOT': 'Valtteri Bottas',
        'ZHO': 'Guanyu Zhou',
        'ALB': 'Alexander Albon',
        'SAR': 'Logan Sargeant',
        'MAG': 'Kevin Magnussen',
        'HUL': 'Nico Hulkenberg'
    };

    return driverNames[driverId] || driverId;
}
