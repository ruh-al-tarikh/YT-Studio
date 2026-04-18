import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { cn } from '../lib/utils';

export function VideoCard({ video, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="group relative min-w-[300px] md:min-w-[340px] cursor-pointer"
      whileHover={{ scale: 1.05, y: -8 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted/30 border border-white/5 shadow-2xl transition-all duration-500 group-hover:border-primary/30 group-hover:shadow-primary/10">
        {/* Iframe Facade */}
        <img
          src={`https://i.ytimg.com/vi/${video.videoId}/maxresdefault.jpg`}
          alt={video.title}
          className={cn(
            "h-full w-full object-cover transition-all duration-700",
            isHovered ? "scale-110 opacity-40 blur-sm" : "scale-100 opacity-100"
          )}
        />

        {/* Play Icon Overlay */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-500",
          isHovered ? "opacity-100 scale-100" : "opacity-0 scale-50"
        )}>
          <div className="rounded-full bg-primary p-4 text-primary-foreground shadow-[0_0_30px_oklch(var(--color-primary))]">
            <Play fill="currentColor" size={24} />
          </div>
        </div>

        {/* Dynamic Glass Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
      </div>

      <div className="mt-5 space-y-2 px-1">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug transition-colors group-hover:text-primary">
          {video.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            Cinematic Series
          </span>
          <span className="h-1 w-1 rounded-full bg-primary/40" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            4K Ultra HD
          </span>
        </div>
      </div>
    </motion.div>
  );
}
