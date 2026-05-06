/**
 * YouTube API V3 Worker - Cloudflare Worker
 */

export interface Env {
  YOUTUBE_API_KEY: string;
}

const ALLOWED_CHANNEL_ID = 'UCrjJP_SHUeCmqpTSHJCXkdA';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const apiKey = env.YOUTUBE_API_KEY;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    
    // Check API key
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Health check
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          worker: 'yt-studio-youtube-api',
          allowedChannel: ALLOWED_CHANNEL_ID,
          timestamp: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Channel stats endpoint
    if (url.pathname === '/api/channel') {
      try {
        const youtubeUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${ALLOWED_CHANNEL_ID}&key=${apiKey}`;
        const response = await fetch(youtubeUrl);
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
          return new Response(
            JSON.stringify({ error: 'Channel not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const channel = data.items[0];
        const stats = channel.statistics;
        
        return new Response(
          JSON.stringify({
            success: true,
            channelId: ALLOWED_CHANNEL_ID,
            title: channel.snippet.title,
            description: channel.snippet.description,
            thumbnail: channel.snippet.thumbnails.default.url,
            subscribers: parseInt(stats.subscriberCount, 10),
            views: parseInt(stats.viewCount, 10),
            videos: parseInt(stats.videoCount, 10),
            createdAt: channel.snippet.publishedAt,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch channel data', details: String(error) }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // 404 for other routes
    return new Response(
      JSON.stringify({ 
        error: 'Not found', 
        endpoints: ['/api/channel', '/health'],
        allowedChannel: ALLOWED_CHANNEL_ID
      }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  },
};
