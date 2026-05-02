export interface Env {
  MY_DB: D1Database;
}

export interface Video {
  videoId: string;
  title: string;
  thumbnail: string;
  publishedAt?: string;
  description?: string;
}

const videos: Video[] = [
  {
    videoId: "Zzcdtm7Il9U",
    title: "துல்கர்னய்னின் சுவர் பற்றிய உண்மை (இறுதிக்காலத்தின் அடையாளம்)",
    thumbnail: "https://i.ytimg.com/vi/Zzcdtm7Il9U/mqdefault.jpg",
    publishedAt: "2024-01-15T00:00:00Z",
    description: "Exploring the truth about Dhul-Qarnayn's wall"
  },
  {
    videoId: "4QI291kZ4K4",
    title: "இறந்த கடல் [சவக்கடல்] சுருள்கள்: பைபிள் மற்றும் இஸ்லாம் பற்றிய மறைக்கப்பட்ட உண்மை!",
    thumbnail: "https://i.ytimg.com/vi/4QI291kZ4K4/mqdefault.jpg",
    publishedAt: "2024-01-20T00:00:00Z",
    description: "Dead Sea Scrolls: Hidden truths about Bible and Islam"
  },
  {
    videoId: "Zf_2icharEY",
    title: "கித்ர் அலைஹிஸலாம் இன்னும் உயிருடன் இருக்கிறாரா? கியாமத் வரை தொடரும் மர்மம்!",
    thumbnail: "https://i.ytimg.com/vi/Zf_2icharEY/mqdefault.jpg",
    publishedAt: "2024-01-25T00:00:00Z",
    description: "Is Khidr (AS) still alive? Mystery until Qiyamah"
  },
  {
    videoId: "C_-JF7p1_Dw",
    title: "மஸ்ஜிதுல்-அக்ஸா: வரலாறு, ஈமான் மற்றும் அதிகரித்து வரும் ஆபத்து!",
    thumbnail: "https://i.ytimg.com/vi/C_-JF7p1_Dw/mqdefault.jpg",
    publishedAt: "2024-02-01T00:00:00Z",
    description: "Masjid Al-Aqsa: History, faith, and growing danger"
  }
];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }
    
    // Handle video API endpoint
    if (url.pathname === "/videos" || url.pathname === "/") {
      return new Response(JSON.stringify({ videos }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
    
    // 404 for other routes
    return new Response("Not Found", { status: 404 });
  },
};
