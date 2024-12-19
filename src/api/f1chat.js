// F1 Chat API service

export async function fetchDriverNumber(driverName) {
    try {
        const url = 'https://api.openf1.org/v1/drivers';
        console.log('Fetching driver number:', url);
        const response = await fetch(url);
        const drivers = await response.json();
        console.log('Drivers response:', drivers);

        if (response.ok && drivers) {
            for (const driver of drivers) {
                if (driver.full_name.toLowerCase() === driverName.toLowerCase()) {
                    return driver.driver_number;
                }
            }
        }
        return null;
    } catch (error) {
        console.error('Error fetching driver number:', error);
        return null;
    }
}

export async function fetchMeetingKey(year, countryName) {
    try {
        const url = `https://api.openf1.org/v1/meetings?year=${year}&country_name=${countryName}`;
        console.log('Fetching meeting key:', url);
        const response = await fetch(url);
        const data = await response.json();
        console.log('Meeting key response:', data);
        
        if (response.ok && data && data.length > 0 && data[0].meeting_key) {
            return data[0].meeting_key;
        }
        return null;
    } catch (error) {
        console.error('Error fetching meeting key:', error);
        return null;
    }
}

export async function fetchStintsForSession(driverNumber, sessionKey) {
    try {
        const url = `https://api.openf1.org/v1/stints?driver_number=${driverNumber}&session_key=${sessionKey}`;
        console.log('Fetching stints for session:', url);
        const response = await fetch(url);
        const data = await response.json();
        console.log('Stints response for session:', data);
        
        if (response.ok) {
            return data;
        }
        return [];
    } catch (error) {
        console.error('Error fetching stints:', error);
        return [];
    }
}

export async function fetchSessionInfo(year, countryName) {
    try {
        const url = `https://api.openf1.org/v1/sessions?year=${year}&country_name=${countryName}`;
        console.log('Fetching session info:', url);
        const response = await fetch(url);
        const sessions = await response.json();
        console.log('Sessions response:', sessions);

        if (response.ok && sessions && sessions.length > 0) {
            return sessions;
        }
        return null;
    } catch (error) {
        console.error('Error fetching session info:', error);
        return null;
    }
}

export function formatResponse(driverName, year, countryName, sessions, sessionStints) {
    if (!sessions || sessions.length === 0) {
        return {
            text: `No sessions found for ${countryName} ${year}.`,
            chartOptions: null
        };
    }

    let textResponse = `${driverName}'s stints in ${countryName} ${year}:\n\n`;
    
    // Prepare data for ECharts
    const chartData = [];
    let currentLap = 0;

    sessions.forEach(session => {
        const startDate = new Date(session.date_start).toLocaleString();
        const stints = sessionStints[session.session_key] || [];
        
        textResponse += `${session.session_name}: ${startDate}\n`;
        
        if (stints.length === 0) {
            textResponse += `No stint data available for this session.\n`;
        } else {
            stints.forEach(stint => {
                textResponse += `Stint ${stint.stint_number}: ` +
                          `Compound - ${stint.compound}, ` +
                          `Laps - ${stint.lap_start} to ${stint.lap_end}, ` +
                          `Tyre Age - ${stint.tyre_age_at_start} laps at start.\n`;

                // Add data for chart
                chartData.push({
                    name: session.session_name,
                    compound: stint.compound,
                    startLap: stint.lap_start,
                    endLap: stint.lap_end,
                    tyreAge: stint.tyre_age_at_start
                });
            });
        }
        textResponse += '\n';
    });

    // Create ECharts options
    const chartOptions = {
        title: {
            text: `${driverName}'s Tyre Stints - ${countryName} ${year}`,
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                const data = params[0].data;
                return `${data.name}<br/>` +
                       `Compound: ${data.compound}<br/>` +
                       `Laps: ${data.startLap}-${data.endLap}<br/>` +
                       `Tyre Age at Start: ${data.tyreAge}`;
            }
        },
        legend: {
            data: ['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET', 'UNKNOWN'],
            top: 30
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            name: 'Lap Number',
            nameLocation: 'middle',
            nameGap: 30
        },
        yAxis: {
            type: 'category',
            data: [...new Set(chartData.map(item => item.name))].reverse(),
            name: 'Session'
        },
        series: [
            {
                type: 'custom',
                renderItem: function(params, api) {
                    const categoryIndex = api.value(0);
                    const start = api.coord([api.value(1), categoryIndex]);
                    const end = api.coord([api.value(2), categoryIndex]);
                    const height = api.size([0, 1])[1] * 0.6;
                    
                    const compound = api.value(3);
                    const color = {
                        'SOFT': '#ff0000',
                        'MEDIUM': '#ffff00',
                        'HARD': '#ffffff',
                        'INTERMEDIATE': '#00ff00',
                        'WET': '#0000ff',
                        'UNKNOWN': '#808080'
                    }[compound] || '#808080';

                    return {
                        type: 'rect',
                        shape: {
                            x: start[0],
                            y: start[1] - height / 2,
                            width: end[0] - start[0],
                            height: height
                        },
                        style: {
                            fill: color
                        }
                    };
                },
                dimensions: [
                    {name: 'session', type: 'ordinal'},
                    {name: 'startLap', type: 'number'},
                    {name: 'endLap', type: 'number'},
                    {name: 'compound', type: 'ordinal'},
                ],
                encode: {
                    x: [1, 2],
                    y: 0
                },
                data: chartData.map(stint => [
                    stint.name,
                    stint.startLap,
                    stint.endLap,
                    stint.compound
                ])
            }
        ]
    };

    return {
        text: textResponse,
        chartOptions: chartOptions
    };
}

