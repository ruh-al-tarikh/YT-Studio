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
    `;
  }

  function render() {
    const q = state.search.toLowerCase();

    state.filtered = state.videos.filter(v => {
      const matchCat = state.category === 'all' || v.category === state.category;
      const matchSearch = !q || v.title.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    if (el.resultsMeta) {
      el.resultsMeta.textContent = `${state.filtered.length} episode${state.filtered.length === 1 ? '' : 's'} found`;
    }

    const slice = state.filtered.slice(0, CONFIG.ITEMS_PER_PAGE * (state.page + 1));
    el.grid.innerHTML = slice.map(card).join('');

    const loadMoreContainer = $('loadMoreContainer');
    if (loadMoreContainer) {
      loadMoreContainer.style.display =
        slice.length < state.filtered.length ? 'block' : 'none';
    }
  }

  /* ----------------------------
   * MODAL / PLAYER
   * ---------------------------- */
      function updateStats() {
    if (el.statTotal) el.statTotal.textContent = state.videos.length;
    if (el.statSaved) el.statSaved.textContent = state.watchLater.length;
    if (el.watchLaterCount) el.watchLaterCount.textContent = state.watchLater.length;
  }

  /* ----------------------------
   * HERO
   * ---------------------------- */
  function setHero(v) {
    state.hero = v;
    if (!v || !el.heroTitle) return;

    el.heroTitle.textContent = v.title;
    el.heroSubtitle.textContent = v.description || '';
    el.bg.style.backgroundImage = `url(${v.thumbnail})`;
    if (el.heroSubtitle) el.heroSubtitle.textContent = v.description;
    if (el.heroCategory) el.heroCategory.textContent = categoryLabel(v.category);
    if (el.bg) el.bg.style.backgroundImage = `url(${v.thumbnail})`;

    const isSaved = state.watchLater.some(s => s.id === v.id);
    if (el.heroSave) {
      el.heroSave.innerHTML = `<i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i> <span>${isSaved ? 'Saved' : 'Save'}</span>`;
    }
  }

  /* ----------------------------
   * EVENTS
   * ---------------------------- */
    function bind() {
    // Search input
    el.search?.addEventListener("input", (e) => {
      state.search = e.target.value;
      state.page = 0;
      if (el.clearSearch) el.clearSearch.style.display = state.search ? "block" : "none";
      clearTimeout(state.debounceTimer);
      state.debounceTimer = setTimeout(() => {
        state.page = 0;
        render();
      }, 250);
    });

    // Clear search
    el.clearSearch?.addEventListener("click", () => {
      if (el.search) {
        el.search.value = "";
        state.search = "";
        state.page = 0;
        el.clearSearch.style.display = "none";
        render();
      }
    });

    // Filter chips
    el.chips.forEach(chip => {
      chip.addEventListener("click", () => {
        el.chips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        state.category = chip.dataset.cat;
        state.page = 0;
        render();
      });
    });

    // Theme Toggle
    el.themeToggle?.addEventListener("click", toggleTheme);

    // Hero Buttons
    el.heroBtn?.addEventListener("click", () => {
      if (state.hero) openModal(state.hero);
    });

    el.heroSave?.addEventListener("click", () => {
      if (state.hero) {
        toggleWatchLater(state.hero);
        setHero(state.hero);
      }
    });

    // Modal Close
    el.closeModal?.addEventListener("click", closeModal);

    // Video Grid - Event delegation
    el.grid?.addEventListener("click", (e) => {
      const cardEl = e.target.closest(".card");
      const saveBtn = e.target.closest(".watch-later-btn");

      if (saveBtn) {
        e.stopPropagation();
        const id = saveBtn.dataset.id;
        const video = state.videos.find(v => v.id === id);
        if (video) {
          toggleWatchLater(video);
          render();
        }
        return;
      }

      if (cardEl) {
        const id = cardEl.dataset.id;
        const video = state.videos.find(v => v.id === id);
        if (video) openModal(video);
      }
    });

    // Load More
    el.loadMore?.addEventListener("click", () => {
      state.page++;
      render();
    });

    // Keyboard Shortcuts
        document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        if (e.key === "Escape") e.target.blur();
        return;
      }

      const key = e.key.toLowerCase();

      switch(key) {
        case "/":
          e.preventDefault();
          el.search?.focus();
          break;
        case "escape":
          closeModal();
          const hints = $("keyboardHints");
          if (hints) {
             hints.setAttribute("aria-hidden", "true");
             el.body.style.overflow = "";
          }
          break;
        case "?":
          const hintsModal = $("keyboardHints");
          if (hintsModal) {
            const isHidden = hintsModal.getAttribute("aria-hidden") === "true";
            hintsModal.setAttribute("aria-hidden", isHidden ? "false" : "true");
            el.body.style.overflow = isHidden ? "hidden" : "";
          }
          break;
        case "t":
          toggleTheme();
          break;
      }
    });

    // Close hints
    $("closeHints")?.addEventListener("click", () => {
      $("keyboardHints")?.setAttribute("aria-hidden", "true");
      el.body.style.overflow = "";
    });

    // Retry Button
    el.retryBtn?.addEventListener("click", init);

    // Handle clicks outside modal content to close
    el.modal?.addEventListener("click", (e) => {
      if (e.target === el.modal) closeModal();
    });

    $("keyboardHints")?.addEventListener("click", (e) => {
      if (e.target === $("keyboardHints")) {
        $("keyboardHints").setAttribute("aria-hidden", "true");
        el.body.style.overflow = "";
      }
    });
  }


  /* ----------------------------
   * INIT
   * ---------------------------- */
  async function init() {
    try {
      if (el.error) el.error.style.display = 'none';
      if (el.loading) el.loading.style.display = 'block';

      applyTheme();
      state.videos = await loadVideos();
      state.videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      if (state.videos.length > 0) {
        setHero(state.videos[0]);
        render();
        updateStats();
      } else {
        throw new Error('No videos available in the archive.');
      }

      bind();
    } catch (e) {
      if (el.error) el.error.style.display = 'block';
      if (el.errorMsg) el.errorMsg.textContent = e.message || 'Connection failed. Please try again.';
      console.error('Init Error:', e);
    } finally {
      if (el.loading) el.loading.style.display = 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
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
