import { motion } from "framer-motion";
import { ArrowLeft, ShoppingCart, Filter, Search } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NFTCard from "@/components/game/NFTCard";
import playerCard from "@assets/generated_images/football_player_sticker_nft_card.png";

export default function Market() {
  const listings = [
    { id: 1, name: "Golden Boot", rarity: "Legendary" as const, price: "2,500 TOF", stats: { pace: 99, shoot: 98, def: 50 } },
    { id: 2, name: "Iron Wall", rarity: "Epic" as const, price: "1,200 TOF", stats: { pace: 65, shoot: 40, def: 92 } },
    { id: 3, name: "Speedster", rarity: "Rare" as const, price: "500 TOF", stats: { pace: 94, shoot: 76, def: 60 } },
    { id: 4, name: "Rookie", rarity: "Common" as const, price: "100 TOF", stats: { pace: 70, shoot: 65, def: 60 } },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      <header className="sticky top-0 z-20 p-4 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-xl">Marketplace</h1>
          </div>
          <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full border border-white/10">
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="text-sm font-bold font-mono">2,500 TOF</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search cards..." className="pl-9 bg-secondary/50 border-white/10 focus-visible:ring-primary" />
          </div>
          <Button variant="outline" size="icon" className="border-white/10 bg-secondary/50">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="p-4 grid grid-cols-2 gap-4">
        {listings.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="group"
          >
            <div className="relative mb-2">
              <NFTCard 
                image={playerCard}
                name={item.name}
                rarity={item.rarity}
                stats={item.stats}
              />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[90%]">
                <Button className="w-full bg-background/90 backdrop-blur border border-white/10 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-lg text-xs font-bold h-8">
                  Buy {item.price}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </main>
    </div>
  );
}
