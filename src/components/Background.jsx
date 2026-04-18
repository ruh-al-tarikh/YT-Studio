import React from 'react';

export function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base Texture */}
      <div className="absolute inset-0 bg-texture" />

      {/* Radial Glows */}
      <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-primary/10 blur-[120px] animate-glow" />
      <div className="absolute -right-[10%] top-[20%] h-[40%] w-[40%] rounded-full bg-accent/5 blur-[100px] animate-glow [animation-delay:2s]" />
      <div className="absolute left-[20%] bottom-[-10%] h-[60%] w-[60%] rounded-full bg-primary/5 blur-[150px] animate-glow [animation-delay:4s]" />

      {/* Noise / Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
    </div>
  );
}
