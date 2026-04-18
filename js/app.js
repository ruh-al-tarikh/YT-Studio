const API = "https://yt-studio-api.ruhdevopsytstudio.workers.dev";

let videos = [];

/* LOAD */
async function init() {
  try {
    const res = await fetch(API);

    if (!res.ok) throw new Error("API failed");

    const data = await res.json();
    videos = data.videos || [];

    if (!videos.length) {
      document.getElementById("hero-title").textContent = "No videos found";
      return;
    }

    setupHero(videos[0]);
    render(videos);

  } catch (err) {
    console.error(err);
    document.getElementById("hero-title").textContent = "Failed to load videos";
  }
}

/* HERO */
function setupHero(v) {
  const hero = document.getElementById("hero");

  hero.style.background =
    `linear-gradient(to top, black, transparent),
     url(https://i.ytimg.com/vi/${v.videoId}/maxresdefault.jpg) center/cover`;

  document.getElementById("hero-title").textContent = v.title;

  document.getElementById("hero-btn").onclick = () => open(v);

  document.getElementById("bg").style.backgroundImage =
    `url(https://i.ytimg.com/vi/${v.videoId}/maxresdefault.jpg)`;
}

/* GRID */
function render(list) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  list.forEach(v => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`;

    card.appendChild(img);

    // SAFE HOVER (no iframe)
    card.onmouseenter = () => {
      document.getElementById("bg").style.backgroundImage =
        `url(https://i.ytimg.com/vi/${v.videoId}/maxresdefault.jpg)`;
    };

    card.onclick = () => open(v);

    grid.appendChild(card);
  });
}

/* MODAL */
function open(v) {
  const modal = document.getElementById("modal");
  const player = document.getElementById("player");

  modal.style.display = "block";

  player.src = ""; // reset first

  setTimeout(() => {
    player.src =
      `https://www.youtube.com/embed/${v.videoId}?autoplay=1&origin=https://ruhdevops.github.io`;
  }, 100);

  document.getElementById("video-title").textContent = v.title;
}

/* CLOSE */
document.getElementById("close").onclick = () => {
  document.getElementById("modal").style.display = "none";
  document.getElementById("player").src = "";
};

/* INIT */
init();