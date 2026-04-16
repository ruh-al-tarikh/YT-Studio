export default {
  async fetch(request, env) {
    try {
      const API_KEY = env.YOUTUBE_API_KEY;

      const CHANNEL_HANDLE = "Ruh-Al-Tarikh";

      // STEP 1: Get channel
      const channelRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${CHANNEL_HANDLE}&key=${API_KEY}`
      );

      const channelData = await channelRes.json();

      const uploads =
        channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

      if (!uploads) {
        return json({ error: "Channel not found" }, 404);
      }

      // STEP 2: Get videos
      const videosRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploads}&maxResults=20&key=${API_KEY}`
      );

      const videosData = await videosRes.json();

      const videos = (videosData.items || []).map(item => ({
        title: item.snippet.title,
        videoId: item.snippet.resourceId.videoId,
        thumbnail: item.snippet.thumbnails?.high?.url
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