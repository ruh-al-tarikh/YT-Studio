import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Background } from "./components/Background";
import { Sidebar } from './components/Sidebar';
import { HeroSection } from './components/HeroSection';
import { VideoRow } from './components/VideoRow';
import { VideoModal } from './components/VideoModal';

const API = "https://yt-studio-api.ruhdevopsytstudio.workers.dev";

export default function App() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetch(API)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!mounted) return;
        if (data.error) throw new Error(data.error);
        setVideos(data.videos || []);
        setLoading(false);
      })
      .catch(err => {
        if (!mounted) return;
        console.error("Fetch error:", err);
        setError(err.message);
        setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const heroVideo = videos[0];

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Background />
      <Sidebar />

      <main className="flex-1 lg:ml-64">
        {loading ? (
          <div className="flex h-screen flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground animate-pulse font-medium">Fetching cinematic content...</p>
          </div>
        ) : error ? (
          <div className="flex h-screen flex-col items-center justify-center gap-6 px-4 text-center">
            <div className="rounded-full bg-destructive/10 p-6 text-destructive">
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Failed to load content</h2>
              <p className="mt-2 text-muted-foreground max-w-md">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="rounded-full bg-primary px-8 py-2.5 font-bold text-primary-foreground transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/20 active:scale-95"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in duration-1000">
            <HeroSection video={heroVideo} onPlay={() => setSelectedVideo(heroVideo)} />

            <div className="space-y-16 pb-24 pt-8">
              {videos.length > 0 ? (
                <>
                  <VideoRow title="🔥 Trending Now" videos={videos.slice(0, 10)} onSelect={setSelectedVideo} />
                  <VideoRow title="🆕 Latest Releases" videos={[...videos].reverse().slice(0, 10)} onSelect={setSelectedVideo} />
                  <VideoRow title="🏛️ Historical Series" videos={videos.slice(10, 20)} onSelect={setSelectedVideo} />
                </>
              ) : (
                <div className="flex h-64 items-center justify-center">
                  <p className="text-muted-foreground">No cinematic content found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedVideo && (
          <VideoModal
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
            onNext={() => {
              const idx = videos.indexOf(selectedVideo);
              if (idx < videos.length - 1) setSelectedVideo(videos[idx + 1]);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
