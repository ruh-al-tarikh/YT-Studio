// YT Studio Main Application
let ytPlayer;
let currentVideos = [];

// Initialize YouTube API
function loadYouTubeAPI() {
  if (document.getElementById('youtube-api-script')) return;
  const tag = document.createElement('script');
  tag.id = 'youtube-api-script';
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

window.onYouTubeIframeAPIReady = function() {
  ytPlayer = new YT.Player('yt-player-container', {
    height: '360',
    width: '100%',
    videoId: '',
    playerVars: { 'autoplay': 1, 'rel': 0 },
    events: { onReady: () => console.log('🎬 Player ready') }
  });
};

window.playVideo = function(videoId) {
  if (ytPlayer && ytPlayer.loadVideoById) {
    ytPlayer.loadVideoById(videoId);
    const container = document.getElementById('yt-player-container');
    if (container) {
      container.style.display = 'block';
      container.scrollIntoView({ behavior: 'smooth' });
    }
  } else {
    console.warn('Player not ready, retrying...');
    setTimeout(() => window.playVideo(videoId), 500);
  }
};

// Load videos from API
async function loadVideos() {
  try {
    const response = await fetch('https://yt-proxy.ruhdevopsytstudio.workers.dev');
    const data = await response.json();
    currentVideos = data.videos || data || [];
    renderVideos();
  } catch (error) {
    console.error('Failed to load videos:', error);
  }
}

function renderVideos() {
  const container = document.querySelector('.episodes-grid, #episodes-container');
  if (container && currentVideos.length) {
    container.innerHTML = currentVideos.map(video => `
      <div class="video-card" data-video-id="${video.videoId}" onclick="playVideo('${video.videoId}')">
        <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
        <h3>${escapeHtml(video.title)}</h3>
      </div>
    `).join('');
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Dark mode toggle
function initDarkMode() {
  const toggle = document.getElementById('darkModeToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
  }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  loadYouTubeAPI();
  loadVideos();
  initDarkMode();
  console.log('🚀 YT Studio initialized');
});
