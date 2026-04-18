const API = "https://yt-studio-api.ruhdevopsytstudio.workers.dev";

let videos = [];
let current = 0;

/* LOAD */
async function load() {
  const res = await fetch(API);
  const data = await res.json();

  videos = data.videos || [];

  if (!videos.length) return;

  setHero(videos[0]);
  render(videos);
}

/* HERO */
function setHero(v) {
  const hero = document.getElementById("hero");

  hero.style.background =
    `linear-gradient(to top, black, transparent),
     url(https://i.ytimg.com/vi/${v.videoId}/maxresdefault.jpg) center/cover`;

  document.getElementById("hero-title").textContent = v.title;

  document.getElementById("hero-btn").onclick = () => open(v);
}

/* RENDER */
function render(list) {
  const row = document.getElementById("video-row");
  row.innerHTML = "";

  list.forEach((v, i) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg">
    `;

    card.onclick = () => open(v);

    row.appendChild(card);
  });
}

HEAD
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

/* OPEN MODAL */
 a34406d (Premium UI upgrade: hero cinematic + smooth cards + clean OTT layout)
function open(v) {
  current = videos.indexOf(v);

  const modal = document.getElementById("modal");
  const player = document.getElementById("player");

  modal.style.display = "block";

  player.src =
    `https://www.youtube.com/embed/${v.videoId}?autoplay=1&origin=https://ruhdevops.github.io`;

  document.getElementById("title").textContent = v.title;
}

 HEAD
/* ❌ CLOSE */
const closeModal = () => {

/* CLOSE */
document.getElementById("close").onclick = () => {
>>>>>>> a34406d (Premium UI upgrade: hero cinematic + smooth cards + clean OTT layout)
  document.getElementById("modal").style.display = "none";
  document.getElementById("player").src = "";
};

 HEAD
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

/* NEXT */
>>>>>>> a34406d (Premium UI upgrade: hero cinematic + smooth cards + clean OTT layout)
document.getElementById("next").onclick = () => {
  if (current < videos.length - 1) {
    open(videos[current + 1]);
  }
};

load();