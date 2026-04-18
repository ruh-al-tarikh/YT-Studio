const API = "https://yt-studio-api.ruhdevopsytstudio.workers.dev";

let videos = [];

/* LOAD */
async function init() {
  const res = await fetch(API);
  const data = await res.json();

  videos = data.videos || [];

  if (!videos.length) return;

  setHero(videos[0]);
  render(videos);
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

/* GRID */
function render(list) {
  const grid = document.getElementById("grid");
  const preview = document.getElementById("hover-preview");

  grid.innerHTML = "";

  list.forEach(v => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg">
    `;

    /* 🎥 SMART HOVER PREVIEW */
    card.addEventListener("mouseenter", (e) => {
      preview.style.display = "block";
      preview.src =
        `https://www.youtube.com/embed/${v.videoId}?autoplay=1&mute=1&controls=0&rel=0`;

      document.getElementById("bg").style.backgroundImage =
        `url(https://i.ytimg.com/vi/${v.videoId}/maxresdefault.jpg)`;
    });

    card.addEventListener("mousemove", (e) => {
      preview.style.top = (e.clientY + 15) + "px";
      preview.style.left = (e.clientX + 15) + "px";
    });

    card.addEventListener("mouseleave", () => {
      preview.style.display = "none";
      preview.src = "";
    });

    card.onclick = () => open(v);

    grid.appendChild(card);
  });
}

/* MODAL */
function open(v) {
  const modal = document.getElementById("modal");
  const player = document.getElementById("player");

  modal.style.display = "block";

  player.src =
    `https://www.youtube.com/embed/${v.videoId}?autoplay=1&origin=https://ruhdevops.github.io`;

  document.getElementById("video-title").textContent = v.title;
}

/* CLOSE */
document.getElementById("close").onclick = () => {
  document.getElementById("modal").style.display = "none";
  document.getElementById("player").src = "";
};

init();