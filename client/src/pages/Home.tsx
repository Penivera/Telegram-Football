import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Sparkles, Flame, UserPlus, Users } from "lucide-react";
import NFTCard from "@/components/game/NFTCard";
import logo from "@assets/generated_images/tof_football_game_logo.png";
import playerCard from "@assets/generated_images/football_player_sticker_nft_card.png";
import bgPattern from "@assets/generated_images/abstract_football_field_background.png";

export default function Home() {
  const featuredCards = [
    { id: 1, name: "Striker Prime", rarity: "Legendary" as const, stats: { pace: 95, shoot: 92, def: 45 } },
    { id: 2, name: "Midfield Maestro", rarity: "Epic" as const, stats: { pace: 82, shoot: 85, def: 78 } },
  ];

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(${bgPattern})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center bg-gradient-to-b from-background to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center overflow-hidden">
            <img src={logo} alt="TOF Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight">TOF <span className="text-primary">Manager</span></h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">Online • 1,240 Players</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-secondary/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
          <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500" />
          <span className="text-sm font-bold font-mono">2,500</span>
        </div>
      </header>

      <main className="relative z-10 px-4 space-y-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 relative overflow-hidden group"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors" />
          
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-3 border border-primary/20">
              <Flame size={12} /> Season 4 Live
            </span>
            <h2 className="font-display text-3xl font-bold uppercase italic leading-none mb-2">
              Ready for <br/><span className="text-primary text-glow">Kickoff?</span>
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-[70%]">
              Join the daily tournament and win exclusive NFT stickers.
            </p>
            <Link href="/game">
              <button className="w-full bg-primary text-primary-foreground font-display font-bold uppercase tracking-wide py-3 rounded-xl shadow-[0_0_20px_rgba(74,222,128,0.4)] hover:shadow-[0_0_30px_rgba(74,222,128,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                Play Match <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/game">
            <div className="glass p-4 rounded-xl border border-white/5 hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                <Trophy size={20} />
              </div>
              <h3 className="font-display font-bold text-sm">Tournaments</h3>
              <p className="text-xs text-muted-foreground">Win big prizes</p>
            </div>
          </Link>
          <Link href="/market">
            <div className="glass p-4 rounded-xl border border-white/5 hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
                <Sparkles size={20} />
              </div>
              <h3 className="font-display font-bold text-sm">Mystery Pack</h3>
              <p className="text-xs text-muted-foreground">New drops!</p>
            </div>
          </Link>
        </div>

        {/* Your Team Preview */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-bold text-lg flex items-center gap-2">
              <Users size={18} className="text-primary" /> Your Squad
            </h3>
            <Link href="/team">
              <span className="text-xs text-primary hover:underline cursor-pointer">View All</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {featuredCards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <NFTCard 
                  image={playerCard}
                  name={card.name}
                  rarity={card.rarity}
                  stats={card.stats}
                />
              </motion.div>
            ))}
            
            {/* Add New Slot */}
            <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer">
              <UserPlus size={24} />
              <span className="text-xs font-bold uppercase tracking-wider">Recruit</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
