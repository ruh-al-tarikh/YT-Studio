(function () {
  'use strict';

  /* ----------------------------
   * CONFIG
   * ---------------------------- */
  const CONFIG = {
    API: 'https://yt-proxy.ruhdevopsytstudio.workers.dev',
    CACHE_KEY: 'yt_studio_videos_cache_v4',
    CACHE_EXPIRY: 24 * 60 * 60 * 1000,
    PROGRESS_KEY: 'watch_progress',
    WATCH_LATER_KEY: 'watch_later_list',
    THEME_KEY: 'ui_theme',
    SEARCH_HISTORY_KEY: 'search_history',
    ITEMS_PER_PAGE: 12,

    API_CONFIG: {
      timeout: 10000,
      retries: 3,
      backoff: 1.5,
      delay: 500
    }
  };

  const CATEGORY_RULES = [
    { key: 'quran', label: 'Quran', terms: ['quran', 'surah', 'ayah', 'allah', 'tafsir', 'islam'] },
    { key: 'prophecy', label: 'Prophecy', terms: ['prophecy', 'dajjal', 'gog', 'magog', 'end times'] },
    { key: 'discussion', label: 'Discussion', terms: ['podcast', 'debate', 'interview', 'conversation'] },
    { key: 'educational', label: 'Educational', terms: ['lesson', 'guide', 'explained', 'documentary'] },
    { key: 'history', label: 'History', terms: ['history', 'empire', 'caliph', 'war', 'civilization'] }
  ];

  /* ----------------------------
   * DOM CACHE
   * ---------------------------- */
  const $ = (id) => document.getElementById(id);

  const el = {
    body: document.body,
    grid: $('grid'),
    modal: $('modal'),
    player: $('player'),
    closeModal: $('close'),
    heroTitle: $('hero-title'),
    heroSubtitle: $('hero-subtitle'),
    heroBtn: $('hero-btn'),
    heroSave: $('hero-save-btn'),
    heroCategory: $('hero-category'),
    search: $('searchInput'),
    clearSearch: $('clearSearch'),
    suggestions: $('searchSuggestions'),
    loadMore: $('loadMoreBtn'),
    loadMoreContainer: $('loadMoreContainer'),
    loading: $('loading-state'),
    error: $('error-container'),
    errorMsg: $('error-message'),
    retryBtn: $('retry-btn'),
    toast: $('toast'),
    bg: $('bg'),
    themeToggle: $('darkModeToggle'),
    watchLaterBadge: $('watchLaterBadge'),
    watchLaterCount: $('watchLaterCount'),
    chips: document.querySelectorAll('.chip'),
    resultsMeta: $('results-meta'),
    // Stats
    statTotal: $('stat-total'),
    statSaved: $('stat-saved'),
    statProgress: $('stat-progress')
  };

  /* ----------------------------
   * STATE
   * ---------------------------- */
  const state = {
    videos: [],
    filtered: [],
    hero: null,
    category: 'all',
    search: '',
    page: 0,
    watchLater: JSON.parse(localStorage.getItem(CONFIG.WATCH_LATER_KEY) || '[]'),
    theme: localStorage.getItem(CONFIG.THEME_KEY) || 'dark',
    debounceTimer: null,
    searchHistory: JSON.parse(localStorage.getItem(CONFIG.SEARCH_HISTORY_KEY) || '[]')
  };

  /* ----------------------------
   * UTILITIES
   * ---------------------------- */
  const utils = {
    sanitize: (s) =>
      String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;'),

    truncate: (t, n) => (t.length > n ? t.slice(0, n) + '...' : t),

    formatDate: (d) =>
      new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' })
        .format(new Date(d)),

    saveLS: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
    getLS: (k, f = null) => {
      try {
        const val = localStorage.getItem(k);
        return val ? JSON.parse(val) : f;
      } catch (e) { return f; }
    },

    showToast: (msg) => {
      if (!el.toast) return;
      el.toast.textContent = msg;
      el.toast.classList.add('show');
      setTimeout(() => el.toast.classList.remove('show'), 3000);
    }
  };

  /* ----------------------------
   * CATEGORY
   * ---------------------------- */
  function detectCategory(title) {
    const t = title.toLowerCase();
    const match = CATEGORY_RULES.find(r => r.terms.some(x => t.includes(x)));
    return match?.key || 'history';
  }

  function categoryLabel(key) {
    return CATEGORY_RULES.find(r => r.key === key)?.label || 'History';
  }

  /* ----------------------------
   * API
   * ---------------------------- */
  async function fetchWithRetry(url) {
    let delay = CONFIG.API_CONFIG.delay;

    for (let i = 0; i < CONFIG.API_CONFIG.retries; i++) {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), CONFIG.API_CONFIG.timeout);

        const res = await fetch(url, { signal: ctrl.signal });
        clearTimeout(t);

        if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
        return res;
      } catch (e) {
        if (i === CONFIG.API_CONFIG.retries - 1) throw e;
        await new Promise(r => setTimeout(r, delay));
        delay *= CONFIG.API_CONFIG.backoff;
      }
    }
  }

  async function loadVideos() {
    const cached = utils.getLS(CONFIG.CACHE_KEY);

    if (cached?.data?.length && Date.now() - cached.time < CONFIG.CACHE_EXPIRY) {
      return cached.data;
    }

    try {
      const res = await fetchWithRetry(CONFIG.API);
      const json = await res.json();

      const videos = (json.videos || []).map(v => ({
        id: v.id || v.videoId,
        title: v.title || 'Untitled',
        thumbnail: v.thumbnail,
        publishedAt: v.publishedAt || new Date().toISOString(),
        category: detectCategory(v.title || ''),
        description: v.description || 'Deep dive into Islamic history and theology.'
      }));

      if (videos.length > 0) {
        utils.saveLS(CONFIG.CACHE_KEY, { data: videos, time: Date.now() });
      }
      return videos;
    } catch (err) {
      console.error('Failed to load videos:', err);
      // If we have any cache at all, even expired, return it as fallback
      if (cached?.data) return cached.data;
      throw err;
    }
  }

  /* ----------------------------
   * MODAL / PLAYER
   * ---------------------------- */
  function openModal(video) {
    if (!video || !el.modal || !el.player) return;

    el.player.src = `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`;
    el.modal.style.display = 'flex';
    el.modal.setAttribute('aria-hidden', 'false');
    el.body.style.overflow = 'hidden';

    const titleEl = $('video-title');
    if (titleEl) titleEl.textContent = video.title;

    // Save to search history if it came from search
    if (state.search) {
      if (!state.searchHistory.includes(state.search)) {
        state.searchHistory.unshift(state.search);
        state.searchHistory = state.searchHistory.slice(0, 5);
        utils.saveLS(CONFIG.SEARCH_HISTORY_KEY, state.searchHistory);
      }
    }
  }

  function closeModal() {
    if (!el.modal || !el.player) return;
    el.player.src = '';
    el.modal.style.display = 'none';
    el.modal.setAttribute('aria-hidden', 'true');
    el.body.style.overflow = '';
  }

  /* ----------------------------
   * WATCH LATER
   * ---------------------------- */
  function toggleWatchLater(video) {
    const idx = state.watchLater.findIndex(v => v.id === video.id);
    if (idx === -1) {
      state.watchLater.push(video);
      utils.showToast('Added to Watch Later');
    } else {
      state.watchLater.splice(idx, 1);
      utils.showToast('Removed from Watch Later');
    }
    utils.saveLS(CONFIG.WATCH_LATER_KEY, state.watchLater);
    updateStats();
  }

  /* ----------------------------
   * THEME
   * ---------------------------- */
  function applyTheme() {
    if (state.theme === 'light') {
      el.body.classList.add('light-mode');
    } else {
      el.body.classList.remove('light-mode');
    }
    const icon = el.themeToggle?.querySelector('i');
    if (icon) {
      icon.className = state.theme === 'dark' ? 'fa-regular fa-moon' : 'fa-regular fa-sun';
    }
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    utils.saveLS(CONFIG.THEME_KEY, state.theme);
    applyTheme();
  }

  /* ----------------------------
   * RENDER
   * ---------------------------- */
  function card(v) {
    const isSaved = state.watchLater.some(s => s.id === v.id);
    return `
      <div class="card" data-id="${v.id}" role="button" tabindex="0">
        <div class="card-thumb-wrapper">
          <img src="${v.thumbnail}" alt="${utils.sanitize(v.title)}" loading="lazy">
          <button class="watch-later-btn ${isSaved ? 'active' : ''}" data-id="${v.id}" aria-label="Save for later">
            <i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i>
          </button>
        </div>
        <div class="card-copy">
          <div class="card-title">${utils.sanitize(utils.truncate(v.title, 60))}</div>
          <div class="card-meta">
            <span class="card-tag">${categoryLabel(v.category)}</span>
            <span>${utils.formatDate(v.publishedAt)}</span>
          </div>
        </div>
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
  function openPlayer(v) {
    if (!v) return;
    state.current = v;

    const videoId = v.id || v.videoId;
    el.player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    el.modal.style.display = 'flex';
    el.modal.setAttribute('aria-hidden', 'false');
    el.body.style.overflow = 'hidden';

    const titleEl = $('video-title');
    if (titleEl) titleEl.textContent = v.title;
  }

  function closePlayer() {
    el.player.src = '';
    el.modal.style.display = 'none';
    el.modal.setAttribute('aria-hidden', 'true');
    el.body.style.overflow = '';
    state.current = null;
    if (el.loadMoreContainer) {
      el.loadMoreContainer.style.display = slice.length < state.filtered.length ? 'block' : 'none';
    }
  }

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
    // Search
    el.search?.addEventListener('input', (e) => {
      state.search = e.target.value;
      state.page = 0;
      if (el.clearSearch) el.clearSearch.style.display = state.search ? 'block' : 'none';
      clearTimeout(state.debounceTimer);
      state.debounceTimer = setTimeout(() => {
        state.page = 0;
        render();
      }, 250);
    });

    // Clear search
    $('clearSearch')?.addEventListener('click', () => {
      if (el.search) {
        el.search.value = '';
        state.search = '';
        state.page = 0;
        render();
      }
    });

    // Filter chips
    document.querySelector('.filter-chips')?.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;

      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      state.category = chip.dataset.cat;
      state.page = 0;
      render();
    });

    // Load more
      state.debounceTimer = setTimeout(render, 300);
    });

    el.clearSearch?.addEventListener('click', () => {
      if (el.search) el.search.value = '';
      state.search = '';
      state.page = 0;
      el.clearSearch.style.display = 'none';
      render();
    });

    // Load More
    el.loadMore?.addEventListener('click', () => {
      state.page++;
      render();
    });

    // Hero Play
    el.heroBtn?.addEventListener('click', () => {
      if (state.hero) openPlayer(state.hero);
    });

    // Modal Close
    el.closeModal?.addEventListener('click', closePlayer);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePlayer();
    });

    // Video Grid - Event delegation
    el.grid?.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (!card) return;

      const id = card.dataset.id;
      const video = state.videos.find(v => (v.id === id || v.videoId === id));
      if (video) openPlayer(video);
    });

    // Handle clicks outside modal content to close
    el.modal?.addEventListener('click', (e) => {
      if (e.target === el.modal) closePlayer();
    });

    // Theme toggle
    $('darkModeToggle')?.addEventListener('click', () => {
      const isDark = el.body.classList.toggle('light-theme');
      const icon = $('darkModeToggle').querySelector('i');
      if (icon) {
        icon.className = isDark ? 'fa-regular fa-sun' : 'fa-regular fa-moon';
      }
    });

    // Retry button
    $('retry-btn')?.addEventListener('click', () => {
      el.error.style.display = 'none';
      init();
    // Chips
    el.chips.forEach(chip => {
      chip.addEventListener('click', () => {
        el.chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.category = chip.dataset.cat;
        state.page = 0;
        render();
      });
    });

    // Theme
    el.themeToggle?.addEventListener('click', toggleTheme);

    // Hero Buttons
    el.heroBtn?.addEventListener('click', () => {
      if (state.hero) openModal(state.hero);
    });

    el.heroSave?.addEventListener('click', () => {
      if (state.hero) {
        toggleWatchLater(state.hero);
        setHero(state.hero); // refresh hero save button state
      }
    });

    // Modal Close
    el.closeModal?.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
      if (e.target === el.modal) closeModal();
    });

    // Card Clicks
    el.grid?.addEventListener('click', (e) => {
      const cardEl = e.target.closest('.card');
      const saveBtn = e.target.closest('.watch-later-btn');

      if (saveBtn) {
        e.stopPropagation();
        const id = saveBtn.dataset.id;
        const video = state.videos.find(v => v.id === id);
        if (video) {
          toggleWatchLater(video);
          render(); // Refresh grid to show new save state
        }
        return;
      }

      if (cardEl) {
        const id = cardEl.dataset.id;
        const video = state.videos.find(v => v.id === id);
        if (video) openModal(video);
      }
    });

    // Retry Button
    el.retryBtn?.addEventListener('click', init);

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') e.target.blur();
        return;
      }

      switch(e.key.toLowerCase()) {
        case '/':
          e.preventDefault();
          el.search?.focus();
          break;
        case 'escape':
          closeModal();
          break;
        // Navigation could be added here
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
