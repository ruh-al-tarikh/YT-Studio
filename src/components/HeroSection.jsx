import React from 'react';
import { Play, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export function HeroSection({ video, onPlay }) {
  if (!video) return null;

  return (
    <section className="relative h-[85vh] w-full overflow-hidden">
      {/* Background Video / Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-background via-transparent to-transparent" />
        <iframe
          className="h-full w-full scale-[1.35] opacity-50 grayscale-[10%] blur-[2px]"
          src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${video.videoId}&rel=0&modestbranding=1`}
          allow="autoplay; encrypted-media"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 flex h-full flex-col justify-end p-8 md:p-20 lg:pb-32">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
              Featured Series
            </span>
            <span className="h-px w-12 bg-white/20" />
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-widest">
              HD 4K Cinematic
            </span>
          </div>

          <h1 className="text-5xl font-bold md:text-8xl leading-[1.1] mb-6 font-serif tracking-tight drop-shadow-2xl">
            {video.title}
          </h1>

          <p className="max-w-xl text-lg md:text-xl text-muted-foreground font-light leading-relaxed mb-10 border-l-2 border-primary/30 pl-6">
            Embark on a profound journey through history. Experience the untold stories, legendary figures, and pivotal moments that shaped our world.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onPlay}
              className="flex items-center gap-3 rounded-full bg-primary px-10 py-4 font-bold text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_oklch(var(--color-primary)/0.4)] active:scale-95 group"
            >
              <Play className="fill-current transition-transform duration-300 group-hover:scale-110" size={20} />
              Watch Now
            </button>

            <button
              className="flex items-center gap-3 rounded-full bg-white/10 px-10 py-4 font-bold text-foreground backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95"
            >
              <Info size={20} />
              More Details
            </button>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/30 hidden md:block"
      >
        <div className="w-px h-12 bg-gradient-to-b from-primary/50 to-transparent mx-auto" />
      </motion.div>
    </section>
  );
}
