export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ----------------------------
    // 🏠 Root endpoint
    // ----------------------------
    if (url.pathname === "/") {
      return new Response("<h1>YT Studio 🚀</h1>", {
        headers: { "content-type": "text/html" },
      });
    }

    // ----------------------------
    // 🧪 Health check (for debugging)
    // ----------------------------
    if (url.pathname === "/health") {
      return Response.json({
        status: "ok",
        time: new Date().toISOString(),
      });
    }

    // ----------------------------
    // 📦 D1 Orders API
    // ----------------------------
    if (url.pathname === "/api/orders") {
      try {
        if (!env.MY_DB) {
          return new Response("D1 binding missing: MY_DB", { status: 500 });
        }

        const { results } = await env.MY_DB
          .prepare("SELECT * FROM Orders")
          .all();

        return Response.json({
          success: true,
          count: results?.length || 0,
          data: results,
        });
      } catch (err) {
        return new Response(
          JSON.stringify({
            success: false,
            error: err.message,
          }),
          {
            status: 500,
            headers: { "content-type": "application/json" },
          }
        );
      }
    }

    // ----------------------------
    // 🎥 YouTube API
    // ----------------------------
    if (url.pathname === "/api/youtube") {
      try {
        const videoId = url.searchParams.get("id");

        if (!videoId) {
          return new Response("Missing ?id parameter", { status: 400 });
        }

        if (!env.YOUTUBE_API_KEY) {
          return new Response("Missing YOUTUBE_API_KEY secret", {
            status: 500,
          });
        }

        const ytUrl = "https://www.googleapis.com/youtube/v3/videos" +
          "?part=snippet,contentDetails,statistics&id=" + videoId +
          "&key=" + env.YOUTUBE_API_KEY;

        const res = await fetch(ytUrl);
        const data = await res.json();

        return Response.json({
          success: true,
          data,
        });
      } catch (err) {
        return Response.json(
          {
            success: false,
            error: err.message,
          },
          { status: 500 }
        );
      }
    }

    // ----------------------------
    // 🔍 Debug endpoint
    // ----------------------------
    if (url.pathname === "/debug") {
      return Response.json({
        environment: env.NODE_ENV || "production",
        db_bound: !!env.MY_DB,
        youtube_key_bound: !!env.YOUTUBE_API_KEY,
        url: request.url,
        method: request.method,
      });
    }

    // ----------------------------
    // ❌ Fallback 404
    // ----------------------------
    return new Response("Not Found", { status: 404 });
  },
};