const WORKER_URL = "https://ruhaltarikh-api.workers.dev";

const grid = document.getElementById("video-grid");

let allVideos = [];

/**
 * Load videos from Worker
 */
async function loadVideos() {
  try {
    grid.innerHTML = "<p class='loading'>🎬 Loading cinematic episodes...</p>";

    const res = await fetch(WORKER_URL);
    const data = await res.json();

    // ✅ FIX: assign properly
    allVideos = data.videos || [];

    if (allVideos.length === 0) {
      grid.innerHTML = "<p>No episodes found</p>";
      return;
    }

    renderVideos(allVideos);

  } catch (err) {
    console.error("Load error:", err);
    grid.innerHTML = "<p>Failed to load videos</p>";
  }
}

/**
 * Render videos
 */
function renderVideos(videos) {
  grid.innerHTML = "";

  videos.forEach((item) => {
    const videoId = item.videoId;
    const title = item.title;
    const thumbnail = item.thumbnail;

    const card = document.createElement("div");
    card.className = "card";

    // 🎬 Auto Season Detection
    let seasonTag = "all";
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes("season 1")) seasonTag = "season1";
    else if (lowerTitle.includes("season 2")) seasonTag = "season2";

    card.dataset.season = seasonTag;

    card.innerHTML = `
      <img src="${thumbnail}" style="width:100%; border-radius:10px;">
      <h3>${title}</h3>
      <iframe
        width="100%"
        height="200"
        src="https://www.youtube.com/embed/${videoId}"
        frameborder="0"
        allowfullscreen>
      </iframe>
    `;

    grid.appendChild(card);
  });
}

/**
 * Season filter system
 */
function initSeasonFilter() {
  const buttons = document.querySelectorAll(".season-btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {

      // Active button UI
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const season = btn.dataset.season;

      const filtered =
        season === "all"
          ? allVideos
          : allVideos.filter(v =>
              v.title.toLowerCase().includes(season.replace("season", "season "))
            );

      renderVideos(filtered);
    });
  });
}

/**
 * INIT
 */
loadVideos();
initSeasonFilter();