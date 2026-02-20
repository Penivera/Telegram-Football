import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Timer, Zap, Trophy, Coins } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "../lib/auth";
import { useToast } from "@/hooks/use-toast";
import bgPattern from "@assets/generated_images/abstract_football_field_background.png";
import playerCard from "@assets/generated_images/football_player_sticker_nft_card.png";

type MatchResult = {
  scoreline: string;
  teamAScore: number;
  teamBScore: number;
  winnerId: number | null;
  isDraw: boolean;
};

export default function Game() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [searching, setSearching] = useState(false);
  const [matchData, setMatchData] = useState<{
    result: MatchResult;
    eloChange: number;
    rewards: { coins: number };
  } | null>(null);

  const startMatch = async () => {
    if (!user) return;

    setSearching(true);
    setMatchData(null);

    try {
      // Simulate finding opponent time
      await new Promise(resolve => setTimeout(resolve, 2000));

      const res = await fetch("/api/match/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setMatchData({
        result: data.matchResult,
        eloChange: data.eloChange,
        rewards: data.rewards
      });

    } catch (e: any) {
      toast({ title: "Matchmaking Error", description: e.message, variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      <div
        className="fixed inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url(${bgPattern})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <header className="relative z-10 p-4 flex items-center justify-between border-b border-white/5 bg-background/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-display font-bold text-lg">Match Lobby</h1>
        </div>

        <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1 pb-1.5 rounded-full border border-white/10">
          <Trophy size={14} className="text-yellow-400" />
          <span className="text-sm font-bold font-mono">{user?.eloRating || 1000} ELO</span>
        </div>
      </header>

      <main className="relative z-10 p-4 space-y-6">

        <AnimatePresence>
          {matchData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-background/95 backdrop-blur-md overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 pattern-dots pointer-events-none" />

              <h2 className="font-display text-4xl font-black italic uppercase tracking-widest mb-2 z-10 drop-shadow-lg">
                {matchData.result.isDraw ? "DRAW" : matchData.result.winnerId === user?.id ? "VICTORY" : "DEFEAT"}
              </h2>

              <div className="font-mono text-6xl font-black tracking-tighter mb-8 z-10 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                {matchData.result.scoreline}
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8 z-10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                  <Trophy className={matchData.eloChange >= 0 ? "text-green-400" : "text-red-400"} />
                  <div className="text-xl font-bold font-mono">
                    {matchData.eloChange >= 0 ? "+" : ""}{matchData.eloChange}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold">RATING</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                  <Coins className="text-yellow-400" />
                  <div className="text-xl font-bold font-mono">+{matchData.rewards.coins}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold">COINS</div>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full max-w-xs z-10 font-bold tracking-wide"
                onClick={() => setMatchData(null)}
              >
                Continue
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Matchmaking Status */}
        <div className="text-center py-8">
          <div className="relative inline-block">
            <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center mx-auto mb-4 relative z-10 bg-background transition-colors ${searching ? 'border-primary/50' : 'border-primary/20'}`}>
              <Zap className={`h-10 w-10 text-primary ${searching ? 'animate-bounce' : 'animate-pulse'}`} />
            </div>
            {searching && <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />}
          </div>
          <h2 className="font-display font-bold text-2xl mb-1">
            {searching ? "Finding Opponent..." : "Ready to Play"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {searching ? "Estimated wait: 2s" : "Select a mode below"}
          </p>
        </div>

        {/* Game Modes */}
        <div className="space-y-3 pt-6">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest pl-1">Select Mode</h3>

          <div
            onClick={() => !searching && startMatch()}
            className={`glass p-4 rounded-xl border flex items-center gap-4 relative overflow-hidden transition-all ${searching ? "opacity-50 cursor-not-allowed border-white/5" : "border-primary/50 cursor-pointer hover:bg-primary/5"
              }`}
          >
            <div className="absolute inset-0 bg-primary/5 z-0" />
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary z-10">
              <Play fill="currentColor" />
            </div>
            <div className="flex-1 z-10">
              <h4 className="font-display font-bold text-lg">Ranked Match</h4>
              <p className="text-xs text-muted-foreground">Earn Trophy Points & Coins</p>
            </div>
          </div>

          <div className="glass p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-colors flex items-center gap-4 cursor-pointer opacity-70">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-white z-10">
              <Timer />
            </div>
            <div className="flex-1 z-10">
              <h4 className="font-display font-bold text-lg">Friendly Match</h4>
              <p className="text-xs text-muted-foreground">Available soon (No rewards)</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