export async function processChatQuery(query) {
    console.log('Processing query:', query);
    
    // Basic regex patterns to extract information
    const yearPattern = /\b20\d{2}\b/;
    const driverPattern = /(?:Max Verstappen|Lewis Hamilton|Charles Leclerc|Carlos Sainz|Lando Norris|George Russell|Sergio Perez|Fernando Alonso|Liam Lawson|Yuki Tsunoda)/i;
    const countryPattern = /(?:Australia|Austria|Azerbaijan|Bahrain|Belgium|Brazil|Canada|China|Hungary|Italy|Japan|Mexico|Monaco|Netherlands|Saudi Arabia|Singapore|Spain|United Arab Emirates|United Kingdom|United States|Qatar|Las Vegas)/i;

    // Extract information from query
    const yearMatch = query.match(yearPattern);
    const driverMatch = query.match(driverPattern);
    const countryMatch = query.match(countryPattern);

    console.log('Extracted data:', {
        year: yearMatch?.[0],
        driver: driverMatch?.[0],
        country: countryMatch?.[0]
    });

    // If we don't have all required information
    if (!yearMatch || !driverMatch || !countryMatch) {
        return {
            text: "Please provide a query with a year (e.g., 2023), driver name, and country. For example: 'What were Max Verstappen's stints in Brazil 2023?'",
            chartOptions: null
        };
    }

    const year = yearMatch[0];
    const driverName = driverMatch[0];
    const countryName = countryMatch[0];

    // Fetch session information
    const sessions = await fetchSessionInfo(year, countryName);
    console.log('Retrieved sessions:', sessions);

    if (!sessions) {
        return {
            text: `Could not find any sessions for ${countryName} ${year}.`,
            chartOptions: null
        };
    }

    // Fetch driver number
    const driverNumber = await fetchDriverNumber(driverName);
    console.log('Retrieved driver number:', driverNumber);
    
    if (!driverNumber) {
        return {
            text: `Could not find driver number for ${driverName}.`,
            chartOptions: null
        };
    }

    // Fetch stints for each session
    const sessionStints = {};
    for (const session of sessions) {
        const stints = await fetchStintsForSession(driverNumber, session.session_key);
        if (stints && stints.length > 0) {
            // Sort stints by stint_number
            sessionStints[session.session_key] = stints.sort((a, b) => a.stint_number - b.stint_number);
        }
    }

    return formatResponse(driverName, year, countryName, sessions, sessionStints);
}
