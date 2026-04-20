(function() {
  'use strict';

  /* CONFIG */
  const API = "https://yt-studio-api.ruhdevopsytstudio.workers.dev";
  const FALLBACK_DATA = "data/videos.json";
  const CACHE_KEY = "yt_studio_videos_cache";
  const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  const PROGRESS_KEY = "watch_progress";
  const LAST_PLAYED_KEY = "last_played_video";

  /* STATE */
  let videos = [];
  let currentVideo = null;
  let progressInterval = null;

  /* DOM ELEMENTS */
  const elements = {
    appRoot: document.getElementById("app-root"),
    heroTitle: document.getElementById("hero-title"),
    heroBtn: document.getElementById("hero-btn"),
    heroSection: document.querySelector(".hero"),
    bg: document.getElementById("bg"),
    grid: document.getElementById("grid"),
    continueRow: document.getElementById("continue-row"),
    continueSection: document.getElementById("continue-section"),
    modal: document.getElementById("modal"),
    player: document.getElementById("player"),
    videoTitle: document.getElementById("video-title"),
    closeBtn: document.getElementById("close"),
    errorContainer: document.getElementById("error-container"),
    errorMessage: document.getElementById("error-message"),
    retryBtn: document.getElementById("retry-btn"),
    hoverPreview: document.getElementById("hover-preview")
  };

  /* DATA HELPERS */
  function normalizeVideo(v) {
    return {
      id: v.videoId || v.id,
      title: v.title || "Untitled Video",
      thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${v.videoId || v.id}/mqdefault.jpg`,
      publishedAt: v.publishedAt || null,
      channel: v.channel || "Ruh Al Tarikh"
    };
  }

  async function fetchVideos() {
    // 1. Try Cache
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          console.log("Using cached video data");
          return data;
        }
      } catch (e) {
        localStorage.removeItem(CACHE_KEY);
      }
    }

    // 2. Try API
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("API responded with " + res.status);
      const json = await res.json();
      const fetchedVideos = (json.videos || json).map(normalizeVideo);

      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: fetchedVideos,
        timestamp: Date.now()
      }));
      return fetchedVideos;
    } catch (e) {
      console.warn("Primary API failed, trying fallback...", e);

      // 3. Try Fallback
      try {
        const res = await fetch(FALLBACK_DATA);
        if (!res.ok) throw new Error("Fallback file not found");
        const json = await res.json();
        return json.map(normalizeVideo);
      } catch (err) {
        throw new Error("All data sources failed");
      }
    }
  }

  /* STORAGE HELPERS */
  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    } catch (e) { return {}; }
  }

  function saveProgress(id, time, percent) {
    const progress = getProgress();
    progress[id] = { time, percent, updatedAt: Date.now() };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }

  function setLastPlayed(video) {
    localStorage.setItem(LAST_PLAYED_KEY, JSON.stringify({
      id: video.id,
      timestamp: Date.now()
    }));
  }

  function getLastPlayed() {
    try {
      const last = JSON.parse(localStorage.getItem(LAST_PLAYED_KEY));
      return last ? videos.find(v => v.id === last.id) : null;
    } catch (e) { return null; }
  }

  /* UI RENDERING */
  function showError(msg) {
    if (elements.errorContainer) {
      elements.errorContainer.style.display = "block";
      elements.errorMessage.textContent = msg;
    }
    if (elements.heroSection) elements.heroSection.style.display = "none";
  }

  function hideError() {
    if (elements.errorContainer) elements.errorContainer.style.display = "none";
    if (elements.heroSection) elements.heroSection.style.display = "flex";
  }

  function setHero(v) {
    if (!v) return;
    if (elements.heroTitle) elements.heroTitle.textContent = v.title;

    const imgUrl = `https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`;

    if (elements.bg) {
      elements.bg.style.backgroundImage = `url(${imgUrl})`;
    }
    if (elements.heroSection) {
      elements.heroSection.style.background = `linear-gradient(to top, var(--bg-deep), transparent), url(${imgUrl}) center/cover`;
    }
    if (elements.heroBtn) {
      elements.heroBtn.onclick = () => openModal(v);
    }
  }

  function renderGrid() {
    if (!elements.grid) return;
    elements.grid.innerHTML = "";

    videos.forEach(v => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<img src="${v.thumbnail}" loading="lazy" alt="${v.title}">`;

      card.onmouseenter = () => {
        if (elements.hoverPreview && window.innerWidth > 768) {
          elements.hoverPreview.style.display = "block";
          elements.hoverPreview.src = `https://www.youtube.com/embed/${v.id}?autoplay=1&mute=1&controls=0`;
        }
      };

      card.onmousemove = (e) => {
        if (elements.hoverPreview && window.innerWidth > 768) {
          elements.hoverPreview.style.top = e.clientY + 15 + "px";
          elements.hoverPreview.style.left = e.clientX + 15 + "px";
        }
      };

      card.onmouseleave = () => {
        if (elements.hoverPreview) {
          elements.hoverPreview.style.display = "none";
          elements.hoverPreview.src = "";
        }
      };

      card.onclick = () => openModal(v);
      elements.grid.appendChild(card);
    });
  }

  function renderContinue() {
    if (!elements.continueRow) return;
    const progress = getProgress();
    const keys = Object.keys(progress).sort((a, b) => progress[b].updatedAt - progress[a].updatedAt);

    elements.continueRow.innerHTML = "";

    const items = keys.map(id => ({ id, ...progress[id] }))
      .filter(p => videos.find(v => v.id === p.id))
      .slice(0, 10);

    if (items.length === 0) {
      elements.continueSection.style.display = "none";
      elements.continueRow.style.display = "none";
      return;
    }

    elements.continueSection.style.display = "block";
    elements.continueRow.style.display = "flex";

    items.forEach(item => {
      const v = videos.find(x => x.id === item.id);
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${v.thumbnail}" loading="lazy" alt="${v.title}">
        <div class="progress" style="width: ${item.percent}%;"></div>
      `;
      card.onclick = () => openModal(v, item.time);
      elements.continueRow.appendChild(card);
    });
  }

  /* MODAL LOGIC */
  function openModal(v, startTime = 0) {
    if (!v) return;
    currentVideo = v;
    setLastPlayed(v);

    if (elements.modal) elements.modal.style.display = "block";
    if (elements.videoTitle) elements.videoTitle.textContent = v.title;
    if (elements.player) {
      elements.player.src = `https://www.youtube.com/embed/${v.id}?autoplay=1&start=${startTime}&enablejsapi=1`;
    }

    startTracking(v.id);
  }

  function closeModal() {
    if (elements.modal) elements.modal.style.display = "none";
    if (elements.player) elements.player.src = "";
    if (progressInterval) clearInterval(progressInterval);
    renderContinue();
  }

  function startTracking(videoId) {
    if (progressInterval) clearInterval(progressInterval);

    // Note: To get precise time via YouTube IFrame API, we would need to load the API script.
    // For now, we'll use a simplified version since we can't easily access contentWindow properties
    // due to cross-origin restrictions unless the YouTube API is properly initialized.
    // However, the previous code attempted it, so we'll keep a safe placeholder or try/catch.

    progressInterval = setInterval(() => {
      try {
        // This will likely fail due to CORS unless using the official YouTube IFrame API PostMessage
        // But we'll keep the logic structure for future enhancement
        const player = elements.player;
        // In a real SaaS app, we'd use: player.contentWindow.postMessage('{"event":"command","func":"getCurrentTime","args":""}', '*');
      } catch (e) {}
    }, 5000);
  }

  /* INITIALIZATION */
  async function init() {
    hideError();
    try {
      videos = await fetchVideos();

      if (!videos.length) {
        showError("No videos available at the moment.");
        return;
      }

      const lastPlayed = getLastPlayed();
      setHero(lastPlayed || videos[0]);
      renderGrid();
      renderContinue();
    } catch (e) {
      showError("Failed to load videos. Please check your connection.");
      console.error(e);
    }
  }

  /* EVENT LISTENERS */
  if (elements.closeBtn) {
    elements.closeBtn.onclick = closeModal;
  }

  if (elements.retryBtn) {
    elements.retryBtn.onclick = init;
  }

  window.onclick = (event) => {
    if (event.target === elements.modal) closeModal();
  };

  document.addEventListener('DOMContentLoaded', init);
})();
