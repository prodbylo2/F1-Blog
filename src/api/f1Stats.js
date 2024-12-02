import axios from 'axios';

const BASE_URL = 'https://api.openf1.org/v1';

// Cache for storing API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (endpoint, params) => {
    // Ensure consistent type handling for cache keys
    const normalizedParams = Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, Number(value)])
    );
    return `${endpoint}-${JSON.stringify(normalizedParams)}`;
};

const getCachedData = (key) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
};

const setCacheData = (key, data) => {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
};

// Mock data for development with year-specific data
const mockData = {
    2024: {
        races: [
            { id: 1, name: 'Bahrain Grand Prix', date: '2024-03-02' },
            { id: 2, name: 'Saudi Arabian Grand Prix', date: '2024-03-09' },
            { id: 3, name: 'Australian Grand Prix', date: '2024-03-24' }
        ],
        drivers: [
            { id: 1, name: 'Max Verstappen', number: 1, team: 'Red Bull Racing' },
            { id: 44, name: 'Lewis Hamilton', number: 44, team: 'Mercedes' },
            { id: 16, name: 'Charles Leclerc', number: 16, team: 'Ferrari' }
        ],
        teams: [
            { id: 1, name: 'Red Bull Racing', country: 'Austria' },
            { id: 2, name: 'Mercedes', country: 'Germany' },
            { id: 3, name: 'Ferrari', country: 'Italy' }
        ],
        stats: {
            driver: {
                1: { wins: 19, podiums: 21, points: 575, championships: 3 },
                44: { wins: 2, podiums: 6, points: 234, championships: 7 },
                16: { wins: 3, podiums: 9, points: 308, championships: 0 }
            },
            team: {
                1: { wins: 21, podiums: 38, points: 860, championships: 6 },
                2: { wins: 4, podiums: 12, points: 409, championships: 8 },
                3: { wins: 4, podiums: 14, points: 406, championships: 16 }
            },
            race: {
                1: { winner: 'Max Verstappen', fastestLap: '1:32.608', podium: ['Max Verstappen', 'Sergio Perez', 'Carlos Sainz'] },
                2: { winner: 'Max Verstappen', fastestLap: '1:31.906', podium: ['Max Verstappen', 'Sergio Perez', 'Charles Leclerc'] },
                3: { winner: 'Carlos Sainz', fastestLap: '1:20.235', podium: ['Carlos Sainz', 'Charles Leclerc', 'Lando Norris'] }
            }
        }
    },
    2023: {
        races: [
            { id: 1, name: 'Bahrain Grand Prix', date: '2023-03-05' },
            { id: 2, name: 'Saudi Arabian Grand Prix', date: '2023-03-19' },
            { id: 3, name: 'Australian Grand Prix', date: '2023-04-02' }
        ],
        drivers: [
            { id: 1, name: 'Max Verstappen', number: 1, team: 'Red Bull Racing' },
            { id: 44, name: 'Lewis Hamilton', number: 44, team: 'Mercedes' },
            { id: 16, name: 'Charles Leclerc', number: 16, team: 'Ferrari' }
        ],
        teams: [
            { id: 1, name: 'Red Bull Racing', country: 'Austria' },
            { id: 2, name: 'Mercedes', country: 'Germany' },
            { id: 3, name: 'Ferrari', country: 'Italy' }
        ],
        stats: {
            driver: {
                1: { wins: 15, podiums: 18, points: 454, championships: 2 },
                44: { wins: 0, podiums: 6, points: 234, championships: 7 },
                16: { wins: 1, podiums: 6, points: 206, championships: 0 }
            },
            team: {
                1: { wins: 17, podiums: 30, points: 759, championships: 5 },
                2: { wins: 1, podiums: 8, points: 389, championships: 8 },
                3: { wins: 1, podiums: 9, points: 356, championships: 16 }
            },
            race: {
                1: { winner: 'Max Verstappen', fastestLap: '1:33.996', podium: ['Max Verstappen', 'Sergio Perez', 'Fernando Alonso'] },
                2: { winner: 'Sergio Perez', fastestLap: '1:31.906', podium: ['Sergio Perez', 'Max Verstappen', 'Fernando Alonso'] },
                3: { winner: 'Max Verstappen', fastestLap: '1:20.235', podium: ['Max Verstappen', 'Lewis Hamilton', 'Fernando Alonso'] }
            }
        }
    }
};

export async function getRaces(season) {
    season = Number(season);
    const cacheKey = getCacheKey('races', { season });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
        const yearData = mockData[season];
        if (!yearData) {
            return [];
        }
        const races = yearData.races;
        setCacheData(cacheKey, races);
        return races;
    } catch (error) {
        console.error('Error fetching races:', error);
        return [];
    }
}

export async function getDrivers(season) {
    season = Number(season);
    const cacheKey = getCacheKey('drivers', { season });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
        const yearData = mockData[season];
        if (!yearData) {
            return [];
        }
        const drivers = yearData.drivers;
        setCacheData(cacheKey, drivers);
        return drivers;
    } catch (error) {
        console.error('Error fetching drivers:', error);
        return [];
    }
}

export async function getTeams(season) {
    season = Number(season);
    const cacheKey = getCacheKey('teams', { season });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
        const yearData = mockData[season];
        if (!yearData) {
            return [];
        }
        const teams = yearData.teams;
        setCacheData(cacheKey, teams);
        return teams;
    } catch (error) {
        console.error('Error fetching teams:', error);
        return [];
    }
}

export async function getDriverStats(driverId, season) {
    driverId = Number(driverId);
    season = Number(season);
    const cacheKey = getCacheKey('driverStats', { driverId, season });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
        const yearData = mockData[season];
        if (!yearData) return null;

        const stats = yearData.stats.driver[driverId];
        if (stats) {
            const driver = yearData.drivers.find(d => d.id === driverId);
            const result = { ...stats, name: driver?.name, season };
            setCacheData(cacheKey, result);
            return result;
        }
        return null;
    } catch (error) {
        console.error('Error fetching driver stats:', error);
        throw error;
    }
}

export async function getTeamStats(teamId, season) {
    teamId = Number(teamId);
    season = Number(season);
    const cacheKey = getCacheKey('teamStats', { teamId, season });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
        const yearData = mockData[season];
        if (!yearData) return null;

        const stats = yearData.stats.team[teamId];
        if (stats) {
            const team = yearData.teams.find(t => t.id === teamId);
            const result = { ...stats, name: team?.name, season };
            setCacheData(cacheKey, result);
            return result;
        }
        return null;
    } catch (error) {
        console.error('Error fetching team stats:', error);
        throw error;
    }
}

export async function getRaceStats(raceId, season) {
    raceId = Number(raceId);
    season = Number(season);
    const cacheKey = getCacheKey('raceStats', { raceId, season });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
        const yearData = mockData[season];
        if (!yearData) return null;

        const stats = yearData.stats.race[raceId];
        if (stats) {
            const race = yearData.races.find(r => r.id === raceId);
            const result = { ...stats, name: race?.name, season };
            setCacheData(cacheKey, result);
            return result;
        }
        return null;
    } catch (error) {
        console.error('Error fetching race stats:', error);
        throw error;
    }
}
