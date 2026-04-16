const WORKER_URL = "https://old-sound-f9da.yt-studio-ruhaltarikh.workers.dev";
const grid = document.getElementById("video-grid");

let allVideos = [];

/**
 * 🎬 Parse season + episode safely from title
 */
function parseMeta(title) {
  const t = title.toLowerCase();
  let season = 1;
  let episode = 0;

  const s = t.match(/season\s*(\d+)/);
  const e = t.match(/(?:ep|episode)\s*(\d+)/);

  if (s) season = Number(s[1]);
  if (e) episode = Number(e[1]);

  return { season, episode };
}

/**
 * 🔥 Update Featured banner with the latest video
 */
function setFeatured(video) {
  const banner = document.getElementById("featured-banner");
  const title = document.getElementById("featured-title");
  const meta = document.getElementById("featured-meta");
  const btn = document.getElementById("play-btn");

  if (!banner || !title || !meta || !btn) return;

  banner.style.backgroundImage = `url(${video.thumbnail})`;
  title.textContent = video.title;
  meta.textContent = `Season ${video.season} • Episode ${video.episode}`;

  btn.onclick = () => {
    window.open(`https://www.youtube.com/watch?v=${video.videoId}`, "_blank");
  };
}

/**
 * 📺 Fetch and process videos
 */
async function loadVideos() {
  try {
    grid.innerHTML = "<p class='loading'>🎬 Loading episodes...</p>";

    const res = await fetch(WORKER_URL);
    const data = await res.json();

    if (!res.ok || !data.videos) {
      throw new Error("API failed");
    }

    // Process and sort videos by Season and Episode
    allVideos = data.videos
      .map((v) => ({ ...v, ...parseMeta(v.title) }))
      .sort((a, b) => a.season - b.season || a.episode - b.episode);

    if (allVideos.length === 0) {
      grid.innerHTML = "<p>No videos found</p>";
      return;
    }

    // Set featured video to the most recent one
    setFeatured(allVideos[allVideos.length - 1]);
    render(allVideos);

  } catch (e) {
    console.error("Error loading videos:", e);
    grid.innerHTML = "<p>Failed to load videos. Please try again later.</p>";
  }
}

/**
 * 🎥 Render grid (Optimized: Uses thumbnails instead of heavy iframes)
 */
function render(list) {
  grid.innerHTML = "";

  list.forEach((v) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${v.thumbnail}" alt="${v.title}" style="width:100%; border-radius:10px;">
      <div class="card-content">
        <h3>S${v.season} • E${v.episode}</h3>
        <p>${v.title}</p>
        <button class="watch-btn">▶ Watch</button>
      </div>
    `;

    card.querySelector(".watch-btn").onclick = () => {
      window.open(`https://www.youtube.com/watch?v=${v.videoId}`, "_blank");
    };

    grid.appendChild(card);
  });
}

/**
 * 🎛 Filter system for Season buttons
 */
function initFilters() {
  const buttons = document.querySelectorAll(".season-btn");
  buttons.forEach((btn) => {
    btn.onclick = () => {
      // Toggle active UI
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const s = btn.dataset.season;
      if (s === "all") {
        render(allVideos);
      } else {
        const num = Number(s.replace("season", ""));
        render(allVideos.filter((v) => v.season === num));
      }
    };
  });
}

/**
 * 🚀 Initialize
 */
loadVideos();
initFilters();
