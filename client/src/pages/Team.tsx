import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, TrendingUp, X, Shield, Zap, Activity, Sword } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../lib/auth";
import { useToast } from "@/hooks/use-toast";
import NFTCard from "@/components/game/NFTCard";
import playerCardBg from "@assets/generated_images/football_player_sticker_nft_card.png";
import type { Player } from "@shared/schema";

export default function Team() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPlayers();
    }
  }, [user]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/user/${user?.id}/players`);
      const data = await res.json();
      setPlayers(data);
    } catch (e) {
      toast({ title: "Error", description: "Could not load players", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (stat: "attack" | "defense" | "speed" | "stamina") => {
    if (!selectedPlayer || !user) return;

    setUpgrading(true);
    try {
      const res = await fetch("/api/store/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, playerId: selectedPlayer.id, stat }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      toast({
        title: "Upgrade Successful!",
        description: `${selectedPlayer.name} leveled up!`,
      });

      // Update local state
      setSelectedPlayer(data.player);
      setPlayers(players.map(p => p.id === data.player.id ? data.player : p));

    } catch (e: any) {
      toast({ title: "Upgrade Failed", description: e.message, variant: "destructive" });
    } finally {
      setUpgrading(false);
    }
  };

  const getUpgradeCost = (level: number) => {
    if (level % 10 === 0) {
      return `${Math.floor(level / 10) * 5} TOF`;
    }
    return `${100 + (level * 50)} Coins`;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      <header className="sticky top-0 z-20 p-4 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <h1 className="font-display font-bold text-xl flex items-center gap-2">
          <Users className="text-primary" size={20} /> My Club Inventory
        </h1>
      </header>

      <main className="p-4 relative">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 rounded-full border-t-2 border-primary animate-spin" />
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">No Players Yet</h3>
            <p className="text-sm mb-4">Visit the Store to open your first pack!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {players.map((player) => (
              <motion.div
                key={player.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedPlayer(player)}
                className="cursor-pointer relative group"
              >
                <NFTCard
                  image={playerCardBg}
                  name={player.name}
                  rarity={player.rarity as any}
                  stats={{
                    pace: player.speed,
                    shoot: player.attack,
                    def: player.defense
                  }}
                />
                <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-bold border border-white/20">
                  Lvl {player.level}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {selectedPlayer && (
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              className="fixed inset-x-0 bottom-0 z-50 bg-background border-t border-white/10 rounded-t-3xl shadow-2xl p-6 pb-12 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="font-display font-bold text-2xl">{selectedPlayer.name}</h2>
                  <div className="flex gap-2 text-xs font-bold mt-1">
                    <span className="text-muted-foreground uppercase">{selectedPlayer.position}</span>
                    <span className="text-primary">•</span>
                    <span className="text-primary">OVR {selectedPlayer.overallRating}</span>
                    <span className="text-primary">•</span>
                    <span className="text-muted-foreground">LVL {selectedPlayer.level}/{selectedPlayer.maxLevel}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedPlayer(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                  <X size={20} />
                </button>
              </div>

              <div className="flex justify-center mb-6">
                <div className="w-48">
                  <NFTCard
                    image={playerCardBg}
                    name={selectedPlayer.name}
                    rarity={selectedPlayer.rarity as any}
                    stats={{ pace: selectedPlayer.speed, shoot: selectedPlayer.attack, def: selectedPlayer.defense }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" /> Upgrades
                </h3>

                {selectedPlayer.level >= selectedPlayer.maxLevel ? (
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center text-primary font-bold">
                    MAX LEVEL REACHED
                  </div>
                ) : (
                  <>
                    <div className="text-xs text-muted-foreground mb-2 text-center">
                      Next Upgrade Cost: <strong className="text-white">{getUpgradeCost(selectedPlayer.level)}</strong>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        className="flex flex-col h-auto py-3 gap-1 bg-white/5 hover:bg-primary/20 hover:border-primary/50 transition-colors border border-white/5"
                        onClick={() => handleUpgrade("attack")}
                        disabled={upgrading}
                      >
                        <span className="flex items-center gap-1 text-xs text-muted-foreground uppercase"><Sword size={12} /> Attack</span>
                        <span className="font-bold text-lg">{selectedPlayer.attack} &rarr; {selectedPlayer.attack + 2}</span>
                      </Button>

                      <Button
                        variant="secondary"
                        className="flex flex-col h-auto py-3 gap-1 bg-white/5 hover:bg-primary/20 hover:border-primary/50 transition-colors border border-white/5"
                        onClick={() => handleUpgrade("defense")}
                        disabled={upgrading}
                      >
                        <span className="flex items-center gap-1 text-xs text-muted-foreground uppercase"><Shield size={12} /> Defense</span>
                        <span className="font-bold text-lg">{selectedPlayer.defense} &rarr; {selectedPlayer.defense + 2}</span>
                      </Button>

                      <Button
                        variant="secondary"
                        className="flex flex-col h-auto py-3 gap-1 bg-white/5 hover:bg-primary/20 hover:border-primary/50 transition-colors border border-white/5"
                        onClick={() => handleUpgrade("speed")}
                        disabled={upgrading}
                      >
                        <span className="flex items-center gap-1 text-xs text-muted-foreground uppercase"><Zap size={12} /> Speed</span>
                        <span className="font-bold text-lg">{selectedPlayer.speed} &rarr; {selectedPlayer.speed + 2}</span>
                      </Button>

                      <Button
                        variant="secondary"
                        className="flex flex-col h-auto py-3 gap-1 bg-white/5 hover:bg-primary/20 hover:border-primary/50 transition-colors border border-white/5"
                        onClick={() => handleUpgrade("stamina")}
                        disabled={upgrading}
                      >
                        <span className="flex items-center gap-1 text-xs text-muted-foreground uppercase"><Activity size={12} /> Stamina</span>
                        <span className="font-bold text-lg">{selectedPlayer.stamina} &rarr; {selectedPlayer.stamina + 2}</span>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
