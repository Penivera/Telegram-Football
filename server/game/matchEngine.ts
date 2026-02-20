import { type Player, type Squad } from "@shared/schema";

export interface TeamStats {
    attack: number;
    defense: number;
    speed: number;
    stamina: number;
}

// Extract the 11 starters from a squad to calculate average stats
export function getStartingLineupStats(players: Player[], squad: Squad): TeamStats {
    const starterIds = [
        squad.gk_id, squad.lf_id, squad.rf_id, squad.lm_id,
        squad.cm1_id, squad.cm2_id, squad.rm_id, squad.lb_id,
        squad.cb1_id, squad.cb2_id, squad.rb_id
    ].filter(id => id !== null);

    const starters = players.filter(p => starterIds.includes(p.id));

    if (starters.length === 0) {
        return { attack: 0, defense: 0, speed: 0, stamina: 0 };
    }

    const totals = starters.reduce((acc, p) => ({
        attack: acc.attack + p.attack,
        defense: acc.defense + p.defense,
        speed: acc.speed + p.speed,
        stamina: acc.stamina + p.stamina
    }), { attack: 0, defense: 0, speed: 0, stamina: 0 });

    return {
        attack: totals.attack / starters.length,
        defense: totals.defense / starters.length,
        speed: totals.speed / starters.length,
        stamina: totals.stamina / starters.length,
    };
}

// Calculate team strength based on the MVP formula
export function calculateTeamStrength(stats: TeamStats, formationBonus: number = 5): number {
    const attackWeight = stats.attack * 0.35;
    const defenseWeight = stats.defense * 0.30;
    // Note: Speed isn't explicitly in the formula for team strength but we can assume it contributes slightly
    // Or stick strictly to MVP: (Avg Attack 0.35) + (Avg Def 0.30) + (Formation 0.15) + (Avg Stamina 0.10) + (Random 0-8%)
    const staminaWeight = stats.stamina * 0.10;

    // Random factor between 0 and 8
    const randomFactor = Math.random() * 8;

    return attackWeight + defenseWeight + (formationBonus * 0.15) + staminaWeight + randomFactor;
}

export interface MatchResult {
    winnerId: number | null; // null if draw
    teamAScore: number;
    teamBScore: number;
    isDraw: boolean;
    scoreline: string;
}

export function simulateMatch(
    teamAId: number,
    teamAStats: TeamStats,
    teamBId: number,
    teamBStats: TeamStats
): MatchResult {
    const strengthA = calculateTeamStrength(teamAStats);
    const strengthB = calculateTeamStrength(teamBStats);

    const totalStrength = strengthA + strengthB;

    if (totalStrength === 0) {
        // Both teams are pure empty, unlikely but fallback to 0-0
        return { winnerId: null, teamAScore: 0, teamBScore: 0, isDraw: true, scoreline: "0-0" };
    }

    const winProbA = strengthA / totalStrength;
    const matchRandom = Math.random();

    let teamAScore = 0;
    let teamBScore = 0;

    // Simple Poisson-like distribution for scorelines based on win probability
    if (matchRandom < winProbA - 0.1) {
        // Team A dominant win
        teamAScore = Math.floor(Math.random() * 3) + 2; // 2 to 4 goals
        teamBScore = Math.floor(Math.random() * 2);     // 0 to 1 goal
    } else if (matchRandom < winProbA + 0.1) {
        // Draw
        const goals = Math.floor(Math.random() * 3); // 0 to 2 goals each
        teamAScore = goals;
        teamBScore = goals;
    } else {
        // Team B win
        teamBScore = Math.floor(Math.random() * 3) + 2;
        teamAScore = Math.floor(Math.random() * 2);
    }

    const isDraw = teamAScore === teamBScore;
    const winnerId = isDraw ? null : (teamAScore > teamBScore ? teamAId : teamBId);

    return {
        winnerId,
        teamAScore,
        teamBScore,
        isDraw,
        scoreline: `${teamAScore}-${teamBScore}`
    };
}
