const WORKER_URL = "https://yt-studio-api.ruhdevopsytstudio.workers.dev";

let allVideos = [];
let currentIndex = 0;

async function loadVideos() {
  const grid = document.getElementById("video-grid");

  grid.innerHTML = "Loading...";

  const res = await fetch(WORKER_URL);
  const data = await res.json();

  allVideos = data.videos || [];

  render(allVideos);
}

function render(videos) {
  const grid = document.getElementById("video-grid");
  grid.innerHTML = "";

  videos.forEach((v, i) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${v.thumbnail}">
      <h3>${v.title}</h3>
    `;

    card.onclick = () => openModal(i);

    grid.appendChild(card);
  });
}

function openModal(index) {
  currentIndex = index;

  const video = allVideos[index];
  const modal = document.getElementById("video-modal");
  const player = document.getElementById("modal-player");

  modal.style.display = "block";

  // ✅ FIXED EMBED (WORKS ON GITHUB PAGES)
  player.src =
    `https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&origin=https://ruhdevops.github.io`;

  document.getElementById("episode-title").textContent = video.title;
  document.getElementById("episode-meta").textContent = "Now Playing";
}

document.getElementById("close-modal").onclick = () => {
  document.getElementById("video-modal").style.display = "none";
  document.getElementById("modal-player").src = "";
};

document.getElementById("next-btn").onclick = () => {
  if (currentIndex < allVideos.length - 1) {
    openModal(currentIndex + 1);
  }
};

loadVideos();