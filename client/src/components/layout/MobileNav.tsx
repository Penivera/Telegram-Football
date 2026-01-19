import { Link, useLocation } from "wouter";
import { Home, Trophy, Users, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Users, label: "Team", path: "/team" },
    { icon: Trophy, label: "Play", path: "/game" },
    { icon: ShoppingBag, label: "Market", path: "/market" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2">
      <div className="glass mx-auto max-w-md rounded-2xl px-2 py-3 shadow-lg backdrop-blur-md">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <Link key={item.path} href={item.path}>
                <div className={cn(
                  "flex flex-col items-center justify-center space-y-1 w-16 transition-all duration-200 cursor-pointer group",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}>
                  <div className={cn(
                    "relative p-2 rounded-xl transition-all duration-200",
                    isActive && "bg-primary/10 shadow-[0_0_15px_rgba(74,222,128,0.3)]"
                  )}>
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    {isActive && (
                      <span className="absolute inset-0 rounded-xl bg-primary/20 blur-sm animate-pulse" />
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium tracking-wide transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
