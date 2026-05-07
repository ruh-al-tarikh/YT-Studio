/**
 * YouTube API V3 Worker - Cloudflare Worker
 * Fetches data from YouTube Channel: UCrjJP_SHUeCmqpTSHJCXkdA (Ruh Al Tarikh)
 * Provides video listing and channel statistics via API endpoints
 */

export interface Env {
  YOUTUBE_API_KEY?: string;
}

interface Video {
  id: string;
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  category?: string;
  duration?: string;
  viewCount?: string;
}

interface ChannelResponse {
  status: string;
  channel?: {
    id: string;
    title: string;
    subscribers?: string;
    views?: string;
    videos?: number;
  };
  error?: string;
  isDemo?: boolean;
  videos?: Video[];
}

// Demo data for fallback
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
  },
  {
    id: "C_-JF7p1_Dw",
    videoId: "C_-JF7p1_Dw",
    title: "Science and Religion: A Historical Perspective",
    description: "Debate on the relationship between scientific discovery and Islamic teachings.",
    thumbnail: "https://i.ytimg.com/vi/C_-JF7p1_Dw/hqdefault.jpg",
    publishedAt: "2024-01-05T00:00:00Z",
    category: "discussion"
  }
];

const CHANNEL_ID = "UCrjJP_SHUeCmqpTSHJCXkdA";

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
      // Health check endpoint
      if (path === '/' || path === '/health') {
        return new Response(
          JSON.stringify({
            status: 'healthy',
            worker: 'yt-studio-youtube-api-prod',
            timestamp: new Date().toISOString(),
            channel: CHANNEL_ID,
            endpoints: {
              health: '/',
              channel: '/api/channel',
              videos: '/api/videos',
              search: '/api/search'
            }
          }),
          { status: 200, headers: corsHeaders }
        );
      }

      // Get channel information
      if (path === '/api/channel') {
        const apiKey = env.YOUTUBE_API_KEY;

        if (!apiKey) {
          // Return demo data if no API key
          return new Response(
            JSON.stringify({
              isDemo: true,
              status: 'using_demo_data',
              message: 'Configure YOUTUBE_API_KEY to enable live YouTube data',
              channel: {
                id: CHANNEL_ID,
                title: 'Ruh Al Tarikh - Cinematic Islamic Archive',
                url: `https://www.youtube.com/channel/${CHANNEL_ID}`
              }
            }),
            { status: 200, headers: corsHeaders }
          );
        }

        try {
          // Fetch from YouTube API
          const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${CHANNEL_ID}&key=${apiKey}`;
          const response = await fetch(channelUrl);
          const data = await response.json();

          if (!data.items || data.items.length === 0) {
            throw new Error('Channel not found');
          }

          const channel = data.items[0];
          const stats = channel.statistics;
          const snippet = channel.snippet;

          return new Response(
            JSON.stringify({
              status: 'success',
              isDemo: false,
              channel: {
                id: channel.id,
                title: snippet.title,
                description: snippet.description,
                thumbnail: snippet.thumbnails?.high?.url,
                subscribers: stats.subscriberCount || 'Hidden',
                views: stats.viewCount || '0',
                videos: parseInt(stats.videoCount || '0', 10),
                url: `https://www.youtube.com/channel/${channel.id}`
              }
            }),
            { status: 200, headers: corsHeaders }
          );
        } catch (error) {
          // Fallback to demo
          console.error('Channel fetch error:', error);
          return new Response(
            JSON.stringify({
              isDemo: true,
              status: 'fallback_to_demo',
              error: 'Failed to fetch live data',
              channel: {
                id: CHANNEL_ID,
                title: 'Ruh Al Tarikh - Cinematic Islamic Archive',
                url: `https://www.youtube.com/channel/${CHANNEL_ID}`
              }
            }),
            { status: 200, headers: corsHeaders }
          );
        }
      }

      // Get channel videos
      if (path === '/api/videos') {
        const apiKey = env.YOUTUBE_API_KEY;
        const maxResults = url.searchParams.get('maxResults') || '12';
        const pageToken = url.searchParams.get('pageToken') || '';

        if (!apiKey) {
          // Return demo data
          return new Response(
            JSON.stringify({
              isDemo: true,
              videos: DEMO_VIDEOS.slice(0, Math.min(parseInt(maxResults, 10), DEMO_VIDEOS.length)),
              count: DEMO_VIDEOS.length,
              message: 'Demo data - configure YOUTUBE_API_KEY for live data'
            }),
            { status: 200, headers: corsHeaders }
          );
        }

        try {
          // Get uploads playlist ID first
          const channelResp = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${apiKey}`
          );
          const channelData = await channelResp.json();

          if (!channelData.items || !channelData.items[0]) {
            throw new Error('Channel not found');
          }

          const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

          // Get videos from uploads playlist
          const videosResp = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&pageToken=${pageToken}&key=${apiKey}`
          );
          const videosData = await videosResp.json();

          if (!videosData.items) {
            throw new Error('No videos found');
          }

          const videos: Video[] = videosData.items.map((item: any) => ({
            id: item.contentDetails.videoId,
            videoId: item.contentDetails.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
            publishedAt: item.snippet.publishedAt,
            category: detectCategory(item.snippet.title)
          }));

          return new Response(
            JSON.stringify({
              isDemo: false,
              videos,
              count: videos.length,
              nextPageToken: videosData.nextPageToken || null,
              totalResults: videosData.pageInfo?.totalResults || videos.length
            }),
            { status: 200, headers: corsHeaders }
          );
        } catch (error) {
          // Fallback to demo
          console.error('Videos fetch error:', error);
          return new Response(
            JSON.stringify({
              isDemo: true,
              videos: DEMO_VIDEOS.slice(0, Math.min(parseInt(maxResults, 10), DEMO_VIDEOS.length)),
              count: DEMO_VIDEOS.length,
              error: 'Failed to fetch live data, using demo'
            }),
            { status: 200, headers: corsHeaders }
          );
        }
      }

      // Search endpoint
      if (path === '/api/search') {
        const query = url.searchParams.get('q');

        if (!query) {
          return new Response(
            JSON.stringify({ error: 'Query parameter required', results: [] }),
            { status: 400, headers: corsHeaders }
          );
        }

        const apiKey = env.YOUTUBE_API_KEY;

        if (!apiKey) {
          // Search in demo data
          const results = DEMO_VIDEOS.filter(video =>
            video.title.toLowerCase().includes(query.toLowerCase()) ||
            video.description?.toLowerCase().includes(query.toLowerCase())
          );
          return new Response(
            JSON.stringify({ isDemo: true, results }),
            { status: 200, headers: corsHeaders }
          );
        }

        try {
          const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&channelId=${CHANNEL_ID}&q=${encodeURIComponent(query)}&maxResults=10&key=${apiKey}`;
          const searchResp = await fetch(searchUrl);
          const searchData = await searchResp.json();

          if (!searchData.items) {
            return new Response(
              JSON.stringify({ isDemo: false, results: [], error: 'No results found' }),
              { status: 200, headers: corsHeaders }
            );
          }

          const results = searchData.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails?.high?.url,
            publishedAt: item.snippet.publishedAt
          }));

          return new Response(
            JSON.stringify({ isDemo: false, results }),
            { status: 200, headers: corsHeaders }
          );
        } catch (error) {
          console.error('Search error:', error);
          return new Response(
            JSON.stringify({ error: 'Search failed' }),
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
          message: String(error),
          isDemo: true,
          videos: DEMO_VIDEOS
        }),
        { status: 500, headers: corsHeaders }
      );
    }
  }
};

// Helper function to detect category from title
function detectCategory(title: string): string {
  const titleLower = title.toLowerCase();
  
  const categories = {
    quran: ['quran', 'surah', 'ayah', 'tafsir', 'quranic'],
    prophecy: ['prophecy', 'dajjal', 'gog', 'magog', 'end times'],
    discussion: ['discussion', 'podcast', 'debate', 'interview'],
    educational: ['guide', 'explained', 'documentary', 'lesson', 'education'],
    history: ['history', 'empire', 'caliph', 'war', 'civilization', 'ottoman', 'crusade', 'silk road']
  };

  for (const [category, terms] of Object.entries(categories)) {
    if (terms.some(term => titleLower.includes(term))) {
      return category;
    }
  }
  
  return 'history'; // default category
}
