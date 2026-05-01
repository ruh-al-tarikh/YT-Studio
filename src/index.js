export default {
  async fetch(request, env) {
    try {
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
        const API_KEY = env.YOUTUBE_API_KEY;
        const CHANNEL_ID = "UCrjJP_SHUeCmqpTSHJCXkdA";

        if (!API_KEY) {
          // Fallback mock videos if no API key for easy previewing
          const mockVideos = [
            {
              id: "Zzcdtm7Il9U",
              title: "The hidden wall of Dhul-Qarnayn explained (Fallback)",
              thumbnail: "https://i.ytimg.com/vi/Zzcdtm7Il9U/mqdefault.jpg",
              publishedAt: "2024-01-15T10:00:00Z",
              channel: "Ruh Al Tarikh",
              category: "history"
            }
          ];
          return Response.json({ success: true, videos: mockVideos, note: "API key missing, using fallback" }, { headers: corsHeaders });
        }

        // 🔍 Step 1: Get uploads playlist
        const channelRes = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
        );
        const channelData = await channelRes.json();

        if (!channelData.items || channelData.items.length === 0) {
          return Response.json({ success: false, error: "Channel not found" }, { status: 500, headers: corsHeaders });
        }

        const uploads = channelData.items[0].contentDetails.relatedPlaylists.uploads;

        // 🎬 Step 2: Get videos
        const videoRes = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploads}&key=${API_KEY}`
        );
        const videoData = await videoRes.json();

        if (!videoData.items) {
          return Response.json({ success: false, error: "Videos not found" }, { status: 500, headers: corsHeaders });
        }

        const videos = videoData.items.map((item) => ({
          id: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
          publishedAt: item.snippet.publishedAt,
          channel: item.snippet.channelTitle,
          description: item.snippet.description
        }));

        return Response.json({ success: true, videos }, { headers: corsHeaders });
      }

      if (url.pathname === "/api/youtube") {
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
      }

      if (url.pathname === "/api/orders") {
        if (!env.MY_DB) {
          return Response.json({ success: false, error: "D1 database not configured" }, { status: 503, headers: corsHeaders });
        }
        const { results } = await env.MY_DB.prepare("SELECT * FROM Orders").all();
        return Response.json({ success: true, count: results?.length || 0, data: results || [] }, { headers: corsHeaders });
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
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
  }
};
