const API = "https://yt-studio-api.ruhdevopsytstudio.workers.dev";

let videos = [];
let current = 0;

/* 🚀 LOAD */
async function load() {
  const res = await fetch(API);
  const data = await res.json();

  videos = data.videos || [];

  if (!videos.length) return;

  setupHero(videos[0]);
  renderRows();
}

function setupHero(v) {
  document.getElementById("hero-title").textContent = v.title;

  const heroVideo = document.getElementById("hero-video");

  // 🎬 autoplay muted preview
  heroVideo.src =
    `https://www.youtube.com/embed/${v.videoId}` +
    `?autoplay=1&mute=1&controls=0&loop=1&playlist=${v.videoId}&rel=0`;

  document.getElementById("hero-btn").onclick = () => open(videos[0]);
}

/* 📺 ROWS */
function renderRows() {
  const trending = document.getElementById("row-trending");
  const latest = document.getElementById("row-latest");

  trending.innerHTML = "";
  latest.innerHTML = "";

  videos.slice(0, 10).forEach((v, i) => {
    const card = createCard(v, i);
    trending.appendChild(card);
  });

  videos.slice().reverse().slice(0, 10).forEach((v, i) => {
    const card = createCard(v, i);
    latest.appendChild(card);
  });
}

/* 🎬 CARD */
function createCard(v, i) {
  const div = document.createElement("div");
  div.className = "card";
  div.setAttribute("role", "button");
  div.setAttribute("tabindex", "0");
  div.setAttribute("aria-label", `Play ${v.title}`);

  div.innerHTML = `
    <img src="https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg" alt="">
  `;

  div.onmouseenter = () => hoverPreview(div, v.videoId);
  div.onclick = () => open(v);
  div.onkeydown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open(v);
    }
  };

  return div;
}

/* 🎥 HOVER PREVIEW */
function hoverPreview(el, id) {
  el.innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0"
      frameborder="0">
    </iframe>
  `;
}

/* 🎬 MODAL */
function open(v) {
  current = videos.indexOf(v);

  const modal = document.getElementById("modal");
  const player = document.getElementById("player");

  modal.style.display = "block";

  player.src =
    `https://www.youtube.com/embed/${v.videoId}?autoplay=1&rel=0`;

  document.getElementById("title").textContent = v.title;
  document.getElementById("meta").textContent = "Now Playing";
}

/* ❌ CLOSE */
const closeModal = () => {
  document.getElementById("modal").style.display = "none";
  document.getElementById("player").src = "";
};

document.getElementById("close").onclick = closeModal;
document.getElementById("close").onkeydown = (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    closeModal();
  }
};

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
  }
});

/* ⏭ NEXT */
document.getElementById("next").onclick = () => {
  if (current < videos.length - 1) {
    open(videos[current + 1]);
  }
};

load();