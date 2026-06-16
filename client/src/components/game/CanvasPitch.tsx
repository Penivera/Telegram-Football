import { useEffect, useRef, useState } from "react";
import { MatchEvent } from "./Pitch2D";

interface CanvasPitchProps {
    events: MatchEvent[];
    onComplete: () => void;
    teamAId: number;
    teamBId: number;
}

interface PlayerNode {
    id: string;
    teamId: number;
    x: number;
    y: number;
    isGoalkeeper?: boolean;
}

interface Keyframe {
    realTimeMs: number;
    event: MatchEvent;
    ballX: number;
    ballY: number;
    ballZ: number; // Height for shadows
    players: PlayerNode[];
}

const PITCH_WIDTH = 800;
const PITCH_HEIGHT = 500;
const PITCH_MARGIN = 40; // Outside the touchlines
const REAL_MS_PER_MINUTE = 500; // 1 in-game minute = 0.5s real time (45s total match)

export default function CanvasPitch({ events, onComplete, teamAId, teamBId }: CanvasPitchProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentMinute, setCurrentMinute] = useState(0);
    const [commentary, setCommentary] = useState("");

    // Build the interpolation keyframes once
    const keyframesRef = useRef<Keyframe[]>([]);

    useEffect(() => {
        if (!events || events.length === 0) return;

        // Build base formation helper
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

        let prevPlayers: PlayerNode[] = [];
        const frames: Keyframe[] = [];

        events.forEach((ev, idx) => {
            const ballX = ev.x;
            const ballY = ev.y;
            let ballZ = 0;

            // If ball was passed/shot from previous event, give it an arc height in the middle
            const isKick = ['pass', 'shoot'].includes(ev.type);

            const players: PlayerNode[] = [];
            baseFormation.forEach((base, i) => {
                // Team A (attacks right)
                let taX = base.x + (ballX - 50) * 0.4;
                let taY = base.y + (ballY - 50) * 0.2;
                if (base.isGoalkeeper) {
                    taX = 5;
                    taY = 50 + (ballY - 50) * 0.15;
                }

                // Team B (attacks left)
                let tbX = (100 - base.x) + (ballX - 50) * 0.4;
                let tbY = base.y + (ballY - 50) * 0.2;
                if (base.isGoalkeeper) {
                    tbX = 95;
                    tbY = 50 + (ballY - 50) * 0.15;
                }

                players.push({ id: `A-${i}`, teamId: teamAId, x: taX, y: taY, isGoalkeeper: base.isGoalkeeper });
                players.push({ id: `B-${i}`, teamId: teamBId, x: tbX, y: tbY, isGoalkeeper: base.isGoalkeeper });
            });

            // Make closest players attack the ball
            const teamAField = players.filter(p => p.teamId === teamAId && !p.isGoalkeeper);
            const teamBField = players.filter(p => p.teamId === teamBId && !p.isGoalkeeper);

            const closestA = teamAField.reduce((c, p) => Math.hypot(p.x - ballX, p.y - ballY) < Math.hypot(c.x - ballX, c.y - ballY) ? p : c);
            const closestB = teamBField.reduce((c, p) => Math.hypot(p.x - ballX, p.y - ballY) < Math.hypot(c.x - ballX, c.y - ballY) ? p : c);

            if (['pass', 'tackle', 'shoot', 'goal', 'save'].includes(ev.type)) {
                if (ev.teamId === teamAId) {
                    closestA.x = ballX; closestA.y = ballY;
                    closestB.x = ballX + 3; closestB.y = ballY;
                } else if (ev.teamId === teamBId) {
                    closestB.x = ballX; closestB.y = ballY;
                    closestA.x = ballX - 3; closestA.y = ballY;
                }
            } else if (ev.type === 'kickoff' || ev.type === 'halftime') {
                closestA.x = 48; closestA.y = 50;
                closestB.x = 52; closestB.y = 50;
            }

            // Map percentages to canvas pixels
            players.forEach(p => {
                // Add tiny organic noise
                if (!p.isGoalkeeper && p.id !== closestA.id && p.id !== closestB.id) {
                    p.x += (Math.random() * 4 - 2);
                    p.y += (Math.random() * 4 - 2);
                }
                // Clamp
                p.x = Math.max(2, Math.min(98, p.x));
                p.y = Math.max(2, Math.min(98, p.y));

                // Convert to real pixels
                p.x = (p.x / 100) * PITCH_WIDTH;
                p.y = (p.y / 100) * PITCH_HEIGHT;
            });

            const currentBallXPx = (ballX / 100) * PITCH_WIDTH;
            const currentBallYPx = (ballY / 100) * PITCH_HEIGHT;

            // Interpolate Z (height limit for long passes)
            if (isKick && idx > 0) {
                // We will handle the arc during the render loop by looking at the previous frame
            }

            frames.push({
                realTimeMs: ev.minute * REAL_MS_PER_MINUTE,
                event: ev,
                ballX: currentBallXPx,
                ballY: currentBallYPx,
                ballZ: 0,
                players
            });

            prevPlayers = players;
        });

        // Add pause at the end
        if (frames.length > 0) {
            frames[frames.length - 1].realTimeMs += 3000;
        }

        keyframesRef.current = frames;
    }, [events, teamAId, teamBId]);

    // Render Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || keyframesRef.current.length === 0) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let startTime: number | null = null;
        let currentEventIdx = 0;

        let cameraX = PITCH_WIDTH / 2;
        let cameraY = PITCH_HEIGHT / 2;

        const render = (time: number) => {
            if (!startTime) startTime = time;
            const elapsedMs = time - startTime;
            const frames = keyframesRef.current;

            // Find current frames
            let f0 = frames[Math.max(0, currentEventIdx)];
            let f1 = frames[Math.min(currentEventIdx + 1, frames.length - 1)];

            // Advance frame if time passed f1
            while (elapsedMs > f1.realTimeMs && currentEventIdx < frames.length - 1) {
                currentEventIdx++;
                f0 = frames[currentEventIdx];
                f1 = frames[Math.min(currentEventIdx + 1, frames.length - 1)];
                setCurrentMinute(Math.floor(f0.event.minute));
                setCommentary(f0.event.description);
            }

            // Check completion
            if (currentEventIdx >= frames.length - 1 && elapsedMs > frames[frames.length - 1].realTimeMs) {
                onComplete();
                return;
            }

            // Interpolation factor t (0 to 1)
            let t = 1;
            if (f1.realTimeMs > f0.realTimeMs) {
                t = (elapsedMs - f0.realTimeMs) / (f1.realTimeMs - f0.realTimeMs);
                t = Math.max(0, Math.min(1, t)); // clamp
            }

            // Smoothstep for non-linear movement
            const smoothT = t * t * (3 - 2 * t);

            // Interpolate Ball
            const bx = f0.ballX + (f1.ballX - f0.ballX) * smoothT;
            const by = f0.ballY + (f1.ballY - f0.ballY) * smoothT;

            // Add Z arc if it's a pass/shoot
            let bz = 0;
            if (['pass', 'shoot', 'goal', 'save'].includes(f1.event.type) && t < 1) {
                // Parabola equation: 4 * h * t * (1 - t)
                const distance = Math.hypot(f1.ballX - f0.ballX, f1.ballY - f0.ballY);
                const height = Math.min(distance * 0.2, 40); // Max height capping
                bz = 4 * height * t * (1 - t);
            }

            // Camera follow logic (spring arm)
            const cw = canvas.width;
            const ch = canvas.height;
            const targetCamX = bx;
            const targetCamY = by;

            cameraX += (targetCamX - cameraX) * 0.05;
            cameraY += (targetCamY - cameraY) * 0.05;

            // Clamp camera so we don't see past the pitch margins
            const maxCamX = PITCH_WIDTH + PITCH_MARGIN - cw / 2;
            const minCamX = -PITCH_MARGIN + cw / 2;
            const maxCamY = PITCH_HEIGHT + PITCH_MARGIN - ch / 2;
            const minCamY = -PITCH_MARGIN + ch / 2;

            const clampedCamX = Math.max(minCamX, Math.min(maxCamX, cameraX));
            const clampedCamY = Math.max(minCamY, Math.min(maxCamY, cameraY));

            // CLEAR
            ctx.fillStyle = '#064e3b'; // off-pitch green bg
            ctx.fillRect(0, 0, cw, ch);

            ctx.save();
            ctx.translate(cw / 2 - clampedCamX, ch / 2 - clampedCamY);

            // DRAW PITCH GRASS BLOCKS (Stripes)
            const stripeWidth = PITCH_WIDTH / 10;
            for (let i = 0; i < 10; i++) {
                ctx.fillStyle = i % 2 === 0 ? '#166534' : '#14532d'; // Alternate greens
                ctx.fillRect(i * stripeWidth, 0, stripeWidth, PITCH_HEIGHT);
            }

            // DRAW PITCH LINES
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 3;

            // Touchlines
            ctx.strokeRect(0, 0, PITCH_WIDTH, PITCH_HEIGHT);
            // Halfway line
            ctx.beginPath();
            ctx.moveTo(PITCH_WIDTH / 2, 0);
            ctx.lineTo(PITCH_WIDTH / 2, PITCH_HEIGHT);
            ctx.stroke();
            // Center circle
            ctx.beginPath();
            ctx.arc(PITCH_WIDTH / 2, PITCH_HEIGHT / 2, 60, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(PITCH_WIDTH / 2, PITCH_HEIGHT / 2, 4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.fill();

            // Penalty boxes
            const boxY = PITCH_HEIGHT / 2 - 100;
            ctx.strokeRect(0, boxY, 120, 200); // Left
            ctx.strokeRect(PITCH_WIDTH - 120, boxY, 120, 200); // Right

            // 6-yard boxes
            const sixY = PITCH_HEIGHT / 2 - 45;
            ctx.strokeRect(0, sixY, 40, 90);
            ctx.strokeRect(PITCH_WIDTH - 40, sixY, 40, 90);

            // Goals
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#cbd5e1';
            ctx.strokeRect(-20, PITCH_HEIGHT / 2 - 30, 20, 60);
            ctx.strokeRect(PITCH_WIDTH, PITCH_HEIGHT / 2 - 30, 20, 60);

            // Draw Players
            const radius = 8;
            f0.players.forEach((p0, idx) => {
                const p1 = f1.players[idx];
                const px = p0.x + (p1.x - p0.x) * smoothT;
                const py = p0.y + (p1.y - p0.y) * smoothT;
                const isA = p0.teamId === teamAId;

                // Player Shadow
                ctx.beginPath();
                ctx.arc(px, py + 4, radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fill();

                // Player Circle
                ctx.beginPath();
                ctx.arc(px, py, radius, 0, Math.PI * 2);
                ctx.fillStyle = isA ? '#3b82f6' : '#ef4444';
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();

                // Facing indicator (direction of movement)
                const dx = p1.x - p0.x;
                const dy = p1.y - p0.y;
                if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
                    const angle = Math.atan2(dy, dx);
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(px + Math.cos(angle) * 12, py + Math.sin(angle) * 12);
                    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                    ctx.stroke();
                }
            });

            // Draw Ball Shadow
            ctx.beginPath();
            ctx.arc(bx + (bz * 0.2), by + (bz * 0.5), 5 + (bz * 0.1), 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fill();

            // Draw Ball
            const ballScale = 1 + (bz * 0.03); // ball gets slightly larger when in air
            ctx.beginPath();
            ctx.arc(bx, by - bz, 5 * ballScale, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            // Ball pattern
            ctx.beginPath();
            ctx.arc(bx, by - bz, 2 * ballScale, 0, Math.PI * 2);
            ctx.fillStyle = '#000000';
            ctx.fill();

            ctx.restore();

            // Next frame
            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [onComplete, teamAId]); // empty deps? well we depend on refs.

    return (
        <div className="w-full flex flex-col items-center gap-4" ref={containerRef}>
            {/* Overlay UI */}
            <div className="flex bg-black/40 backdrop-blur border border-white/10 rounded-xl overflow-hidden shadow-lg w-full max-w-lg z-10">
                <div className="flex-1 p-3 text-center bg-blue-600/30 font-bold">
                    <div className="text-xs text-blue-300 uppercase">You ({teamAId})</div>
                </div>
                <div className="bg-black/60 px-6 py-2 flex flex-col items-center justify-center">
                    <span className="font-mono text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                        {currentMinute}'
                    </span>
                </div>
                <div className="flex-1 p-3 text-center bg-red-600/30 font-bold">
                    <div className="text-xs text-red-300 uppercase">Opponent</div>
                </div>
            </div>

            {/* Canvas Container */}
            <div className="relative w-full max-w-lg aspect-video rounded-lg overflow-hidden border-2 border-green-800/50 shadow-2xl bg-[#064e3b]">
                <canvas
                    ref={canvasRef}
                    width={800} // Logical width, scales down via CSS
                    height={450} // 16:9 ratio
                    className="w-full h-full object-cover"
                />

                {commentary && (
                    <div className="absolute bottom-4 left-4 right-4 text-center z-10">
                        <span className="inline-block bg-black/60 backdrop-blur text-white px-4 py-2 rounded-lg text-sm font-medium border border-white/10 shadow-lg">
                            {commentary}
                        </span>
                    </div>
                )}
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
