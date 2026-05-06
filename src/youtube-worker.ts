/**
 * YouTube API V3 Worker - Cloudflare Worker
 * Provides YouTube channel and video data via API endpoints
 * Configured for yt-studio production environment
 */

export interface Env {
  YOUTUBE_API_KEY: string;
}

interface Video {
  id: string;
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  category: string;
}

interface ChannelResponse {
  status: string;
  channel?: {
    id: string;
    title: string;
    subscribers: string;
    views: string;
    videos: number;
  };
  isDemo?: boolean;
  videos?: Video[];
}

// Demo data fallback
const DEMO_VIDEOS: Video[] = [
  {
    id: "Zzcdtm7Il9U",
    videoId: "Zzcdtm7Il9U",
    title: "The Hidden Wall of Dhul-Qarnayn Explained",
    description: "Explore the mysterious wall mentioned in the Quran and its historical significance.",
    thumbnail: "https://i.ytimg.com/vi/Zzcdtm7Il9U/hqdefault.jpg",
    publishedAt: "2024-01-15T00:00:00Z",
    category: "history"
  },
  {
    id: "dQw4w9WgXcQ",
    videoId: "dQw4w9WgXcQ",
    title: "Quranic Interpretation of Ancient Civilizations",
    description: "Understand how the Quran discusses ancient empires and their lessons.",
    thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    publishedAt: "2024-01-10T00:00:00Z",
    category: "quran"
  },
  {
    id: "jNQXAC9IVRw",
    videoId: "jNQXAC9IVRw",
    title: "Prophecy and End Times in Islamic Tradition",
    description: "Examine the prophetic narratives of the Quran and their interpretations.",
    thumbnail: "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg",
    publishedAt: "2024-01-08T00:00:00Z",
    category: "prophecy"
  }
];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS, POST',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // Health check
      if (path === '/' || path === '/health') {
        return new Response(
          JSON.stringify({ 
            status: 'healthy', 
            worker: 'yt-studio-youtube-api-prod',
            timestamp: new Date().toISOString(),
            endpoints: {
              health: '/',
              channel: '/api/channel',
              videos: '/api/videos',
              search: '/api/search'
            }
          }),
          { 
            status: 200, 
            headers: corsHeaders
          }
        );
      }

      // Get channel stats
      if (path === '/api/channel' || path === '/api/channel/') {
        const channelId = url.searchParams.get('channelId');
        
        if (!channelId || !env.YOUTUBE_API_KEY) {
          // Return demo data if no channel ID or API key
          return new Response(
            JSON.stringify({
              isDemo: true,
              videos: DEMO_VIDEOS,
              message: 'Demo data - configure YOUTUBE_API_KEY and channelId to enable live data'
            }),
            { status: 200, headers: corsHeaders }
          );
        }

        try {
          // Fetch channel statistics
          const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${env.YOUTUBE_API_KEY}`;
          const channelResp = await fetch(channelUrl);
          const channelData = await channelResp.json();

          if (!channelData.items || channelData.items.length === 0) {
            throw new Error('Channel not found');
          }

          const channel = channelData.items[0];
          const stats = channel.statistics;
          const snippet = channel.snippet;

          const response: ChannelResponse = {
            status: 'success',
            channel: {
              id: channel.id,
              title: snippet.title,
              subscribers: stats.subscriberCount || 'Private',
              views: stats.viewCount || '0',
              videos: parseInt(stats.videoCount || '0', 10)
            }
          };

          return new Response(JSON.stringify(response), {
            status: 200,
            headers: corsHeaders
          });
        } catch (error) {
          console.error('Channel fetch error:', error);
          // Fallback to demo
          return new Response(
            JSON.stringify({
              isDemo: true,
              videos: DEMO_VIDEOS,
              error: 'Failed to fetch live data, using demo'
            }),
            { status: 200, headers: corsHeaders }
          );
        }
      }

      // Get channel videos
      if (path === '/api/videos' || path === '/api/channel/videos') {
        const channelId = url.searchParams.get('channelId');
        const maxResults = url.searchParams.get('maxResults') || '12';

        if (!channelId || !env.YOUTUBE_API_KEY) {
          // Return demo data
          return new Response(
            JSON.stringify({
              isDemo: true,
              videos: DEMO_VIDEOS.slice(0, parseInt(maxResults, 10))
            }),
            { status: 200, headers: corsHeaders }
          );
        }

        try {
          // Get uploads playlist ID
          const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${env.YOUTUBE_API_KEY}`;
          const channelResp = await fetch(channelUrl);
          const channelData = await channelResp.json();

          if (!channelData.items || !channelData.items[0]) {
            throw new Error('Channel not found');
          }

          const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

          // Get videos from uploads playlist
          const videosUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${env.YOUTUBE_API_KEY}`;
          const videosResp = await fetch(videosUrl);
          const videosData = await videosResp.json();

          if (!videosData.items) {
            throw new Error('No videos found');
          }

          const videos: Video[] = videosData.items.map((item: any) => ({
            id: item.snippet.resourceId.videoId,
            videoId: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
            publishedAt: item.snippet.publishedAt,
            category: 'history' // Default category - enhance with custom logic
          }));

          return new Response(
            JSON.stringify({
              isDemo: false,
              videos,
              count: videos.length
            }),
            { status: 200, headers: corsHeaders }
          );
        } catch (error) {
          console.error('Videos fetch error:', error);
          // Fallback to demo
          return new Response(
            JSON.stringify({
              isDemo: true,
              videos: DEMO_VIDEOS.slice(0, parseInt(maxResults, 10)),
              error: 'Failed to fetch live data, using demo'
            }),
            { status: 200, headers: corsHeaders }
          );
        }
      }

      // Search endpoint
      if (path === '/api/search') {
        const query = url.searchParams.get('q');
        
        if (!query || !env.YOUTUBE_API_KEY) {
          return new Response(
            JSON.stringify({ error: 'Query parameter required', results: [] }),
            { status: 400, headers: corsHeaders }
          );
        }

        try {
          const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=10&key=${env.YOUTUBE_API_KEY}`;
          const searchResp = await fetch(searchUrl);
          const searchData = await searchResp.json();

          if (!searchData.items) {
            return new Response(
              JSON.stringify({ error: 'No results found', results: [] }),
              { status: 200, headers: corsHeaders }
            );
          }

          const results = searchData.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
            publishedAt: item.snippet.publishedAt
          }));

          return new Response(
            JSON.stringify({ results }),
            { status: 200, headers: corsHeaders }
          );
        } catch (error) {
          console.error('Search error:', error);
          return new Response(
            JSON.stringify({ error: 'Search failed', results: [] }),
            { status: 500, headers: corsHeaders }
          );
        }
      }

      // 404
      return new Response(
        JSON.stringify({ 
          error: 'Not found',
          endpoints: ['/', '/api/channel', '/api/videos', '/api/search']
        }),
        { status: 404, headers: corsHeaders }
      );

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error',
          message: String(error)
        }),
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
