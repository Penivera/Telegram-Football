import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../lib/auth";
import { useToast } from "@/hooks/use-toast";
import NFTCard from "@/components/game/NFTCard";
import playerCardBg from "@assets/generated_images/football_player_sticker_nft_card.png";
import type { Player } from "@shared/schema";

type PackType = "Standard" | "Premium" | "Elite";

const packs = [
  {
    type: "Standard" as PackType,
    name: "Standard Pack",
    cost: "500 Coins",
    description: "70% Common / 25% Rare / 5% Epic",
    icon: <Star className="text-blue-400" size={32} />,
    color: "from-blue-500/20 to-blue-600/5",
    border: "border-blue-500/30 hover:border-blue-500/60"
  },
  {
    type: "Premium" as PackType,
    name: "Premium Pack",
    cost: "2,000 Coins",
    description: "50% Rare / 35% Epic / 15% Legendary",
    icon: <Zap className="text-purple-400" size={32} />,
    color: "from-purple-500/20 to-purple-600/5",
    border: "border-purple-500/30 hover:border-purple-500/60"
  },
  {
    type: "Elite" as PackType,
    name: "Elite Pack",
    cost: "50 TOF",
    description: "30% Epic / 70% Legendary",
    icon: <Crown className="text-yellow-400" size={32} />,
    color: "from-yellow-500/20 to-yellow-600/5",
    border: "border-yellow-500/30 hover:border-yellow-500/60"
  }
];

export default function Market() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [opening, setOpening] = useState<PackType | null>(null);
  const [pulledPlayer, setPulledPlayer] = useState<Player | null>(null);

  const handleOpenPack = async (packType: PackType) => {
    if (!user) {
      toast({ title: "Error", description: "Not authenticated", variant: "destructive" });
      return;
    }

    setOpening(packType);
    setPulledPlayer(null);

    try {
      const response = await fetch("/api/store/packs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, packType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to open pack");
      }

      // Small delay for dramatic effect
      setTimeout(() => {
        setPulledPlayer(data.player);
        setOpening(null);
        toast({
          title: "Pack Opened!",
          description: `You got ${data.player.name} (${data.player.rarity})!`,
        });
      }, 1500);

    } catch (err: any) {
      setOpening(null);
      toast({
        title: "Transaction Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      <header className="sticky top-0 z-20 p-4 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-xl flex items-center gap-2">
            <Sparkles className="text-primary" size={20} /> Store
          </h1>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full border border-white/10">
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="text-sm font-bold font-mono">{user?.coins || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full border border-white/10">
              <span className="w-3 h-3 rounded-full bg-blue-400" />
              <span className="text-sm font-bold font-mono">{user?.tofBalance || 0}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 relative">
        <AnimatePresence>
          {pulledPlayer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md p-6"
            >
              <h2 className="font-display text-3xl font-bold uppercase italic text-primary mb-8 glow-text">New Player!</h2>
              <div className="w-full max-w-[280px]">
                <NFTCard
                  image={playerCardBg}
                  name={pulledPlayer.name}
                  rarity={pulledPlayer.rarity as "Common" | "Rare" | "Epic" | "Legendary"}
                  stats={{
                    pace: pulledPlayer.speed,
                    shoot: pulledPlayer.attack,
                    def: pulledPlayer.defense
                  }}
                />
              </div>
              <Button
                className="mt-8 w-full max-w-[280px]"
                size="lg"
                onClick={() => setPulledPlayer(null)}
              >
                Collect
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-4 mt-2">
          {packs.map((pack) => (
            <motion.div
              key={pack.type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden rounded-2xl border ${pack.border} bg-gradient-to-br ${pack.color} p-5 glass-card`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-background/50 backdrop-blur border border-white/10">
                    {pack.icon}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg">{pack.name}</h3>
                    <p className="text-xs text-muted-foreground">{pack.description}</p>
                  </div>
                </div>
              </div>

              <Button
                className="w-full font-bold shadow-lg"
                variant={pack.type === "Elite" ? "default" : "secondary"}
                onClick={() => handleOpenPack(pack.type)}
                disabled={opening !== null}
              >
                {opening === pack.type ? "Opening..." : `Buy for ${pack.cost}`}
              </Button>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
