<<<<<<< HEAD
const WORKER_URL =
  "https://old-sound-f9da.yt-studio-ruhaltarikh.workers.dev";
=======
@'
const WORKER_URL = "https://old-sound-f9da.yt-studio-ruhaltarikh.workers.dev";
>>>>>>> 0bcfeb7 (Fix full YouTube integration and resolve video loading issue)

const grid = document.getElementById("video-grid");

let allVideos = [];

/**
<<<<<<< HEAD
 * 🎬 Parse season + episode safely
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
 * 🔥 Featured banner
 */
function setFeatured(video) {
  const banner = document.getElementById("featured-banner");
  const title = document.getElementById("featured-title");
  const meta = document.getElementById("featured-meta");
  const btn = document.getElementById("play-btn");

  banner.style.backgroundImage = `url(${video.thumbnail})`;

  title.textContent = video.title;
  meta.textContent = `Season ${video.season} • Episode ${video.episode}`;

  btn.onclick = () => {
    window.open(
      `https://www.youtube.com/watch?v=${video.videoId}`,
      "_blank"
    );
  };
}

/**
 * 📺 Load videos
 */
async function loadVideos() {
  try {
    grid.innerHTML = "<p>Loading...</p>";
=======
 * Load videos
 */
async function loadVideos() {
  try {
    grid.innerHTML = "<p class='loading'>🎬 Loading episodes...</p>";
>>>>>>> 0bcfeb7 (Fix full YouTube integration and resolve video loading issue)

    const res = await fetch(WORKER_URL);
    const data = await res.json();

<<<<<<< HEAD
    if (!res.ok || !data.videos) {
      throw new Error("API failed");
    }

    allVideos = (data.videos || [])
      .map((v) => ({ ...v, ...parseMeta(v.title) }))
      .sort(
        (a, b) =>
          a.season - b.season ||
          a.episode - b.episode
      );
=======
    console.log("API RESPONSE:", data);

    allVideos = data.videos || [];

    if (!Array.isArray(allVideos) || allVideos.length === 0) {
      grid.innerHTML = "<p>No videos found</p>";
      return;
    }

    render(allVideos);
>>>>>>> 0bcfeb7 (Fix full YouTube integration and resolve video loading issue)

    if (!allVideos.length) {
      grid.innerHTML = "<p>No videos found</p>";
      return;
    }

    // 🎬 Featured = latest episode
    setFeatured(allVideos[allVideos.length - 1]);

    render(allVideos);
  } catch (e) {
    grid.innerHTML = "<p>Failed to load videos</p>";
  }
}

/**
 * 🎥 Render grid (optimized - no iframe spam)
 */
<<<<<<< HEAD
function render(list) {
  grid.innerHTML = "";

  list.forEach((v) => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = v.thumbnail;
    img.alt = v.title;

    const h3 = document.createElement("h3");
    h3.textContent = `S${v.season} • E${v.episode}`;

    const p = document.createElement("p");
    p.textContent = v.title;

    const btn = document.createElement("button");
    btn.textContent = "▶ Watch";
    btn.onclick = () =>
      window.open(
        `https://www.youtube.com/watch?v=${v.videoId}`,
        "_blank"
      );

    card.appendChild(img);
    card.appendChild(h3);
    card.appendChild(p);
    card.appendChild(btn);
=======
function render(videos) {
  grid.innerHTML = "";

  videos.forEach(v => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${v.thumbnail}" style="width:100%; border-radius:10px;">
      <h3>${v.title}</h3>
      <iframe
        width="100%"
        height="200"
        src="https://www.youtube.com/embed/${v.videoId}"
        frameborder="0"
        allowfullscreen>
      </iframe>
    `;
>>>>>>> 0bcfeb7 (Fix full YouTube integration and resolve video loading issue)

    grid.appendChild(card);
  });
}

/**
<<<<<<< HEAD
 * 🎛 Filter system
 */
function initFilters() {
  document.querySelectorAll(".season-btn").forEach((btn) => {
    btn.onclick = () => {
      document
        .querySelectorAll(".season-btn")
        .forEach((b) => b.classList.remove("active"));

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
 * 🚀 INIT
 */
loadVideos();
initFilters();
=======
 * INIT
 */
loadVideos();
'@ | Set-Content -Encoding UTF8 js\app.js
>>>>>>> 0bcfeb7 (Fix full YouTube integration and resolve video loading issue)
