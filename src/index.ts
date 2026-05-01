export interface Env {
  MY_DB?: D1Database;
  YOUTUBE_API_KEY?: string;
  NODE_ENV?: string;
  API_URL?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // ----------------------------
    // 🏠 Root endpoint
    // ----------------------------
    if (url.pathname === "/") {
      return new Response("<h1>YT Studio API 🚀</h1><p>Service running. Try <code>/health</code> or <code>/api/videos</code></p>", {
        headers: { ...corsHeaders, "content-type": "text/html" },
      });
    }

    // ----------------------------
    // 🧪 Health check
    // ----------------------------
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

    // ----------------------------
    // 📺 Videos API - Returns mock data
    // ----------------------------
    if (url.pathname === "/api/videos") {
      const mockVideos = [
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
        },
      ];

      return Response.json(
        { success: true, videos: mockVideos },
        { headers: corsHeaders }
      );
    }

    // ----------------------------
    // 🎥 YouTube API
    // ----------------------------
    if (url.pathname === "/api/youtube") {
      try {
        const videoId = url.searchParams.get("id");

        if (!videoId) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Missing required parameter: id",
            }),
            { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } }
          );
        }

        const apiKey = env.YOUTUBE_API_KEY;
        if (!apiKey) {
          return Response.json(
            {
              success: false,
              error: "YouTube API key not configured",
            },
            { status: 503, headers: corsHeaders }
          );
        }

        const ytUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${encodeURIComponent(videoId)}&key=${apiKey}`;

        const res = await fetch(ytUrl);
        const data = await res.json();

        if (!res.ok) {
          return Response.json(
            {
              success: false,
              error: data.error?.message || "YouTube API error",
            },
            { status: res.status, headers: corsHeaders }
          );
        }

        return Response.json(
          {
            success: true,
            videoId,
            data,
          },
          { headers: corsHeaders }
        );
      } catch (err) {
        return Response.json(
          {
            success: false,
            error: err instanceof Error ? err.message : String(err),
          },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // ----------------------------
    // 📦 D1 Orders API
    // ----------------------------
    if (url.pathname === "/api/orders") {
      try {
        if (!env.MY_DB) {
          return Response.json(
            {
              success: false,
              error: "D1 database not configured",
            },
            { status: 503, headers: corsHeaders }
          );
        }

        const { results } = await env.MY_DB
          .prepare("SELECT * FROM Orders")
          .all();

        return Response.json(
          {
            success: true,
            count: results?.length || 0,
            data: results || [],
          },
          { headers: corsHeaders }
        );
      } catch (err) {
        return Response.json(
          {
            success: false,
            error: err instanceof Error ? err.message : String(err),
          },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // ----------------------------
    // 🔍 Debug endpoint
    // ----------------------------
    if (url.pathname === "/debug") {
      return Response.json(
        {
          environment: env.NODE_ENV || "production",
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

    // ----------------------------
    // ❌ 404 - Not Found
    // ----------------------------
    return new Response(
      JSON.stringify({
        error: "Endpoint not found",
        message: `${request.method} ${url.pathname} does not exist`,
        available: ["/", "/health", "/api/videos", "/api/youtube?id=VIDEO_ID", "/debug"],
      }),
      {
        status: 404,
        headers: { ...corsHeaders, "content-type": "application/json" },
      }
    );
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log("Cron job executed at:", new Date().toISOString());
    ctx.waitUntil(Promise.resolve());
  }
};
