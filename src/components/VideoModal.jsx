import React from 'react';
import { X, ChevronRight, Share2, Heart, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export function VideoModal({ video, onClose, onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-xl md:p-8"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-6xl overflow-hidden rounded-[2.5rem] bg-card shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5"
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 z-20 rounded-full bg-background/50 p-3 text-foreground backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:scale-110"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col lg:flex-row h-full">
          {/* Player Section */}
          <div className="flex-1 aspect-video lg:aspect-auto">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1`}
              allow="autoplay; fullscreen"
            />
          </div>

          {/* Details Section */}
          <div className="w-full lg:w-[400px] p-8 md:p-10 flex flex-col justify-between bg-gradient-to-br from-white/5 to-transparent">
            <div>
              <div className="flex items-center gap-2 mb-6">
                 <span className="h-1 w-12 bg-primary rounded-full" />
                 <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">Now Playing</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold leading-tight font-serif mb-6">
                {video.title}
              </h2>

              <p className="text-muted-foreground text-sm leading-relaxed mb-8 font-light">
                Immerse yourself in this cinematic masterpiece. Part of our exclusive historical series, exploring the depths of heritage and legacy.
              </p>

              <div className="flex items-center gap-4 mb-10">
                <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-primary">
                  <Heart size={20} />
                </button>
                <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-primary">
                  <Share2 size={20} />
                </button>
                <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-primary">
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <button
              onClick={onNext}
              className="group flex w-full items-center justify-between rounded-2xl bg-primary px-8 py-5 text-sm font-bold text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_oklch(var(--color-primary)/0.3)] active:scale-95"
            >
              <span>Next Episode</span>
              <ChevronRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
