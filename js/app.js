const WORKER_URL = "https://yt-studio-api.ruhdevopsytstudio.workers.dev";

const grid = document.getElementById("video-grid");

const modal = document.getElementById("video-modal");
const player = document.getElementById("modal-player");
const closeBtn = document.getElementById("close-modal");

const titleEl = document.getElementById("episode-title");
const nextBtn = document.getElementById("next-btn");

let allVideos = [];
let currentIndex = 0;

/* 🎬 HERO */
function setFeatured(video) {
  const section = document.getElementById("featured");
  const title = document.getElementById("featured-title");
  const btn = document.getElementById("featured-btn");

  section.style.display = "block";
  section.style.backgroundImage = `url(${video.thumbnail})`;
  title.textContent = video.title;

  btn.onclick = () => openModal(0);
}

/* 🎥 OPEN MODAL */
function openModal(index) {
  currentIndex = index;

  const video = allVideos[index];

  modal.style.display = "block";
  player.src = `https://www.youtube.com/embed/${video.videoId}?autoplay=1`;

  titleEl.textContent = video.title;
}

/* ⏭ NEXT EPISODE */
nextBtn.onclick = () => {
  if (currentIndex < allVideos.length - 1) {
    openModal(currentIndex + 1);
  }
};

/* ❌ CLOSE */
closeBtn.onclick = () => {
  modal.style.display = "none";
  player.src = "";
};

window.onclick = (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    player.src = "";
  }
};

/* 📺 LOAD */
async function loadVideos() {
  try {
    grid.innerHTML = "Loading...";

    const res = await fetch(WORKER_URL);
    const data = await res.json();

    if (!data.videos || !data.videos.length) {
      grid.innerHTML = "No videos found";
      return;
    }

    allVideos = data.videos;

    setFeatured(allVideos[0]);
    render(allVideos);

  } catch (err) {
    grid.innerHTML = "Failed to load videos";
  }
}

/* 🎥 RENDER */
function render(videos) {
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

loadVideos();