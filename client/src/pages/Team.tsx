import { motion } from "framer-motion";
import { Users, Settings, Plus, RefreshCw } from "lucide-react";
import NFTCard from "@/components/game/NFTCard";
import playerCard from "@assets/generated_images/football_player_sticker_nft_card.png";
import bgPattern from "@assets/generated_images/abstract_football_field_background.png";

export default function Team() {
  const formation = ["LW", "ST", "RW", "CM", "CDM", "LB", "CB", "RB", "GK"];
  const myTeam = [
    { pos: "ST", name: "Striker Prime", rarity: "Legendary", stats: { pace: 95, shoot: 92, def: 45 } },
    { pos: "CM", name: "Playmaker", rarity: "Epic", stats: { pace: 82, shoot: 88, def: 60 } },
    { pos: "CB", name: "The Wall", rarity: "Rare", stats: { pace: 65, shoot: 40, def: 88 } },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      {/* Pitch Background */}
       <div 
        className="fixed inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url(${bgPattern})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <header className="relative z-10 p-4 flex justify-between items-center bg-background/50 backdrop-blur-md sticky top-0 border-b border-white/5">
        <h1 className="font-display font-bold text-xl">My Squad</h1>
        <div className="flex gap-2">
           <button className="p-2 rounded-full bg-secondary/50 border border-white/10 hover:bg-white/10">
             <RefreshCw size={18} />
           </button>
           <button className="p-2 rounded-full bg-secondary/50 border border-white/10 hover:bg-white/10">
             <Settings size={18} />
           </button>
        </div>
      </header>

      <main className="relative z-10 p-4">
        {/* Formation Graphic */}
        <div className="aspect-[4/5] bg-green-900/20 border-2 border-green-500/20 rounded-2xl relative mb-6 backdrop-blur-sm overflow-hidden p-4">
          <div className="absolute inset-x-0 top-1/2 h-[2px] bg-white/10" />
          <div className="absolute inset-x-0 top-1/2 w-24 h-24 rounded-full border-2 border-white/10 -translate-y-1/2 left-1/2 -translate-x-1/2" />
          
          <div className="grid grid-cols-3 gap-2 h-full content-between relative z-10">
            {formation.map((pos, i) => {
              const player = myTeam.find((p) => p.pos === pos);
              return (
                <div key={pos} className="flex flex-col items-center gap-1">
                  {player ? (
                    <div className="w-full relative group cursor-pointer">
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 bg-black/80 px-2 rounded text-[10px] font-bold border border-white/20">{pos}</div>
                      <NFTCard 
                        image={playerCard}
                        name={player.name}
                        rarity={player.rarity as any}
                        stats={player.stats}
                        className="w-full shadow-lg scale-90 group-hover:scale-100 group-hover:z-30 transition-all origin-bottom"
                      />
                    </div>
                  ) : (
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="w-20 h-24 border-2 border-dashed border-white/10 rounded-xl bg-white/5 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-white/10 hover:border-primary/50 transition-colors"
                    >
                      <Plus className="opacity-50" />
                      <span className="text-[10px] font-bold opacity-50">{pos}</span>
                    </motion.div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="glass p-4 rounded-xl border border-white/5">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">Squad Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-display font-bold text-white">85</div>
              <div className="text-[10px] text-muted-foreground uppercase">Attack</div>
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-white">78</div>
              <div className="text-[10px] text-muted-foreground uppercase">Midfield</div>
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-white">62</div>
              <div className="text-[10px] text-muted-foreground uppercase">Defense</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
