const WORKER_URL = "https://yt-studio-api.ruhdevopsytstudio.workers.dev";

const grid = document.getElementById("video-grid");
const continueRow = document.getElementById("continue-row");
const continueSection = document.getElementById("continue-section");

const modal = document.getElementById("video-modal");
const player = document.getElementById("modal-player");
const closeBtn = document.getElementById("close-modal");

const titleEl = document.getElementById("episode-title");
const metaEl = document.getElementById("episode-meta");
const nextBtn = document.getElementById("next-btn");

let allVideos = [];
let currentIndex = 0;

/* 🎬 PARSE */
function parseMeta(title) {
  const t = title.toLowerCase();
  const s = t.match(/season\s*(\d+)/);
  const e = t.match(/(ep|episode)\s*(\d+)/);

  return {
    season: s ? Number(s[1]) : 1,
    episode: e ? Number(e[2]) : 0
  };
}

/* 🎬 FEATURED */
function setFeatured(video) {
  const section = document.getElementById("featured");
  const title = document.getElementById("featured-title");
  const btn = document.getElementById("featured-btn");

  section.style.display = "block";
  section.style.backgroundImage = `url(${video.thumbnail})`;
  title.textContent = video.title;

  btn.onclick = () => openModal(0);
}

/* 🎥 OPEN */
function openModal(index) {
  currentIndex = index;

  const v = allVideos[index];
  if (!v) return;

  player.src = `https://www.youtube.com/embed/${v.videoId}?autoplay=1`;
  modal.style.display = "block";

  titleEl.textContent = v.title;
  metaEl.textContent = `Season ${v.season} • Episode ${v.episode}`;

  // 💾 SAVE PROGRESS
  localStorage.setItem("lastWatched", index);
  renderContinue();
}

/* ⏭ NEXT */
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

/* 📺 CONTINUE ROW */
function renderContinue() {
  const last = localStorage.getItem("lastWatched");

  if (last === null) {
    continueSection.style.display = "none";
    return;
  }

  const index = Number(last);
  const v = allVideos[index];

  if (!v) return;

  continueSection.style.display = "block";
  continueRow.innerHTML = "";

  const card = document.createElement("div");
  card.className = "continue-card";

  card.innerHTML = `
    <img src="${v.thumbnail}">
    <h4>Continue: ${v.title}</h4>
  `;

  card.onclick = () => openModal(index);

  continueRow.appendChild(card);
}

/* 🎛 FILTER */
function initFilters() {
  document.querySelectorAll(".season-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".season-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const s = btn.dataset.season;

      if (s === "all") render(allVideos);
      else render(allVideos.filter(v => v.season == s));
    };
  });
}

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

    allVideos = data.videos.map(v => ({
      ...v,
      ...parseMeta(v.title)
    }));

    setFeatured(allVideos[0]);
    render(allVideos);
    renderContinue();
    initFilters();

  } catch {
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
      <h3>S${v.season} • E${v.episode}</h3>
      <p>${v.title}</p>
    `;

    card.onclick = () => openModal(i);

    grid.appendChild(card);
  });
}

loadVideos();