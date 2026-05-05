export interface Env {
  MY_DB?: D1Database;
  YOUTUBE_API_KEY?: string;
  NODE_ENV?: string;
  API_URL?: string;
}

const MOCK_VIDEOS = [
  {
    id: "Zzcdtm7Il9U",
    title: "The hidden wall of Dhul-Qarnayn explained",
    thumbnail: "https://i.ytimg.com/vi/Zzcdtm7Il9U/mqdefault.jpg",
    publishedAt: "2024-01-15T10:00:00Z",
    channel: "Ruh Al Tarikh",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Islamic History: The Umayyad Dynasty",
    thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    publishedAt: "2024-01-10T14:30:00Z",
    channel: "Ruh Al Tarikh",
  },
  {
    id: "jNQXAC9IVRw",
    title: "Quran Tafsir: Surah Al-Fatiha",
    thumbnail: "https://i.ytimg.com/vi/jNQXAC9IVRw/mqdefault.jpg",
    publishedAt: "2024-01-08T09:15:00Z",
    channel: "Ruh Al Tarikh",
  }
];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/api/videos") {
      const channelId = url.searchParams.get("channelId");
      const apiKey = env.YOUTUBE_API_KEY;

      if (channelId && apiKey) {
        try {
          const ytUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=50&type=video`;
          const ytRes = await fetch(ytUrl);
          if (ytRes.ok) {
            const ytData = (await ytRes.json()) as any;
            if (ytData && ytData.items) {
              const videos = ytData.items.map((item: any) => ({
                id: item.id.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
                publishedAt: item.snippet.publishedAt,
                channel: item.snippet.channelTitle,
                description: item.snippet.description
              }));
              return Response.json(
                { success: true, isDemo: false, videos },
                { headers: { ...corsHeaders, "Cache-Control": "public, max-age=900" } }
              );
            }
          }
        } catch (err) {
          console.error("YouTube Fetch Failed:", err);
        }
      }
      return Response.json(
        { success: true, isDemo: true, videos: MOCK_VIDEOS },
        { headers: corsHeaders }
      );
    }

    if (url.pathname === "/api/youtube") {
      const videoId = url.searchParams.get("id");
      const apiKey = env.YOUTUBE_API_KEY;
      if (videoId && apiKey) {
        try {
          const ytUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${encodeURIComponent(videoId)}&key=${apiKey}`;
          const res = await fetch(ytUrl);
          if (res.ok) {
            const data = await res.json();
            return Response.json({ success: true, videoId, data }, { headers: corsHeaders });
          }
        } catch (err) {
          return Response.json({ success: false, error: String(err) }, { status: 500, headers: corsHeaders });
        }
      }
      return Response.json({ success: false, error: "Missing ID or API Key" }, { status: 400, headers: corsHeaders });
    }

    if (url.pathname === "/api/orders") {
      if (!env.MY_DB) return Response.json({ success: false, error: "D1 not bound" }, { status: 503, headers: corsHeaders });
      try {
        const { results } = await env.MY_DB.prepare("SELECT * FROM Orders").all();
        return Response.json({ success: true, count: results.length, data: results }, { headers: corsHeaders });
      } catch (err) {
        return Response.json({ success: false, error: String(err) }, { status: 500, headers: corsHeaders });
      }
    }

    if (url.pathname === "/debug") {
      return Response.json({
        environment: env.NODE_ENV || "production",
        bindings: { youtube_key: !!env.YOUTUBE_API_KEY, d1: !!env.MY_DB },
        timestamp: new Date().toISOString()
      }, { headers: corsHeaders });
    }

    if (url.pathname === "/health") {
      return Response.json({ status: "ok", time: new Date().toISOString() }, { headers: corsHeaders });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};
