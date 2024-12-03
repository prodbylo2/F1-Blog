import axios from 'axios';

const BASE_URL = 'https://api.openf1.org/v1';

// Cache for storing API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const clearCache = () => {
    cache.clear();
};

const getCacheKey = (endpoint, params) => {
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

export async function getRaces(season) {
    season = Number(season);
    const cacheKey = getCacheKey('races', { season });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
        const response = await axios.get(`${BASE_URL}/sessions`, {
            params: {
                year: season,
                session_type: 'Race'
            }
        });
        
        const races = response.data.map(race => ({
            id: race.session_id,
            name: race.meeting_name,
            date: race.date_start,
            circuit: race.circuit_short_name
        }));
        
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
        console.log('Fetching drivers for season:', season);
        
        // Get all race sessions for the season
        const sessionsResponse = await axios.get(`${BASE_URL}/sessions`, {
            params: {
                year: season,
                session_type: 'Race'
            }
        });
        
        console.log('Sessions response:', sessionsResponse.data);
        
        if (!sessionsResponse.data.length) {
            console.log('No sessions found for season:', season);
            return [];
        }

        // Get all session IDs for the season
        const sessionIds = sessionsResponse.data.map(session => session.session_id);
        
        // Get drivers from all sessions
        const driversPromises = sessionIds.map(sessionId => 
            axios.get(`${BASE_URL}/drivers`, {
                params: {
                    session_id: sessionId
                }
            })
        );
        
        const driversResponses = await Promise.all(driversPromises);
        
        // Combine all driver data
        const allDrivers = driversResponses.flatMap(response => response.data);
        
        console.log('All drivers data:', allDrivers);
        
        // Process and deduplicate drivers
        const drivers = allDrivers
            .filter(driver => driver.driver_number && driver.first_name && driver.last_name)
            .map(driver => ({
                id: driver.driver_number,
                name: `${driver.first_name} ${driver.last_name}`,
                number: driver.driver_number,
                team: driver.team_name || 'Unknown Team'
            }));
        
        // Remove duplicates and sort alphabetically
        const uniqueDrivers = Array.from(
            new Map(drivers.map(item => [item.id, item])).values()
        ).sort((a, b) => a.name.localeCompare(b.name));
        
        console.log('Processed drivers for season', season, ':', uniqueDrivers);
        
        setCacheData(cacheKey, uniqueDrivers);
        return uniqueDrivers;
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
        console.log('Fetching teams for season:', season);
        const response = await axios.get(`${BASE_URL}/constructors`, {
            params: {
                year: season
            }
        });
        
        console.log('Raw team response:', response.data);
        
        const teams = response.data
            .filter(team => team.team_name)
            .map(team => ({
                id: team.constructor_id || team.team_id,
                name: team.team_name,
                country: team.country || 'Unknown'
            }));
        
        // Remove duplicates based on team name
        const uniqueTeams = Array.from(
            new Map(teams.map(item => [item.name, item])).values()
        ).sort((a, b) => a.name.localeCompare(b.name));
        
        console.log('Processed teams:', uniqueTeams);
        
        setCacheData(cacheKey, uniqueTeams);
        return uniqueTeams;
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
        // Get driver details
        const driverResponse = await axios.get(`${BASE_URL}/drivers`, {
            params: {
                driver_number: driverId,
                year: season
            }
        });

        if (!driverResponse.data.length) return null;

        // Get race results for the driver
        const resultsResponse = await axios.get(`${BASE_URL}/results`, {
            params: {
                driver_number: driverId,
                year: season
            }
        });

        const driver = driverResponse.data[0];
        const results = resultsResponse.data;

        const stats = {
            name: `${driver.first_name} ${driver.last_name}`,
            wins: results.filter(r => r.position === 1).length,
            podiums: results.filter(r => r.position <= 3).length,
            points: results.reduce((sum, r) => sum + (r.points || 0), 0),
            season: season
        };

        setCacheData(cacheKey, stats);
        return stats;
    } catch (error) {
        console.error('Error fetching driver stats:', error);
        return null;
    }
}

export async function getTeamStats(teamId, season) {
    teamId = Number(teamId);
    season = Number(season);
    const cacheKey = getCacheKey('teamStats', { teamId, season });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
        // Get team results
        const response = await axios.get(`${BASE_URL}/results`, {
            params: {
                team_id: teamId,
                year: season
            }
        });

        if (!response.data.length) return null;

        const results = response.data;
        const teamName = results[0]?.team_name;

        const stats = {
            name: teamName,
            wins: results.filter(r => r.position === 1).length,
            podiums: results.filter(r => r.position <= 3).length,
            points: results.reduce((sum, r) => sum + (r.points || 0), 0),
            season: season
        };

        setCacheData(cacheKey, stats);
        return stats;
    } catch (error) {
        console.error('Error fetching team stats:', error);
        return null;
    }
}

export async function getRaceStats(raceId, season) {
    raceId = Number(raceId);
    season = Number(season);
    const cacheKey = getCacheKey('raceStats', { raceId, season });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
        // Get session details
        const sessionResponse = await axios.get(`${BASE_URL}/sessions`, {
            params: {
                session_id: raceId
            }
        });

        if (!sessionResponse.data.length) return null;

        // Get race results
        const resultsResponse = await axios.get(`${BASE_URL}/results`, {
            params: {
                session_id: raceId
            }
        });

        const session = sessionResponse.data[0];
        const results = resultsResponse.data.sort((a, b) => a.position - b.position);

        const stats = {
            name: session.meeting_name,
            winner: results[0] ? `${results[0].first_name} ${results[0].last_name}` : 'Unknown',
            fastestLap: results.reduce((fastest, r) => 
                r.fastest_lap_time && (!fastest || r.fastest_lap_time < fastest) ? r.fastest_lap_time : fastest, null
            ),
            podium: results.slice(0, 3).map(r => `${r.first_name} ${r.last_name}`),
            season: season
        };

        setCacheData(cacheKey, stats);
        return stats;
    } catch (error) {
        console.error('Error fetching race stats:', error);
        return null;
    }
}
