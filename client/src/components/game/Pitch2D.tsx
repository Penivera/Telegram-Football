import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type MatchEvent = {
    id: number;
    minute: number;
    type: 'kickoff' | 'pass' | 'tackle' | 'shoot' | 'goal' | 'save' | 'foul' | 'halftime' | 'fulltime';
    teamId: number | null;
    x: number;
    y: number;
    description: string;
};

interface Pitch2DProps {
    events: MatchEvent[];
    onComplete: () => void;
    teamAId: number;
    teamBId: number;
}


interface PlayerPosition {
    id: string;
    teamId: number;
    x: number;
    y: number;
    isGoalkeeper?: boolean;
}

function calculatePlayerPositions(currentEvent: MatchEvent, teamAId: number, teamBId: number): PlayerPosition[] {
    // 4-4-2 normalized formation (0 to 100 range)
    // Ball-side (Team A left-to-right)
    const baseFormation = [
        { x: 5, y: 50, isGoalkeeper: true }, // GK
        { x: 20, y: 20 }, // LB
        { x: 20, y: 40 }, // CB1
        { x: 20, y: 60 }, // CB2
        { x: 20, y: 80 }, // RB
        { x: 45, y: 20 }, // LM
        { x: 40, y: 40 }, // CM1
        { x: 40, y: 60 }, // CM2
        { x: 45, y: 80 }, // RM
        { x: 65, y: 40 }, // LF
        { x: 65, y: 60 }, // RF
    ];

    const ballX = currentEvent.x;
    const ballY = currentEvent.y;
    let positions: PlayerPosition[] = [];

    // Calculate base shifted positions
    baseFormation.forEach((base, i) => {
        // Team A (attacks right)
        // Shift entire formation slightly towards the ball
        let taX = base.x + (ballX - 50) * 0.4;
        let taY = base.y + (ballY - 50) * 0.2;
        if (base.isGoalkeeper) {
            taX = 5; // GK stays near goal
            taY = 50 + (ballY - 50) * 0.1;
        }

        // Team B (attacks left, mirror X)
        let tbX = (100 - base.x) + (ballX - 50) * 0.4;
        let tbY = base.y + (ballY - 50) * 0.2;
        if (base.isGoalkeeper) {
            tbX = 95;
            tbY = 50 + (ballY - 50) * 0.1;
        }

        positions.push({ id: `A-${i}`, teamId: teamAId, x: taX, y: taY, isGoalkeeper: base.isGoalkeeper });
        positions.push({ id: `B-${i}`, teamId: teamBId, x: tbX, y: tbY, isGoalkeeper: base.isGoalkeeper });
    });

    // Determine the closest field player to the ball for both teams
    const teamAFieldPlayers = positions.filter(p => p.teamId === teamAId && !p.isGoalkeeper);
    const teamBFieldPlayers = positions.filter(p => p.teamId === teamBId && !p.isGoalkeeper);

    const closestA = teamAFieldPlayers.reduce((closest, p) =>
        Math.hypot(p.x - ballX, p.y - ballY) < Math.hypot(closest.x - ballX, closest.y - ballY) ? p : closest
    );
    const closestB = teamBFieldPlayers.reduce((closest, p) =>
        Math.hypot(p.x - ballX, p.y - ballY) < Math.hypot(closest.x - ballX, closest.y - ballY) ? p : closest
    );

    // Make players react to the ball carrier
    if (['pass', 'tackle', 'shoot', 'goal', 'save'].includes(currentEvent.type)) {
        if (currentEvent.teamId === teamAId) {
            closestA.x = ballX;
            closestA.y = ballY;
            // Best defender closes down
            closestB.x = ballX + 4;
            closestB.y = ballY;
        } else if (currentEvent.teamId === teamBId) {
            closestB.x = ballX;
            closestB.y = ballY;
            // Best defender closes down
            closestA.x = ballX - 4;
            closestA.y = ballY;
        } else {
            // Unclaimed ball (kickoff, fulltime), everyone stands near their base
            if (currentEvent.type === 'kickoff' || currentEvent.type === 'halftime') {
                closestA.x = 48; closestA.y = 50;
                closestB.x = 52; closestB.y = 50;
            }
        }
    }

    // Add some noise/organic scattering so they don't look perfectly aligned
    positions.forEach(p => {
        if (!p.isGoalkeeper && p.id !== closestA.id && p.id !== closestB.id) {
            p.x += (Math.random() * 4 - 2);
            p.y += (Math.random() * 4 - 2);
        }
        // Keep players on the pitch
        p.x = Math.max(2, Math.min(98, p.x));
        p.y = Math.max(2, Math.min(98, p.y));
    });

    return positions;
}

