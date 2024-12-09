// Type definitions for driverAnalytics module

export interface RaceResult {
    raceName: string;
    position: number | null;
    racePoints: number;
    sprintPoints: number;
    points: number;  // Total points for the weekend
    gridPosition: number | null;
    status: string | null;
    performance: any | null;
}

export interface PointsProgression {
    race: string;
    racePoints: number;
    sprintPoints: number;
    points: number;
}

export interface SeasonStats {
    pointsProgression: PointsProgression[];
    positionChanges: Array<{
        race: string;
        position: number | null;
    }>;
    wins: number;
    winPercentage: number;
    podiums: number;
    podiumPercentage: number;
    finishedRaces: RaceResult[];
    averageFinishingPosition: number;
    dnfs: number;
    dnfRate: number;
    totalPoints: number;
    raceResults: RaceResult[];
}

export function getDriverSeasonStats(driverId: string): SeasonStats;
export function getAllDriverIds(): string[];
export function getDriverName(driverId: string): string;
