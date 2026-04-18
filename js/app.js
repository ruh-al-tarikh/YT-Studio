const API = "https://yt-studio-api.ruhdevopsytstudio.workers.dev";

let videos = [];
let current = null;

/* STORAGE KEYS */
const STORAGE_KEY = "watch_progress";

/* LOAD PROGRESS */
function getProgress() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
}

function saveProgress(id, time) {
  const data = getProgress();
  data[id] = time;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* LOAD */
async function init() {
  const res = await fetch(API);
  const data = await res.json();

  videos = data.videos || [];

  if (!videos.length) return;

  setHero(videos[0]);
  render();
  renderContinue();
}

/* HERO */
function setHero(v) {
  document.getElementById("hero-title").textContent = v.title;

  document.getElementById("bg").style.backgroundImage =
    `url(https://i.ytimg.com/vi/${v.videoId}/maxresdefault.jpg)`;

  document.querySelector(".hero").style.background =
    `linear-gradient(to top, black, transparent),
     url(https://i.ytimg.com/vi/${v.videoId}/maxresdefault.jpg) center/cover`;

  document.getElementById("hero-btn").onclick = () => open(v);
}

/* CONTINUE WATCHING */
function renderContinue() {
  const row = document.getElementById("continue-row");
  const progress = getProgress();

  row.innerHTML = "";

  Object.keys(progress).forEach(id => {
    const v = videos.find(x => x.videoId === id);
    if (!v) return;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg">
      <div class="progress" style="width:${progress[id].percent || 0}%"></div>
    `;

    card.onclick = () => open(v, progress[id].time || 0);

    row.appendChild(card);
  });
}

/* GRID */
function render() {
  const grid = document.getElementById("grid");
  const preview = document.getElementById("hover-preview");

  grid.innerHTML = "";

  videos.forEach(v => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg">
    `;

    card.onmouseenter = () => {
      preview.style.display = "block";
      preview.src =
        `https://www.youtube.com/embed/${v.videoId}?autoplay=1&mute=1&controls=0`;
    };

    card.onmousemove = (e) => {
      preview.style.top = e.clientY + 15 + "px";
      preview.style.left = e.clientX + 15 + "px";
    };

    card.onmouseleave = () => {
      preview.style.display = "none";
      preview.src = "";
    };

    card.onclick = () => open(v);

    grid.appendChild(card);
  });
}

/* MODAL */
function open(v, startTime = 0) {
  current = v;

  const modal = document.getElementById("modal");
  const player = document.getElementById("player");

  modal.style.display = "block";

  player.src =
    `https://www.youtube.com/embed/${v.videoId}?autoplay=1&start=${startTime}`;

  document.getElementById("video-title").textContent = v.title;

  trackProgress(v.videoId, player);
}

/* PROGRESS TRACKING */
function trackProgress(id, player) {
  let lastTime = 0;

  const interval = setInterval(() => {
    try {
      const time = player.contentWindow?.getCurrentTime?.() || 0;
      const duration = player.contentWindow?.getDuration?.() || 1;

      if (time > 0) {
        saveProgress(id, {
          time: Math.floor(time),
          percent: Math.floor((time / duration) * 100)
        });
      }

      lastTime = time;
    } catch (e) {}
  }, 5000);

  player.onunload = () => clearInterval(interval);
}

/* CLOSE */
document.getElementById("close").onclick = () => {
  document.getElementById("modal").style.display = "none";
  document.getElementById("player").src = "";
  renderContinue();
};

init();