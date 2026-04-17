const WORKER_URL = "https://yt-studio-api.ruhdevopsytstudio.workers.dev";

const grid = document.getElementById("video-grid");

let allVideos = [];

async function loadVideos() {
  try {
    grid.innerHTML = "<p style='text-align:center;'>🎬 Loading episodes...</p>";

    const res = await fetch(WORKER_URL);

    if (!res.ok) {
      throw new Error("Worker not responding");
    }

    const data = await res.json();

    console.log("API DATA:", data); // 🔍 DEBUG

    if (!data || !Array.isArray(data.videos)) {
      throw new Error("Invalid API structure");
    }

    allVideos = data.videos;

    if (allVideos.length === 0) {
      grid.innerHTML = "<p>No videos found</p>";
      return;
    }

    render(allVideos);

  } catch (err) {
    console.error("ERROR:", err);
    grid.innerHTML = "<p style='color:red;'>❌ Failed to load videos</p>";
  }
}

function render(videos) {
  grid.innerHTML = "";

  videos.forEach((v) => {
    if (!v.videoId || !v.thumbnail) return;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${v.thumbnail}" alt="${v.title}" style="width:100%; border-radius:10px;">
      <h3 style="font-size:14px;">${v.title}</h3>
    `;

    card.addEventListener("click", () => {
      window.open(`https://www.youtube.com/watch?v=${v.videoId}`, "_blank");
    });

    grid.appendChild(card);
  });
}

loadVideos();