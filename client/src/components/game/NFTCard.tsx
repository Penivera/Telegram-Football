import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Zap, Shield, Move } from "lucide-react";

interface NFTCardProps {
  image: string;
  name: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  stats: {
    pace: number;
    shoot: number;
    def: number;
  };
  className?: string;
}

export default function NFTCard({ image, name, rarity, stats, className }: NFTCardProps) {
  const rarityColors = {
    Common: "border-slate-500/50 bg-slate-900/50",
    Rare: "border-blue-500/50 bg-blue-900/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]",
    Epic: "border-purple-500/50 bg-purple-900/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]",
    Legendary: "border-yellow-500/50 bg-yellow-900/20 shadow-[0_0_20px_rgba(234,179,8,0.3)]",
  };

  const rarityText = {
    Common: "text-slate-400",
    Rare: "text-blue-400",
    Epic: "text-purple-400",
    Legendary: "text-yellow-400",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative aspect-[3/4] overflow-hidden rounded-xl border backdrop-blur-sm transition-all duration-300",
        rarityColors[rarity],
        className
      )}
    >
      {/* Card Image */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
      <img 
        src={image} 
        alt={name} 
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-110" 
      />
      
      {/* Content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-3">
        <div className="mb-2">
          <span className={cn("text-[10px] uppercase tracking-wider font-bold border px-1.5 py-0.5 rounded-md backdrop-blur-md bg-background/50", rarityText[rarity], `border-${rarityText[rarity].split('-')[1]}-500/30`)}>
            {rarity}
          </span>
        </div>
        
        <h3 className="font-display font-bold text-lg leading-tight text-white drop-shadow-md mb-3">
          {name}
        </h3>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-background/80 p-1.5 backdrop-blur-md border border-white/10">
          <div className="flex flex-col items-center justify-center">
            <Zap size={12} className="text-yellow-400 mb-0.5" />
            <span className="text-[10px] text-muted-foreground font-bold">PAC</span>
            <span className="text-xs font-bold font-mono">{stats.pace}</span>
          </div>
          <div className="flex flex-col items-center justify-center border-l border-white/10">
            <Move size={12} className="text-green-400 mb-0.5" />
            <span className="text-[10px] text-muted-foreground font-bold">SHO</span>
            <span className="text-xs font-bold font-mono">{stats.shoot}</span>
          </div>
          <div className="flex flex-col items-center justify-center border-l border-white/10">
            <Shield size={12} className="text-blue-400 mb-0.5" />
            <span className="text-[10px] text-muted-foreground font-bold">DEF</span>
            <span className="text-xs font-bold font-mono">{stats.def}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
