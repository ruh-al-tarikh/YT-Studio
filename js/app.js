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

    allVideos = data.items || [];

    renderVideos(allVideos);

  } catch (err) {
    console.error(err);
    grid.innerHTML = "<p>Failed to load videos</p>";
  }
}

/**
 * Render videos
 */
function renderVideos(videos) {
  grid.innerHTML = "";

  videos.forEach((item) => {
    const snippet = item.snippet;
    const videoId = snippet.resourceId.videoId;
    const title = snippet.title;
    const thumbnail = snippet.thumbnails.medium.url;

    const card = document.createElement("div");
    card.className = "card";

    // Optional: Season tagging via title keywords
    let seasonTag = "all";
    if (title.toLowerCase().includes("season 1")) seasonTag = "season1";
    if (title.toLowerCase().includes("season 2")) seasonTag = "season2";

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
document.querySelectorAll(".season-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".season-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const season = btn.dataset.season;

    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
      if (season === "all") {
        card.style.display = "block";
      } else {
        card.style.display =
          card.dataset.season === season ? "block" : "none";
      }
    });
  });
});

/**
 * INIT
 */
loadVideos();