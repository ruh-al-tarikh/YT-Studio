export interface Env {
  MY_DB?: D1Database;
  YOUTUBE_API_KEY?: string;
  NODE_ENV?: string;
  API_URL?: string;
}

function getMockVideos(headers: any, isDemo: boolean): Response {
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
    }
  ];

  return Response.json(
    { success: true, isDemo, videos: mockVideos },
    { headers }
  );
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);

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

    // Attempt cache match for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) return cachedResponse;
    }

    let response: Response;

    // ----------------------------
    // 🏠 Root endpoint
    // ----------------------------
    if (url.pathname === "/") {
      response = new Response("<h1>YT Studio API 🚀</h1><p>Service running. Try <code>/health</code> or <code>/api/videos</code></p>", {
        headers: { ...corsHeaders, "content-type": "text/html" },
      });
    }

    // ----------------------------
    // 🧪 Health check
    // ----------------------------
    else if (url.pathname === "/health") {
      response = Response.json(
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
    // 📺 Videos API - YouTube + Mock Fallback
    // ----------------------------
    else if (url.pathname === "/api/videos") {
      const channelId = url.searchParams.get("channelId");
      const apiKey = env.YOUTUBE_API_KEY;

      if (channelId && apiKey) {
        try {
          const ytUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=50&type=video`;
          const ytRes = await fetch(ytUrl);
          const ytData: any = await ytRes.json();

          if (ytRes.ok && ytData.items) {
            const videos = ytData.items.map((item: any) => ({
              id: item.id.videoId,
              title: item.snippet.title,
              thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
              publishedAt: item.snippet.publishedAt,
              channel: item.snippet.channelTitle,
              description: item.snippet.description
            }));

            response = Response.json(
              { success: true, isDemo: false, videos },
              { headers: { ...corsHeaders, "Cache-Control": "public, max-age=900" } }
            );
          } else {
            throw new Error(ytData.error?.message || "YouTube API Error");
          }
        } catch (err) {
          console.error("YouTube Fetch Failed:", err);
          response = getMockVideos(corsHeaders, true);
        }
      } else {
        response = getMockVideos(corsHeaders, true);
      }
    }

    // ----------------------------
    // 🎥 YouTube Single Video API
    // ----------------------------
    else if (url.pathname === "/api/youtube") {
      try {
        const videoId = url.searchParams.get("id");

        if (!videoId) {
          response = new Response(
            JSON.stringify({
              success: false,
              error: "Missing required parameter: id",
            }),
            { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } }
          );
        } else {
          const apiKey = env.YOUTUBE_API_KEY;
          if (!apiKey) {
            response = Response.json(
              {
                success: false,
                error: "YouTube API key not configured",
              },
              { status: 503, headers: corsHeaders }
            );
          } else {
            const ytUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${encodeURIComponent(videoId)}&key=${apiKey}`;
            const res = await fetch(ytUrl);
            const data: any = await res.json();

            if (!res.ok) {
              response = Response.json(
                {
                  success: false,
                  error: data.error?.message || "YouTube API error",
                },
                { status: res.status, headers: corsHeaders }
              );
            } else {
              response = Response.json(
                {
                  success: true,
                  videoId,
                  data,
                },
                { headers: corsHeaders }
              );
            }
          }
        }
      } catch (err) {
        response = Response.json(
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
    else if (url.pathname === "/api/orders") {
      try {
        if (!env.MY_DB) {
          response = Response.json(
            {
              success: false,
              error: "D1 database not configured",
            },
            { status: 503, headers: corsHeaders }
          );
        } else {
          const { results } = await env.MY_DB
            .prepare("SELECT * FROM Orders")
            .all();

          response = Response.json(
            {
              success: true,
              count: results?.length || 0,
              data: results || [],
            },
            { headers: corsHeaders }
          );
        }
      } catch (err) {
        response = Response.json(
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
    else if (url.pathname === "/debug") {
      response = Response.json(
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
    else {
      response = new Response(
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
    }

    // Cache the response if it's a successful GET request
    if (request.method === 'GET' && response.ok) {
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }

    return response;
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log("Cron job executed at:", new Date().toISOString());
    ctx.waitUntil(Promise.resolve());
  }
};
