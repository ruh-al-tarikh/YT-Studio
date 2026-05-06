export interface Env { YOUTUBE_API_KEY: string; }

const ALLOWED = 'UCrjJP_SHUeCmqpTSHJCXkdA';
const MAIN_WORKER = 'https://yt-studio-youtube-api.ruhdevopsytstudio.workers.dev';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Block requests for other channels
    if (url.pathname.includes('/api/channel/')) {
      const channelId = url.pathname.split('/').pop();
      if (channelId !== ALLOWED) {
        return new Response(JSON.stringify({
          error: 'Access denied. This service only serves data for the authorized channel.',
          allowedChannel: ALLOWED
        }), { 
          status: 403, 
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Block video requests not from your channel (optional)
    if (url.pathname.includes('/api/video/')) {
      const videoId = url.pathname.split('/').pop();
      // First check if video belongs to your channel
      const apiKey = env.YOUTUBE_API_KEY;
      const checkUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
      const videoRes = await fetch(checkUrl);
      const videoData = await videoRes.json();
      
      if (videoData.items && videoData.items[0]) {
        const channelId = videoData.items[0].snippet.channelId;
        if (channelId !== ALLOWED) {
          return new Response(JSON.stringify({
            error: 'Access denied. This video does not belong to the authorized channel.',
            allowedChannel: ALLOWED
          }), { 
            status: 403, 
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }
    
    // Proxy to main worker
    return fetch(`${MAIN_WORKER}${url.pathname}${url.search}`, {
      headers: { 
        'Content-Type': 'application/json',
        'X-API-Key': env.YOUTUBE_API_KEY 
      }
    });
  }
};
