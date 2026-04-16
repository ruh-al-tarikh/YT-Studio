export default {
  async fetch(request, env) {
    try {
      const API_KEY = env.YOUTUBE_API_KEY;

      // ✅ Step 1: Get uploads playlist directly from channel ID
      const CHANNEL_ID = "UCrjJP_SHUeCmqpTSHJCXkdA";

      const channelRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
      );

      const channelData = await channelRes.json();

      const uploads =
        channelData?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

      if (!uploads) {
        return json({ error: "Uploads playlist not found" }, 500);
      }

      // ✅ Step 2: Fetch videos
      const videosRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploads}&maxResults=20&key=${API_KEY}`
      );

      const videosData = await videosRes.json();

      const videos = (videosData.items || []).map((item) => {
        const s = item.snippet;
        return {
          title: s.title,
          videoId: s.resourceId.videoId,
          thumbnail: s.thumbnails?.high?.url,
          publishedAt: s.publishedAt
        };
      });

      return json({ videos });

    } catch (err) {
      return json({ error: err.message }, 500);
    }
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}