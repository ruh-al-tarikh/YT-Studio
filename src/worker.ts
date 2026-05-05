export interface Env {
  MY_DB?: D1Database;
  YOUTUBE_API_KEY?: string;
  NODE_ENV?: string;
  API_URL?: string;
}

const MOCK_VIDEOS = [
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
  {
    id: "B-K08v-qCmo",
    title: "The Rise of the Abbasid Caliphate",
    thumbnail: "https://i.ytimg.com/vi/B-K08v-qCmo/mqdefault.jpg",
    publishedAt: "2024-01-05T12:00:00Z",
    channel: "Ruh Al Tarikh",
  },
  {
    id: "qMTCWHz7e8Q",
    title: "Prophecies of the End Times: An In-depth Study",
    thumbnail: "https://i.ytimg.com/vi/qMTCWHz7e8Q/mqdefault.jpg",
    publishedAt: "2023-12-28T16:45:00Z",
    channel: "Ruh Al Tarikh",
  },
  {
    id: "vS6mH_V_r9I",
    title: "Discussion: Science and Religion in Islam",
    thumbnail: "https://i.ytimg.com/vi/vS6mH_V_r9I/mqdefault.jpg",
    publishedAt: "2023-12-20T11:30:00Z",
    channel: "Ruh Al Tarikh",
  },
  {
    id: "7_6_m8D5_lA",
    title: "The Golden Age of Islamic Science",
    thumbnail: "https://i.ytimg.com/vi/7_6_m8D5_lA/mqdefault.jpg",
    publishedAt: "2023-12-15T09:00:00Z",
    channel: "Ruh Al Tarikh",
  },
  {
    id: "X_8z-mG6R9I",
    title: "Understanding the Five Pillars of Islam",
    thumbnail: "https://i.ytimg.com/vi/X_8z-mG6R9I/mqdefault.jpg",
    publishedAt: "2023-12-10T14:00:00Z",
    channel: "Ruh Al Tarikh",
  },
  {
    id: "Y_9z-mH7S1J",
    title: "The Conquest of Constantinople",
    thumbnail: "https://i.ytimg.com/vi/Y_9z-mH7S1J/mqdefault.jpg",
    publishedAt: "2023-12-05T10:20:00Z",
    channel: "Ruh Al Tarikh",
  },
  {
    id: "Z_0a-nI8T2K",
    title: "Signs of the Hour in Islamic Tradition",
    thumbnail: "https://i.ytimg.com/vi/Z_0a-nI8T2K/mqdefault.jpg",
    publishedAt: "2023-11-30T15:10:00Z",
    channel: "Ruh Al Tarikh",
  }
];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const respondJSON = (data: any, status = 200, extraHeaders = {}) => {
      return new Response(JSON.stringify(data), {
        status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          ...extraHeaders
        }
      });
    };

    if (url.pathname === "/api/youtube/videos" || url.pathname === "/api/videos") {
      const channelId = url.searchParams.get("channelId") || "UCrjJP_SHUeCmqpTSHJCXkdA";
      const apiKey = env.YOUTUBE_API_KEY;

      if (!apiKey) {
        console.warn("[Worker] No API key, returning demo videos");
        return respondJSON({ success: true, isDemo: true, videos: MOCK_VIDEOS }, 200, { "Cache-Control": "public, max-age=600" });
      }

      try {
        // 1. Get the uploads playlist ID
        const channelRes = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
        );

        if (!channelRes.ok) {
           const err = await channelRes.json() as any;
           throw new Error(err.error?.message || "Failed to fetch channel details");
        }

        const channelData = await channelRes.json() as any;
        if (!channelData.items || channelData.items.length === 0) {
          throw new Error("Channel not found");
        }

        const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

        // 2. Get the videos from the uploads playlist
        const playlistRes = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsPlaylistId}&key=${apiKey}`
        );

        if (!playlistRes.ok) {
          const err = await playlistRes.json() as any;
          throw new Error(err.error?.message || "Failed to fetch playlist items");
        }

        const playlistData = await playlistRes.json() as any;
        const videos = (playlistData.items || []).map((item: any) => ({
          id: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
          publishedAt: item.snippet.publishedAt,
          channel: item.snippet.channelTitle,
          description: item.snippet.description
        }));

        return respondJSON({ success: true, isDemo: false, videos }, 200, { "Cache-Control": "public, max-age=600" });

      } catch (err: any) {
        console.error("[Worker] YouTube API Error:", err.message);
        return respondJSON({
          success: true,
          isDemo: true,
          videos: MOCK_VIDEOS,
          error: err.message
        }, 200, { "Cache-Control": "public, max-age=600" });
      }
    }

    if (url.pathname === "/api/youtube/channel") {
        const channelId = url.searchParams.get("id");
        const apiKey = env.YOUTUBE_API_KEY;
        if (channelId && apiKey) {
            try {
                const ytUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${encodeURIComponent(channelId)}&key=${apiKey}`;
                const res = await fetch(ytUrl);
                if (res.ok) {
                    const data = (await res.json()) as any;
                    if (data.items && data.items.length > 0) {
                        const channel = data.items[0];
                        return respondJSON({
                            success: true,
                            data: {
                                title: channel.snippet.title,
                                description: channel.snippet.description,
                                customUrl: channel.snippet.customUrl,
                                avatar: channel.snippet.thumbnails.medium?.url || channel.snippet.thumbnails.default?.url,
                                subscribers: channel.statistics.subscriberCount,
                                videoCount: channel.statistics.videoCount,
                                viewCount: channel.statistics.viewCount
                            }
                        }, 200, { "Cache-Control": "public, max-age=600" });
                    }
                    return respondJSON({ success: false, error: "Channel not found" }, 404);
                }
            } catch (err) {
                return respondJSON({ success: false, error: String(err) }, 500);
            }
        }
        return respondJSON({ success: false, error: "Missing ID or API Key" }, 400);
    }

    if (url.pathname === "/api/youtube") {
      const videoId = url.searchParams.get("id");
      const apiKey = env.YOUTUBE_API_KEY;
      if (videoId && apiKey) {
        try {
          const ytUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${encodeURIComponent(videoId)}&key=${apiKey}`;
          const res = await fetch(ytUrl);
          if (res.ok) {
            const data = (await res.json()) as any;
            return respondJSON({ success: true, videoId, data }, 200, { "Cache-Control": "public, max-age=600" });
          }
        } catch (err) {
          return respondJSON({ success: false, error: String(err) }, 500);
        }
      }
      return respondJSON({ success: false, error: "Missing ID or API Key" }, 400);
    }

    if (url.pathname === "/api/orders") {
      if (!env.MY_DB) return respondJSON({ success: false, error: "D1 not bound" }, 503);
      try {
        const { results } = await env.MY_DB.prepare("SELECT * FROM Orders").all();
        return respondJSON({ success: true, count: results.length, data: results });
      } catch (err) {
        return respondJSON({ success: false, error: String(err) }, 500);
      }
    }

    if (url.pathname === "/debug") {
      return respondJSON({
        environment: env.NODE_ENV || "production",
        bindings: { youtube_key: !!env.YOUTUBE_API_KEY, d1: !!env.MY_DB },
        timestamp: new Date().toISOString()
      });
    }

    if (url.pathname === "/health") {
      return respondJSON({ status: "ok", time: new Date().toISOString() });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};
