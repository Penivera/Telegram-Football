import { type Player, type Squad } from "../../shared/schema";

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

export interface MatchEvent {
    id: number;
    minute: number;
    type: 'kickoff' | 'pass' | 'tackle' | 'shoot' | 'goal' | 'save' | 'foul' | 'halftime' | 'fulltime';
    teamId: number | null; // null for neutral events like halftime
    x: number; // 0-100 (0 is Team A side, 100 is Team B side)
    y: number; // 0-100 (0 is top, 100 is bottom)
    description: string;
}

export interface MatchResult {
    winnerId: number | null;
    teamAScore: number;
    teamBScore: number;
    isDraw: boolean;
    scoreline: string;
    events: MatchEvent[];
}

// Generate a series of visual events that match the final scoreline
function generateMatchEvents(
    teamAId: number,
    teamBId: number,
    scoreA: number,
    scoreB: number,
    strengthA: number,
    strengthB: number
): MatchEvent[] {
    const events: MatchEvent[] = [];
    let eventId = 1;

    events.push({
        id: eventId++,
        minute: 0,
        type: 'kickoff',
        teamId: null,
        x: 50,
        y: 50,
        description: "The referee blows the whistle to start the match!"
    });

    // We distribute goals randomly across 90 minutes
    const goalMinutes: { minute: number, teamId: number }[] = [];
    for (let i = 0; i < scoreA; i++) {
        goalMinutes.push({ minute: Math.floor(Math.random() * 85) + 3, teamId: teamAId });
    }
    for (let i = 0; i < scoreB; i++) {
        goalMinutes.push({ minute: Math.floor(Math.random() * 85) + 3, teamId: teamBId });
    }
    goalMinutes.sort((a, b) => a.minute - b.minute);

    // Generate random filler events every few minutes
    // PHASE 3 UPGRADE: Higher density events for smooth Canvas tracking (tick every ~1 min)
    let currentMinute = 1;
    let nextGoalIndex = 0;
    let possessionId = teamAId; // Start with Team A
    let ballX = 50;
    let ballY = 50;

    while (currentMinute <= 90) {
        // Is it time for a goal?
        if (nextGoalIndex < goalMinutes.length && currentMinute >= goalMinutes[nextGoalIndex].minute) {
            const goalReq = goalMinutes[nextGoalIndex];
            const isTeamA = goalReq.teamId === teamAId;
            const goalX = isTeamA ? 95 : 5; // Team A attacks right (100), Team B attacks left (0)

            // Build up to the goal more gracefully
            ballX = isTeamA ? 70 : 30;
            ballY = Math.floor(Math.random() * 40) + 30;
            events.push({
                id: eventId++,
                minute: goalReq.minute - 0.5,
                type: 'pass',
                teamId: goalReq.teamId,
                x: ballX,
                y: ballY,
                description: `Building up the attack...`
            });

            events.push({
                id: eventId++,
                minute: goalReq.minute - 0.2,
                type: 'shoot',
                teamId: goalReq.teamId,
                x: goalX > 50 ? 85 : 15,
                y: ballY,
                description: `A powerful strike from outside the box!`
            });

            events.push({
                id: eventId++,
                minute: goalReq.minute,
                type: 'goal',
                teamId: goalReq.teamId,
                x: goalX,
                y: 50,
                description: `GOAL! What a fantastic finish for the team!`
            });

            // Restart from center
            ballX = 50;
            ballY = 50;
            possessionId = isTeamA ? teamBId : teamAId;
            nextGoalIndex++;
        } else {
            // Normal continuous play logic
            const rand = Math.random();
            const isTeamA = possessionId === teamAId;

            // Move ball progressively closer to danger zone based on team strength
            let direction = isTeamA ? 1 : -1;
            // Stronger teams push further
            let progress = (Math.floor(Math.random() * 15) + 5) * (isTeamA ? (strengthA / strengthB) : (strengthB / strengthA));
            ballX += direction * Math.min(progress, 25);

            // Keep ball on pitch
            ballX = Math.max(5, Math.min(95, ballX));
            ballY = Math.max(5, Math.min(95, ballY + ((Math.random() - 0.5) * 40)));

            if (rand < 0.6) {
                // Dominant possession event
                events.push({
                    id: eventId++,
                    minute: currentMinute,
                    type: 'pass',
                    teamId: possessionId,
                    x: ballX,
                    y: ballY,
                    description: `Good passing sequence.`
                });
            } else if (rand < 0.85) {
                // Turnover
                possessionId = isTeamA ? teamBId : teamAId;
                ballX += (isTeamA ? -5 : 5); // Slight push back on tackle
                events.push({
                    id: eventId++,
                    minute: currentMinute,
                    type: 'tackle',
                    teamId: possessionId,
                    x: ballX,
                    y: ballY,
                    description: `Great interception to win the ball back.`
                });
            } else {
                // Missed shot or save (only if deep in enemy territory)
                const attackDirection = isTeamA ? 100 : 0;
                if (Math.abs(ballX - attackDirection) < 25) {
                    events.push({
                        id: eventId++,
                        minute: currentMinute,
                        type: 'shoot',
                        teamId: possessionId,
                        x: attackDirection > 50 ? 90 : 10,
                        y: ballY,
                        description: `Takes a shot!`
                    });

                    events.push({
                        id: eventId++,
                        minute: currentMinute + 0.5,
                        type: 'save',
                        teamId: possessionId === teamAId ? teamBId : teamAId,
                        x: attackDirection > 50 ? 98 : 2,
                        y: 50,
                        description: `The keeper makes a solid save.`
                    });

                    // Ball goes other way
                    possessionId = isTeamA ? teamBId : teamAId;
                    ballX = attackDirection > 50 ? 70 : 30; // Clear it out
                } else {
                    events.push({
                        id: eventId++,
                        minute: currentMinute,
                        type: 'foul',
                        teamId: possessionId === teamAId ? teamBId : teamAId,
                        x: ballX,
                        y: ballY,
                        description: `Foul called by the referee.`
                    });
                }
            }
        }

        if (Math.floor(currentMinute) === 45 && !events.some(e => e.type === 'halftime')) {
            events.push({
                id: eventId++,
                minute: 45,
                type: 'halftime',
                teamId: null,
                x: 50,
                y: 50,
                description: `Halftime whistle blows.`
            });
        }

        // High density ticks: events every ~1 minute instead of 3-10 minutes.
        // Generates ~90-120 continuous events per match for smooth Canvas bridging.
        currentMinute += (Math.random() * 1.5) + 0.5;
    }

    events.push({
        id: eventId++,
        minute: 90,
        type: 'fulltime',
        teamId: null,
        x: 50,
        y: 50,
        description: `Full time! The match has concluded.`
    });

    return events;
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

    let teamAScore = 0;
    let teamBScore = 0;

    if (totalStrength === 0) {
        // Both teams are pure empty, unlikely but fallback to 0-0
    } else {
        const winProbA = strengthA / totalStrength;
        const matchRandom = Math.random();

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
    }

    const isDraw = teamAScore === teamBScore;
    const winnerId = isDraw ? null : (teamAScore > teamBScore ? teamAId : teamBId);

    const events = generateMatchEvents(teamAId, teamBId, teamAScore, teamBScore, strengthA, strengthB);

    return {
        winnerId,
        teamAScore,
        teamBScore,
        isDraw,
        scoreline: `${teamAScore}-${teamBScore}`,
        events
    };
}
