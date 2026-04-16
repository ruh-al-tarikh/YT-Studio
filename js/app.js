const WORKER_URL = "https://yt-studio-api.<your-subdomain>.workers.dev";

const grid = document.getElementById("video-grid");

async function loadVideos() {
  try {
    grid.innerHTML = "<p>Loading...</p>";

    const res = await fetch(WORKER_URL);
    const data = await res.json();

    if (!data.videos) {
      throw new Error("Invalid API response");
    }

    render(data.videos);

  } catch (err) {
    console.error(err);
    grid.innerHTML = "<p>Failed to load videos</p>";
  }
}

function render(videos) {
  grid.innerHTML = "";

  videos.forEach(v => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${v.thumbnail}">
      <h3>${v.title}</h3>
      <iframe src="https://www.youtube.com/embed/${v.videoId}" allowfullscreen></iframe>
    `;

    grid.appendChild(card);
  });
}

loadVideos();