import axios from 'axios';

const ERGAST_BASE_URL = 'https://ergast.com/api/f1';

// Cache for storing API responses
const cache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const getCacheKey = (endpoint, params = {}) => {
    return `ergast-${endpoint}-${JSON.stringify(params)}`;
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

// Get list of available seasons
export async function getSeasons() {
    const cacheKey = getCacheKey('seasons');
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
        const response = await axios.get(`${ERGAST_BASE_URL}/seasons.json?limit=100`);
        const seasons = response.data.MRData.SeasonTable.Seasons.map(season => season.season).reverse();
        setCacheData(cacheKey, seasons);
        return seasons;
    } catch (error) {
        console.error('Error fetching seasons:', error);
        throw error;
    }
}

// Get all drivers for a specific season
export async function getDriversForSeason(season) {
    const cacheKey = getCacheKey('drivers', { season });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
        const response = await axios.get(`${ERGAST_BASE_URL}/${season}/drivers.json`);
        const drivers = response.data.MRData.DriverTable.Drivers.map(driver => ({
            id: driver.driverId,
            code: driver.code,
            number: driver.permanentNumber,
            firstName: driver.givenName,
            lastName: driver.familyName,
            nationality: driver.nationality
        }));
        setCacheData(cacheKey, drivers);
        return drivers;
    } catch (error) {
        console.error('Error fetching drivers:', error);
        throw error;
    }
}

// Get all teams (constructors) for a specific season
export async function getTeamsForSeason(season) {
    const cacheKey = getCacheKey('constructors', { season });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
        const response = await axios.get(`${ERGAST_BASE_URL}/${season}/constructors.json`);
        const teams = response.data.MRData.ConstructorTable.Constructors.map(constructor => ({
            id: constructor.constructorId,
            name: constructor.name,
            nationality: constructor.nationality
        }));
        setCacheData(cacheKey, teams);
        return teams;
    } catch (error) {
        console.error('Error fetching teams:', error);
        throw error;
    }
}

// Get filtered statistics based on selected criteria
export async function getFilteredStats({ season, driverId, constructorId, round = 'last' }) {
    const cacheKey = getCacheKey('filtered-stats', { season, driverId, constructorId, round });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
        let url = `${ERGAST_BASE_URL}`;
        
        // Build URL based on filters
        if (season) url += `/${season}`;
        if (round) url += `/${round}`;
        if (driverId) url += `/drivers/${driverId}`;
        if (constructorId) url += `/constructors/${constructorId}`;
        
        url += '/results.json?limit=100';

        const response = await axios.get(url);
        const races = response.data.MRData.RaceTable.Races;

        // Process and aggregate statistics
        const stats = {
            totalRaces: races.length,
            wins: races.filter(race => race.Results[0].position === '1').length,
            podiums: races.filter(race => parseInt(race.Results[0].position) <= 3).length,
            pointsFinishes: races.filter(race => parseFloat(race.Results[0].points) > 0).length,
            totalPoints: races.reduce((sum, race) => sum + parseFloat(race.Results[0].points), 0),
            averageFinish: races.length > 0 
                ? races.reduce((sum, race) => sum + parseInt(race.Results[0].position), 0) / races.length 
                : 0,
            bestFinish: races.length > 0 
                ? Math.min(...races.map(race => parseInt(race.Results[0].position))) 
                : 'N/A',
            races: races.map(race => ({
                round: race.round,
                raceName: race.raceName,
                date: race.date,
                circuit: race.Circuit.circuitName,
                result: {
                    grid: parseInt(race.Results[0].grid),
                    position: parseInt(race.Results[0].position),
                    points: parseFloat(race.Results[0].points),
                    status: race.Results[0].status
                }
            }))
        };

        setCacheData(cacheKey, stats);
        return stats;
    } catch (error) {
        console.error('Error fetching filtered stats:', error);
        throw error;
    }
}

export async function getCurrentDriverStandings() {
    const cacheKey = getCacheKey('currentDriverStandings');
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
        const response = await axios.get(`${ERGAST_BASE_URL}/current/driverStandings.json`);
        const standingsData = response.data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
        
        const standings = standingsData.map(standing => ({
            position: parseInt(standing.position),
            points: parseFloat(standing.points),
            wins: parseInt(standing.wins),
            driver: {
                id: standing.Driver.driverId,
                code: standing.Driver.code,
                number: standing.Driver.permanentNumber,
                firstName: standing.Driver.givenName,
                lastName: standing.Driver.familyName,
                nationality: standing.Driver.nationality,
                team: standing.Constructors[0].name
            }
        }));

        setCacheData(cacheKey, standings);
        return standings;
    } catch (error) {
        console.error('Error fetching current driver standings:', error);
        throw error;
    }
}

export async function getDriverCareerStats(driverId) {
    const cacheKey = getCacheKey(`driver-${driverId}-career`);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
        // Get driver's basic information
        const driverResponse = await axios.get(`${ERGAST_BASE_URL}/drivers/${driverId}.json`);
        const driver = driverResponse.data.MRData.DriverTable.Drivers[0];

        // Get all driver's race results
        const resultsResponse = await axios.get(`${ERGAST_BASE_URL}/drivers/${driverId}/results.json?limit=1000`);
        const races = resultsResponse.data.MRData.RaceTable.Races;

        // Get championship winning years
        const championshipsResponse = await axios.get(`${ERGAST_BASE_URL}/drivers/${driverId}/driverStandings/1/seasons.json`);
        const championshipYears = championshipsResponse.data.MRData.StandingsTable.StandingsLists.map(
            standing => parseInt(standing.season)
        );

        // Calculate statistics
        const stats = {
            driver: {
                id: driver.driverId,
                code: driver.code,
                number: driver.permanentNumber,
                firstName: driver.givenName,
                lastName: driver.familyName,
                nationality: driver.nationality,
                dateOfBirth: driver.dateOfBirth
            },
            championships: championshipYears,
            totalRaces: races.length,
            wins: races.filter(race => race.Results[0].position === '1').length,
            podiums: races.filter(race => parseInt(race.Results[0].position) <= 3).length,
            polePositions: races.filter(race => race.Results[0].grid === '1').length,
            fastestLaps: races.filter(race => race.Results[0].FastestLap?.rank === '1').length,
            pointsFinishes: races.filter(race => parseFloat(race.Results[0].points) > 0).length,
            firstRace: races[0]?.season || 'Unknown',
            lastRace: races[races.length - 1]?.season || 'Unknown'
        };

        setCacheData(cacheKey, stats);
        return stats;
    } catch (error) {
        console.error('Error fetching driver career stats:', error);
        throw error;
    }
}