export default function Pitch2D({ events, onComplete, teamAId, teamBId }: Pitch2DProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    useEffect(() => {
        if (!isPlaying || events.length === 0) return;

        if (currentIndex >= events.length) {
            // Wait a moment then finish
            const timer = setTimeout(() => {
                onComplete();
            }, 2000);
            return () => clearTimeout(timer);
        }

        const currentEvent = events[currentIndex];

        // Dynamic wait time: Goals might take longer to read, passes are quick
        let waitTime = 1500;
        if (currentEvent.type === 'goal') waitTime = 3000;
        else if (currentEvent.type === 'shoot' || currentEvent.type === 'save') waitTime = 2000;

        const timer = setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
        }, waitTime);

        return () => clearTimeout(timer);
    }, [currentIndex, isPlaying, events, onComplete]);

    if (events.length === 0) return null;

    const currentEvent = events[Math.min(currentIndex, events.length - 1)];
    const isTeamA = currentEvent.teamId === teamAId;
    const isTeamB = currentEvent.teamId === teamBId;

    const playerPositions = calculatePlayerPositions(currentEvent, teamAId, teamBId);

    return (
        <div className="w-full flex flex-col items-center gap-4">
            {/* Scoreboard / Time */}
            <div className="flex bg-black/40 backdrop-blur border border-white/10 rounded-xl overflow-hidden shadow-lg w-full max-w-sm">
                <div className={`flex-1 p-3 text-center ${isTeamA ? 'bg-blue-600/30 font-bold' : ''}`}>
                    <div className="text-xs text-blue-300 uppercase">You</div>
                </div>
                <div className="bg-black/60 px-4 py-2 flex flex-col items-center justify-center">
                    <span className="font-mono text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                        {currentEvent.minute}'
                    </span>
                </div>
                <div className={`flex-1 p-3 text-center ${isTeamB ? 'bg-red-600/30 font-bold' : ''}`}>
                    <div className="text-xs text-red-300 uppercase">Opponent</div>
                </div>
            </div>

            {/* Pitch Container */}
            <div className="relative w-full aspect-[4/3] max-w-sm rounded-lg overflow-hidden border-2 border-green-800/50 shadow-2xl bg-gradient-to-br from-green-700 to-green-900">
                {/* Field markings */}
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-white/30 -translate-y-1/2" />
                <div className="absolute left-1/2 top-1/2 w-20 h-20 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2" />

                {/* Goals */}
                <div className="absolute top-0 left-1/2 w-24 h-8 border-2 border-t-0 border-white/30 -translate-x-1/2" />
                <div className="absolute bottom-0 left-1/2 w-24 h-8 border-2 border-b-0 border-white/30 -translate-x-1/2" />

                {/* Simulated Players */}
                {playerPositions.map((player) => {
                    const isA = player.teamId === teamAId;
                    return (
                        <motion.div
                            key={player.id}
                            className={`absolute w-3 h-3 rounded-full border border-white/50 shadow-sm z-10 flex items-center justify-center ${isA ? 'bg-blue-500' : 'bg-red-500'}`}
                            animate={{ left: `${player.x}%`, top: `${player.y}%` }}
                            transition={{ type: "tween", ease: "linear", duration: 1 }}
                            style={{ translateX: "-50%", translateY: "-50%" }}
                        >
                            {/* Inner dot for detail */}
                            <div className="w-1 h-1 bg-white/30 rounded-full" />
                        </motion.div>
                    );
                })}

                {/* The Ball */}
                <motion.div
                    className="absolute w-4 h-4 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] z-20 flex items-center justify-center"
                    animate={{
                        left: `${currentEvent.x}%`,
                        top: `${currentEvent.y}%`,
                        scale: ['shoot', 'goal'].includes(currentEvent.type) ? [1, 1.5, 1] : 1
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    style={{ translateX: "-50%", translateY: "-50%" }}
                >
                    <div className="w-1.5 h-1.5 bg-black/40 rounded-full" />
                </motion.div>

                {/* Event Flash Effects */}
                <AnimatePresence mode="popLayout">
                    {currentEvent.type === 'goal' && (
                        <motion.div
                            key={`goal-${currentEvent.id}`}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none bg-black/40"
                        >
                            <span className="font-display font-black italic text-6xl text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] mix-blend-screen">
                                GOAL!
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Commentary Box */}
            <div className="w-full max-w-sm min-h-[80px] p-4 rounded-xl border border-white/10 glass bg-black/20 flex items-center justify-center text-center relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={currentEvent.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm font-medium leading-relaxed"
                    >
                        {currentEvent.type === 'goal' && (
                            <span className="text-yellow-400 font-bold mr-2 text-lg">⚽</span>
                        )}
                        {currentEvent.description}
                    </motion.p>
                </AnimatePresence>
            </div>

            {/* Skip Button */}
            <button
                onClick={onComplete}
                className="text-xs text-muted-foreground hover:text-white uppercase tracking-wider font-bold"
            >
                Skip Match &gt;&gt;
            </button>
        </div>
    );
}
