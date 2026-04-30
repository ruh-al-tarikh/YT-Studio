export default {
  async fetch(request: Request, env: any) {
    try {
      const API_KEY = env.YOUTUBE_API_KEY;
      const CHANNEL_ID = "UCrjJP_SHUeCmqpTSHJCXkdA";

      if (!API_KEY) {
        return new Response("❌ Missing API key", { status: 500 });
      }

      // 🔍 Step 1: Get uploads playlist
      const channelRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
      );

      const channelText = await channelRes.text();
      let channelData;

      try {
        channelData = JSON.parse(channelText);
      } catch {
        return new Response("❌ Invalid JSON from YouTube (channels)", { status: 500 });
      }

      if (!channelData.items || channelData.items.length === 0) {
        return new Response(
          "❌ Channel fetch failed: " + channelText,
          { status: 500 }
        );
      }

      const uploads =
        channelData.items[0].contentDetails.relatedPlaylists.uploads;

      // 🎬 Step 2: Get videos
      const videoRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=12&playlistId=${uploads}&key=${API_KEY}`
      );

      const videoText = await videoRes.text();
      let videoData;

      try {
        videoData = JSON.parse(videoText);
      } catch {
        return new Response("❌ Invalid JSON from YouTube (videos)", { status: 500 });
      }

      if (!videoData.items) {
        return new Response(
          "❌ Video fetch failed: " + videoText,
          { status: 500 }
        );
      }

      const videos = videoData.items.map((item: any) => ({
        title: item.snippet.title,
        videoId: item.snippet.resourceId.videoId,
        thumbnail: item.snippet.thumbnails.medium.url,
      }));

      return new Response(JSON.stringify({ videos }), {
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });

    } catch (err: any) {
      return new Response("🔥 Worker Crash: " + err.message, {
        status: 500,
      });
    }
  },
};