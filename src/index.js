export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS Headers for all responses
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // ----------------------------
    // 🏠 Root endpoint
    // ----------------------------
    if (url.pathname === "/") {
      return new Response("<h1>YT Studio 🚀</h1>", {
        headers: {
          "content-type": "text/html",
          ...corsHeaders
        },
      });
    }

    // ----------------------------
    // 🧪 Health check (for debugging)
    // ----------------------------
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({
        status: "healthy",
        service: "yt-studio-api",
        timestamp: new Date().toISOString(),
        endpoints: ["/", "/health", "/api/videos", "/api/youtube?id=VIDEO_ID", "/api/orders", "/debug"]
      }), {
        headers: corsHeaders
      });
    }

    // ----------------------------
    // 🎥 Videos API - Main endpoint for frontend
    // ----------------------------
    if (url.pathname === "/api/videos") {
      try {
        // Mock data for development/fallback
        // In production, you can fetch from your database or YouTube API
        const mockVideos = [
          {
            id: "Zzcdtm7Il9U",
            title: "The hidden wall of Dhul-Qarnayn explained",
            thumbnail: "https://i.ytimg.com/vi/Zzcdtm7Il9U/mqdefault.jpg",
            publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            channel: "Ruh Al Tarikh"
          },
          {
            id: "dQw4w9WgXcQ",
            title: "The journey through Islamic civilization",
            thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
            publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            channel: "Ruh Al Tarikh"
          },
          {
            id: "jNQXAC9IVRw",
            title: "Understanding the Quran in modern times",
            thumbnail: "https://i.ytimg.com/vi/jNQXAC9IVRw/mqdefault.jpg",
            publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            channel: "Ruh Al Tarikh"
          }
        ];

        return new Response(JSON.stringify({
          success: true,
          videos: mockVideos,
          count: mockVideos.length
        }), {
          status: 200,
          headers: corsHeaders
        });
      } catch (err) {
        return new Response(JSON.stringify({
          success: false,
          error: err.message
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // ----------------------------
    // 🎬 YouTube API Proxy
    // ----------------------------
    if (url.pathname === "/api/youtube") {
      try {
        const videoId = url.searchParams.get("id");

        if (!videoId) {
          return new Response(JSON.stringify({
            success: false,
            error: "Missing ?id parameter"
          }), {
            status: 400,
            headers: corsHeaders
          });
        }

        if (!env.YOUTUBE_API_KEY) {
          return new Response(JSON.stringify({
            success: false,
            error: "YouTube API key not configured on server"
          }), {
            status: 500,
            headers: corsHeaders
          });
        }

        const ytUrl = "https://www.googleapis.com/youtube/v3/videos" +
          "?part=snippet,contentDetails,statistics&id=" + videoId +
          "&key=" + env.YOUTUBE_API_KEY;

        const res = await fetch(ytUrl);
        const data = await res.json();

        return new Response(JSON.stringify({
          success: true,
          videoId,
          data
        }), {
          status: 200,
          headers: corsHeaders
        });
      } catch (err) {
        return new Response(JSON.stringify({
          success: false,
          error: err.message
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // ----------------------------
    // 📦 D1 Orders API
    // ----------------------------
    if (url.pathname === "/api/orders") {
      try {
        if (!env.MY_DB) {
          return new Response(JSON.stringify({
            success: false,
            error: "D1 binding missing: MY_DB"
          }), {
            status: 500,
            headers: corsHeaders
          });
        }

        const { results } = await env.MY_DB
          .prepare("SELECT * FROM Orders")
          .all();

        return new Response(JSON.stringify({
          success: true,
          count: results?.length || 0,
          data: results,
        }), {
          status: 200,
          headers: corsHeaders
        });
      } catch (err) {
        return new Response(JSON.stringify({
          success: false,
          error: err.message,
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // ----------------------------
    // 🔍 Debug endpoint
    // ----------------------------
    if (url.pathname === "/debug") {
      return new Response(JSON.stringify({
        environment: env.NODE_ENV || "production",
        db_bound: !!env.MY_DB,
        youtube_key_bound: !!env.YOUTUBE_API_KEY,
        url: request.url,
        method: request.method,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // ----------------------------
    // ❌ Fallback 404
    // ----------------------------
    return new Response(JSON.stringify({
      success: false,
      error: "Not Found",
      availableEndpoints: ["/", "/health", "/api/videos", "/api/youtube?id=VIDEO_ID", "/api/orders", "/debug"]
    }), {
      status: 404,
      headers: corsHeaders
    });
  },
};
