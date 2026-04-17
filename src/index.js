export default {
  async fetch(request, env) {
    const API_KEY = env.YOUTUBE_API_KEY;

    // 🔥 Channel ID (your provided one)
    const CHANNEL_ID = "UCrjJP_SHUeCmqpTSHJCXkdA";

    try {
      // 📺 Get uploads playlist
      const channelRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
      );

      const channelData = await channelRes.json();

      const uploads =
        channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

      if (!uploads) {
        return json({ error: "Channel not found" }, 404);
      }

      // 📺 Get videos
      const videosRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploads}&maxResults=20&key=${API_KEY}`
      );

      const videosData = await videosRes.json();

      const videos = (videosData.items || []).map((item) => ({
        title: item.snippet.title,
        videoId: item.snippet.resourceId.videoId,
        thumbnail: item.snippet.thumbnails?.medium?.url
      }));

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