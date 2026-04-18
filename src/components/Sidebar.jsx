import React from 'react';
import { Home, TrendingUp, Clock, Library, Compass, Heart, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r border-white/5 bg-background/40 backdrop-blur-2xl lg:flex z-40">
      <div className="p-8">
        <h1 className="text-2xl font-bold tracking-tight text-gradient font-serif">
          RUH AL TARIKH
        </h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-1 font-medium">
          Cinematic History
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8 scrollbar-hide">
        <div>
          <h3 className="px-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-4">
            Browse
          </h3>
          <nav className="space-y-1">
            <NavItem icon={<Home size={18} />} label="Discover" active />
            <NavItem icon={<Compass size={18} />} label="Explore" />
            <NavItem icon={<TrendingUp size={18} />} label="Trending" />
          </nav>
        </div>

        <div>
          <h3 className="px-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-4">
            Library
          </h3>
          <nav className="space-y-1">
            <NavItem icon={<Clock size={18} />} label="Recent" />
            <NavItem icon={<Library size={18} />} label="Playlists" />
            <NavItem icon={<Heart size={18} />} label="Watchlist" />
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-white/5">
        <NavItem icon={<Settings size={18} />} label="Settings" />
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active = false }) {
  return (
    <a href="#" className={cn(
      "flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 group relative overflow-hidden",
      active
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
    )}>
      {active && (
        <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full shadow-[0_0_10px_oklch(var(--color-primary))]" />
      )}
      <span className={cn(
        "transition-transform duration-300 group-hover:scale-110",
        active ? "text-primary" : "text-muted-foreground"
      )}>
        {icon}
      </span>
      {label}
    </a>
  );
}
