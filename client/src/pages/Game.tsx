import { motion } from "framer-motion";
import { ArrowLeft, Play, Timer, Zap } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import bgPattern from "@assets/generated_images/abstract_football_field_background.png";
import playerCard from "@assets/generated_images/football_player_sticker_nft_card.png";

export default function Game() {
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

      <header className="relative z-10 p-4 flex items-center gap-4 border-b border-white/5 bg-background/50 backdrop-blur-md">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="font-display font-bold text-lg">Match Lobby</h1>
      </header>

      <main className="relative z-10 p-4 space-y-6">
        {/* Matchmaking Status */}
        <div className="text-center py-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center mx-auto mb-4 relative z-10 bg-background">
              <Zap className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          </div>
          <h2 className="font-display font-bold text-2xl mb-1">Looking for Opponent</h2>
          <p className="text-muted-foreground text-sm">Estimated wait: 12s</p>
        </div>

        {/* VS Display */}
        <div className="flex items-center justify-between gap-4">
          {/* You */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex-1 bg-gradient-to-br from-blue-900/40 to-blue-900/10 border border-blue-500/30 rounded-xl p-4 flex flex-col items-center gap-3 relative overflow-hidden"
          >
            <div className="w-16 h-16 rounded-full border-2 border-blue-500 overflow-hidden bg-black">
              <img src={playerCard} className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
              <span className="block text-xs text-blue-400 font-bold uppercase">You</span>
              <span className="font-display font-bold text-lg">FC Alpha</span>
              <span className="text-xs text-muted-foreground block">Power: 2450</span>
            </div>
          </motion.div>

          <div className="flex flex-col items-center justify-center shrink-0">
            <span className="font-display font-black text-2xl italic text-white/20">VS</span>
          </div>

          {/* Opponent */}
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex-1 bg-gradient-to-bl from-red-900/40 to-red-900/10 border border-red-500/30 rounded-xl p-4 flex flex-col items-center gap-3 relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
               <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
             </div>
            <div className="w-16 h-16 rounded-full border-2 border-white/10 overflow-hidden bg-black opacity-50">
               {/* Placeholder */}
            </div>
            <div className="text-center opacity-50">
              <span className="block text-xs text-red-400 font-bold uppercase">Enemy</span>
              <span className="font-display font-bold text-lg">Searching...</span>
              <span className="text-xs text-muted-foreground block">Power: ???</span>
            </div>
          </motion.div>
        </div>

        {/* Game Modes */}
        <div className="space-y-3 pt-6">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest pl-1">Select Mode</h3>
          
          <div className="glass p-4 rounded-xl border border-primary/50 flex items-center gap-4 cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 z-0" />
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary z-10">
              <Play fill="currentColor" />
            </div>
            <div className="flex-1 z-10">
              <h4 className="font-display font-bold text-lg">Ranked Match</h4>
              <p className="text-xs text-muted-foreground">Earn Trophy Points & TOF Tokens</p>
            </div>
            <div className="z-10">
              <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-bold">1v1</span>
            </div>
          </div>

          <div className="glass p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-colors flex items-center gap-4 cursor-pointer opacity-70">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-white z-10">
              <Timer />
            </div>
            <div className="flex-1 z-10">
              <h4 className="font-display font-bold text-lg">Practice</h4>
              <p className="text-xs text-muted-foreground">No rewards, test strategies</p>
            </div>
             <div className="z-10">
              <span className="px-2 py-1 rounded bg-white/10 text-white text-xs font-bold">Free</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
