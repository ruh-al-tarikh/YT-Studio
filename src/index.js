export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/") {
      return new Response("<h1>YT Studio API 🚀</h1><p>Service running. Try <code>/health</code> or <code>/api/videos</code></p>", {
        headers: { ...corsHeaders, "content-type": "text/html" },
      });
    }

    if (url.pathname === "/health") {
      return Response.json(
        {
          status: "ok",
          service: "yt-studio-api",
          time: new Date().toISOString(),
          bindings: {
            youtube_key: !!env.YOUTUBE_API_KEY,
            d1_db: !!env.MY_DB,
          },
        },
        { headers: corsHeaders }
      );
    }

    if (url.pathname === "/api/videos") {
      const mockVideos = [
        {
          id: "Zzcdtm7Il9U",
          title: "The hidden wall of Dhul-Qarnayn explained",
          thumbnail: "https://i.ytimg.com/vi/Zzcdtm7Il9U/mqdefault.jpg",
          publishedAt: "2024-01-15T10:00:00Z",
          channel: "Ruh Al Tarikh",
          category: "history"
        },
        {
          id: "dQw4w9WgXcQ",
          title: "Islamic History: The Umayyad Dynasty",
          thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
          publishedAt: "2024-01-10T14:30:00Z",
          channel: "Ruh Al Tarikh",
          category: "history"
        },
        {
          id: "jNQXAC9IVRw",
          title: "Quran Tafsir: Surah Al-Fatiha",
          thumbnail: "https://i.ytimg.com/vi/jNQXAC9IVRw/mqdefault.jpg",
          publishedAt: "2024-01-08T09:15:00Z",
          channel: "Ruh Al Tarikh",
          category: "quran"
        },
      ];

      return Response.json(
        { success: true, videos: mockVideos },
        { headers: corsHeaders }
      );
    }

    if (url.pathname === "/api/youtube") {
      try {
        const videoId = url.searchParams.get("id");
        if (!videoId) {
          return Response.json({ success: false, error: "Missing id" }, { status: 400, headers: corsHeaders });
        }
        const apiKey = env.YOUTUBE_API_KEY;
        if (!apiKey) {
          return Response.json({ success: false, error: "API key missing" }, { status: 503, headers: corsHeaders });
        }
        const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`);
        const data = await res.json();
        return Response.json({ success: true, videoId, data }, { headers: corsHeaders });
      } catch (err) {
        return Response.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders });
      }
    }

    if (url.pathname === "/api/orders") {
      try {
        if (!env.MY_DB) {
          return Response.json({ success: false, error: "D1 database not configured" }, { status: 503, headers: corsHeaders });
        }
        const { results } = await env.MY_DB.prepare("SELECT * FROM Orders").all();
        return Response.json({ success: true, count: results?.length || 0, data: results || [] }, { headers: corsHeaders });
      } catch (err) {
        return Response.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders });
      }
    }

    if (url.pathname === "/debug") {
      return Response.json(
        {
          environment: env.ENVIRONMENT || "production",
          bindings: {
            youtube_api_key: !!env.YOUTUBE_API_KEY,
            d1_database: !!env.MY_DB,
          },
          request: {
            url: request.url,
            method: request.method,
          },
          timestamp: new Date().toISOString(),
        },
        { headers: corsHeaders }
      );
    }

    return Response.json({ error: "Not Found", available: ["/", "/health", "/api/videos", "/api/youtube?id=VIDEO_ID", "/api/orders", "/debug"] }, { status: 404, headers: corsHeaders });
  }
};
