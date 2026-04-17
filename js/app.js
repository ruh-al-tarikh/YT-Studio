const WORKER_URL = "https://yt-studio-api.ruhdevopsytstudio.workers.dev";

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

/* 🎥 MODAL */
function openModal(index) {
  currentIndex = index;

  const v = allVideos[index];

  document.getElementById("video-modal").style.display = "block";
  document.getElementById("modal-player").src =
    `https://www.youtube.com/embed/${v.videoId}?autoplay=1`;

  document.getElementById("episode-title").textContent = v.title;
  document.getElementById("episode-meta").textContent =
    `Season ${v.season} • Episode ${v.episode}`;

  localStorage.setItem("lastWatched", index);
  renderContinue();
}

/* NEXT */
document.getElementById("next-btn").onclick = () => {
  if (currentIndex < allVideos.length - 1) {
    openModal(currentIndex + 1);
  }
};

/* CLOSE */
document.getElementById("close-modal").onclick = () => {
  document.getElementById("video-modal").style.display = "none";
  document.getElementById("modal-player").src = "";
};

/* 📺 CREATE CARD */
function createCard(v, index) {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <img src="${v.thumbnail}">
    <h3>S${v.season} • E${v.episode}</h3>
    <p>${v.title}</p>
  `;

  card.onclick = () => openModal(index);

  return card;
}

/* 📺 ROW RENDER */
function renderRow(id, videos) {
  const container = document.getElementById(id);
  if (!container) return;

  container.innerHTML = "";
  videos.forEach(v => {
    const index = allVideos.findIndex(x => x.videoId === v.videoId);
    container.appendChild(createCard(v, index));
  });
}

/* 📺 CONTINUE */
function renderContinue() {
  const last = localStorage.getItem("lastWatched");
  if (!last) return;

  const v = allVideos[last];

  const row = document.getElementById("continue-row");
  const section = document.getElementById("continue-section");

  section.style.display = "block";
  row.innerHTML = "";

  row.appendChild(createCard(v, last));
}

/* 📺 LOAD */
async function loadVideos() {
  try {
    const res = await fetch(WORKER_URL);
    const data = await res.json();

    allVideos = data.videos.map(v => ({
      ...v,
      ...parseMeta(v.title)
    }));

    if (!allVideos.length) return;

    setFeatured(allVideos[0]);

    /* 🔥 TRENDING (first 6) */
    renderRow("trending-row", allVideos.slice(0, 6));

    /* 🆕 LATEST */
    renderRow("latest-row", [...allVideos].reverse().slice(0, 6));

    /* 📺 SEASON GROUP */
    renderRow("season1-row", allVideos.filter(v => v.season === 1));
    renderRow("season2-row", allVideos.filter(v => v.season === 2));

    renderContinue();

  } catch {
    console.error("Failed to load");
  }
}

loadVideos();