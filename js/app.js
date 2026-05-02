/**
 * YT Studio - Cinematic Archive
 * Core Application Logic
 */

(function() {
  'use strict';

  // --- Configuration ---
  const CONFIG = {
    API_BASE: 'https://yt-proxy.ruhdevopsytstudio.workers.dev',
    ITEMS_PER_PAGE: 12,
    THEME_KEY: 'yt-studio-theme',
    WATCH_LATER_KEY: 'yt-studio-watch-later',
    PROGRESS_KEY: 'yt-studio-progress',
    CATEGORY_RULES: {
      quran: ['quran', 'tafsir', 'surah'],
      history: ['history', 'civilization', 'empire', 'tarikh'],
      prophecy: ['prophecy', 'end times', 'fitna', 'dajjal'],
      discussion: ['discussion', 'podcast', 'debate', 'talk'],
      educational: ['how to', 'tutorial', 'explain', 'guide', 'lesson']
    }
  };

  // --- State ---
  const state = {
    videos: [],
    filtered: [],
    hero: null,
    watchLater: JSON.parse(localStorage.getItem(CONFIG.WATCH_LATER_KEY) || '[]'),
    progress: JSON.parse(localStorage.getItem(CONFIG.PROGRESS_KEY) || '{}'),
    search: '',
    category: 'all',
    page: 0,
    debounceTimer: null,
    ytPlayerReady: false,
    currentVideo: null
  };

  // --- Selectors ---
  const $ = (id) => document.getElementById(id);
  const $$ = (selector) => document.querySelectorAll(selector);

  const el = {
    body: document.body,
    grid: $('grid'),
    heroTitle: $('hero-title'),
    heroSubtitle: $('hero-subtitle'),
    heroCategory: $('hero-category'),
    heroDate: $('hero-date'),
    heroBtn: $('hero-btn'),
    heroSave: $('hero-save-btn'),
    bg: $('bg'),
    searchInput: $('searchInput'),
    clearSearch: $('clearSearch'),
    resultsMeta: $('results-meta'),
    loadMoreContainer: $('loadMoreContainer'),
    loadMoreBtn: $('loadMoreBtn'),
    modal: $('modal'),
    player: $('player'),
    videoTitle: $('video-title'),
    closeModal: $('close'),
    watchLaterBtn: $('watchLaterBadge'),
    watchLaterCount: $('watchLaterCount'),
    watchLaterPage: $('watchLaterPage'),
    watchLaterContainer: $('watchLaterContainer'),
    closeWatchLater: $('closeWatchLater'),
    dashboardBtn: $('dashboardBtn'),
    dashboardModal: $('dashboardModal'),
    closeDashboard: $('closeDashboard'),
    themeToggle: $('darkModeToggle'),
    loading: $('loading-state'),
    error: $('error-container'),
    errorMsg: $('error-message'),
    retryBtn: $('retry-btn'),
    statTotal: $('stat-total'),
    statSaved: $('stat-saved'),
    statProgress: $('stat-progress'),
    toast: $('toast'),
    chips: $$('.chip'),
    dashboardTotal: $('dashboard-total'),
    dashboardSaved: $('dashboard-saved'),
    dashboardProgress: $('dashboard-progress'),
    dashboardCategories: $('dashboardCategories'),
    // Modal Sidebar & Sharing
    toggleTranscript: $('toggleTranscript'),
    transcriptPanel: $('transcriptPanel'),
    closeTranscript: $('closeTranscript'),
    shareEpisode: $('shareEpisode'),
    sharePanel: $('sharePanel'),
    closeShare: $('closeShare'),
    shareLink: $('shareLink'),
    copyLinkBtn: $('copyLinkBtn'),
    shareTwitter: $('shareTwitter'),
    shareFacebook: $('shareFacebook'),
    shareWhatsApp: $('shareWhatsApp')
  };

  // --- Helpers ---

  function detectCategory(title) {
    const t = title.toLowerCase();
    for (const [cat, keywords] of Object.entries(CONFIG.CATEGORY_RULES)) {
      if (keywords.some(k => t.includes(k))) return cat;
    }
    return 'history';
  }

  function formatDate(isoString) {
    if (!isoString) return 'Recently added';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Recently added';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showToast(msg) {
    if (!el.toast) return;
    el.toast.textContent = msg;
    el.toast.classList.add('show');
    setTimeout(() => el.toast.classList.remove('show'), 3000);
  }

  // --- Data Logic ---

  async function loadVideos() {
    try {
      if (el.loading) el.loading.style.display = 'grid';
      if (el.error) el.error.style.display = 'none';

      const response = await fetch(CONFIG.API_BASE);
      if (!response.ok) throw new Error('Failed to fetch archive data');

      const data = await response.json();
      const rawVideos = data.videos || data || [];

      state.videos = (Array.isArray(rawVideos) ? rawVideos : []).map(v => ({
        id: v.videoId || v.id,
        title: v.title || 'Untitled Episode',
        thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${v.videoId || v.id}/mqdefault.jpg`,
        publishedAt: v.publishedAt,
        category: detectCategory(v.title || ''),
        description: v.description || ''
      }));

      state.videos.sort((a, b) => {
        if (!a.publishedAt) return 1;
        if (!b.publishedAt) return -1;
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      });

      return state.videos;
    } catch (err) {
      console.error('API Error:', err);
      if (el.error) el.error.style.display = 'grid';
      if (el.errorMsg) el.errorMsg.textContent = err.message;
      throw err;
    } finally {
      if (el.loading) el.loading.style.display = 'none';
    }
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
    ITEMS_PER_PAGE: 24,

    API_CONFIG: {
      timeout: 20000,
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
      console.log('Loading videos from cache...');
      return cached.data;
    }

    try {
      console.log('Fetching videos from API...');
      const res = await fetchWithRetry(CONFIG.API);
      const json = await res.json();
      console.log('API Response:', json);

      const videos = (json.videos || []).map(v => {
        const id = v.videoId || v.id;
        return {
          id: id || '',
          title: v.title || 'Untitled',
          thumbnail: v.thumbnail || '',
          publishedAt: v.publishedAt || new Date().toISOString(),
          category: detectCategory(v.title || ''),
          description: v.description || 'Deep dive into Islamic history and theology.'
        };
      }).filter(v => v.id);

      if (videos.length > 0) {
        utils.saveLS(CONFIG.CACHE_KEY, { data: videos, time: Date.now() });
      }
      return videos;
    } catch (err) {
      console.error('Failed to load videos:', err);
      if (cached?.data) return cached.data;
      throw err;
    }
  }

  /* ----------------------------
   * MODAL / PLAYER
   * ---------------------------- */
  function openModal(video) {
    if (!video || !video.id) {
      console.error('Invalid video for modal:', video);
      return;
    }
    if (!el.modal || !el.player) {
      console.error('Modal elements missing');
      return;
    }

    console.log('Opening video:', video.id);
    el.player.src = `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`;
    el.modal.style.display = 'flex';
    el.modal.setAttribute('aria-hidden', 'false');
    el.body.style.overflow = 'hidden';

    const titleEl = $('video-title');
    if (titleEl) titleEl.textContent = video.title;

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

  // --- UI Rendering ---

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
    if (el.grid) {
      el.grid.innerHTML = slice.map(v => videoCard(v)).join('');
    }

    if (el.loadMoreContainer) {
      el.loadMoreContainer.style.display = slice.length < state.filtered.length ? 'block' : 'none';
    }

    updateStats();
  }

  function videoCard(v) {
    const isSaved = state.watchLater.some(s => s.id === v.id);
    return `
      <article class="card" data-id="${v.id}">
        <div class="card-media">
          <img src="${v.thumbnail}" alt="${escapeHtml(v.title)}" loading="lazy">
          <div class="card-overlay">
            <button class="play-btn" aria-label="Play video">
              <i class="fa-solid fa-play"></i>
            </button>
          </div>
          <button class="watch-later-btn ${isSaved ? 'active' : ''}" data-id="${v.id}" title="${isSaved ? 'Remove from Watch Later' : 'Watch Later'}">
            <i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i>
          </button>
        </div>
        <div class="card-copy">
          <div class="card-meta">
            <span class="card-category">${v.category}</span>
            <span class="card-date">${formatDate(v.publishedAt)}</span>
          </div>
          <h3 class="card-title">${escapeHtml(v.title)}</h3>
        </div>
      </article>
    `;
  }

  function updateStats() {
    if (el.statTotal) el.statTotal.textContent = state.videos.length;
    if (el.statSaved) el.statSaved.textContent = state.watchLater.length;
    if (el.watchLaterCount) el.watchLaterCount.textContent = state.watchLater.length;

    const progressCount = Object.keys(state.progress).length;
    if (el.statProgress) el.statProgress.textContent = progressCount;
  }

  function setHero(v) {
    state.hero = v;
    if (!v || !el.heroTitle) return;

    el.heroTitle.textContent = v.title;
    if (el.heroSubtitle) el.heroSubtitle.textContent = v.description || 'Dive into the depths of history and scripture.';
    if (el.heroCategory) el.heroCategory.textContent = v.category;
    if (el.heroDate) el.heroDate.textContent = formatDate(v.publishedAt);
    el.heroSubtitle.textContent = v.description || '';
    if (el.heroCategory) el.heroCategory.textContent = categoryLabel(v.category);
    if (el.bg) el.bg.style.backgroundImage = `url(${v.thumbnail})`;

    const isSaved = state.watchLater.some(s => s.id === v.id);
    if (el.heroSave) {
      el.heroSave.innerHTML = `<i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i> <span>${isSaved ? 'Saved' : 'Save'}</span>`;
    }
  }

  // --- YouTube Player Logic ---

  function playVideo(v) {
    if (!v || !v.id) return;
    state.currentVideo = v;

    if (el.player) {
      el.player.src = `https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0&enablejsapi=1`;
    }

    if (el.videoTitle) el.videoTitle.textContent = v.title;
    if (el.shareLink) el.shareLink.value = `https://www.youtube.com/watch?v=${v.id}`;

    // Save progress as a started session
    if (!state.progress[v.id]) {
      state.progress[v.id] = { startedAt: Date.now() };
      localStorage.setItem(CONFIG.PROGRESS_KEY, JSON.stringify(state.progress));
      updateStats();
    }

    openModal();
  }

  function openModal() {
    if (el.modal) {
      el.modal.style.display = 'flex';
      el.modal.setAttribute('aria-hidden', 'false');
      el.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (el.modal) {
      el.modal.style.display = 'none';
      el.modal.setAttribute('aria-hidden', 'true');
      el.body.style.overflow = '';
      if (el.player) el.player.src = '';
      closeTranscript();
      closeShare();
    }
  }

  // --- Overlay Handlers ---

  function openWatchLater() {
    if (!el.watchLaterPage) return;
    el.watchLaterPage.style.display = 'block';
    el.watchLaterPage.setAttribute('aria-hidden', 'false');
    el.body.style.overflow = 'hidden';
    renderWatchLater();
  }

  function closeWatchLater() {
    if (!el.watchLaterPage) return;
    el.watchLaterPage.style.display = 'none';
    el.watchLaterPage.setAttribute('aria-hidden', 'true');
    el.body.style.overflow = '';
  }

  function renderWatchLater() {
    if (!el.watchLaterContainer) return;
    if (state.watchLater.length === 0) {
      el.watchLaterContainer.innerHTML = '<p class="empty-state">No videos saved yet.</p>';
      return;
    }
    el.watchLaterContainer.innerHTML = state.watchLater.map(v => videoCard(v)).join('');
  }

  function openDashboard() {
    if (!el.dashboardModal) return;
    el.dashboardModal.style.display = 'block';
    el.dashboardModal.setAttribute('aria-hidden', 'false');
    el.body.style.overflow = 'hidden';
    renderDashboard();
  }

  function closeDashboard() {
    if (!el.dashboardModal) return;
    el.dashboardModal.style.display = 'none';
    el.dashboardModal.setAttribute('aria-hidden', 'true');
    el.body.style.overflow = '';
  }

  function renderDashboard() {
    if (el.dashboardTotal) el.dashboardTotal.textContent = state.videos.length;
    if (el.dashboardSaved) el.dashboardSaved.textContent = state.watchLater.length;

    const progressCount = Object.keys(state.progress).length;
    if (el.dashboardProgress) el.dashboardProgress.textContent = progressCount;

    // Category spread
    if (el.dashboardCategories) {
      const counts = state.videos.reduce((acc, v) => {
        acc[v.category] = (acc[v.category] || 0) + 1;
        return acc;
      }, {});

      el.dashboardCategories.innerHTML = Object.entries(counts).map(([cat, count]) => `
        <div class="dashboard-list-row">
          <span>${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
          <strong>${count}</strong>
        </div>
      `).join('');
    }
  }

  function toggleTranscript() {
    const isHidden = el.transcriptPanel?.getAttribute('aria-hidden') === 'true';
    if (isHidden) {
      el.transcriptPanel?.setAttribute('aria-hidden', 'false');
      closeShare();
    } else {
      closeTranscript();
    }
  }

  function closeTranscript() {
    el.transcriptPanel?.setAttribute('aria-hidden', 'true');
  }

  function toggleShare() {
    const isHidden = el.sharePanel?.getAttribute('aria-hidden') === 'true';
    if (isHidden) {
      el.sharePanel?.setAttribute('aria-hidden', 'false');
      closeTranscript();
    } else {
      closeShare();
    }
  }

  function closeShare() {
    el.sharePanel?.setAttribute('aria-hidden', 'true');
  }

  // --- Interactions ---

  function toggleWatchLater(v) {
    const idx = state.watchLater.findIndex(s => s.id === v.id);
    if (idx > -1) {
      state.watchLater.splice(idx, 1);
      showToast('Removed from Watch Later');
    } else {
      state.watchLater.push(v);
      showToast('Added to Watch Later');
    }
    localStorage.setItem(CONFIG.WATCH_LATER_KEY, JSON.stringify(state.watchLater));
    updateStats();
    if (el.watchLaterPage && el.watchLaterPage.style.display === 'block') renderWatchLater();
  }

  function toggleTheme() {
    const isLight = el.body.classList.toggle('light-mode');
    localStorage.setItem(CONFIG.THEME_KEY, isLight ? 'light' : 'dark');
  }

  function applyTheme() {
    const theme = localStorage.getItem(CONFIG.THEME_KEY);
    if (theme === 'light') el.body.classList.add('light-mode');
    else el.body.classList.remove('light-mode');
  }

  // --- Event Binding ---

  function bind() {
    el.searchInput?.addEventListener('input', (e) => {
  /* ----------------------------
   * EVENTS
   * ---------------------------- */
  function bind() {
    // Search input
    el.search?.addEventListener("input", (e) => {
      state.search = e.target.value;
      if (el.clearSearch) el.clearSearch.style.display = state.search ? 'block' : 'none';
      clearTimeout(state.debounceTimer);
      state.debounceTimer = setTimeout(() => {
        state.page = 0;
        render();
      }, 300);
    });

    el.clearSearch?.addEventListener('click', () => {
      if (el.searchInput) {
        el.searchInput.value = '';
        state.search = '';
        state.page = 0;
        el.clearSearch.style.display = 'none';
        render();
      }
    });

    el.chips.forEach(chip => {
      chip.addEventListener('click', () => {
        el.chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.category = chip.dataset.cat;
        state.page = 0;
        render();
      });
    });

    el.themeToggle?.addEventListener('click', toggleTheme);

    el.heroBtn?.addEventListener('click', () => {
      if (state.hero) playVideo(state.hero);
    });

    el.heroSave?.addEventListener('click', () => {
      if (state.hero) {
        toggleWatchLater(state.hero);
        setHero(state.hero);
      }
    });

    el.closeModal?.addEventListener('click', closeModal);

    el.grid?.addEventListener('click', handleGridClick);
    el.watchLaterContainer?.addEventListener('click', handleGridClick);

    function handleGridClick(e) {
      const card = e.target.closest('.card');
      const saveBtn = e.target.closest('.watch-later-btn');

      if (saveBtn) {
        e.stopPropagation();
        const id = saveBtn.dataset.id;
        const video = state.videos.find(v => v.id === id) || state.watchLater.find(v => v.id === id);
        if (video) {
          toggleWatchLater(video);
          render();
        }
        return;
      }

      if (card) {
        const id = card.dataset.id;
        const video = state.videos.find(v => v.id === id) || state.watchLater.find(v => v.id === id);
        if (video) playVideo(video);
      if (cardEl) {
        const id = cardEl.dataset.id;
        console.log('Card clicked, ID:', id);
        const video = state.videos.find(v => v.id === id);
        if (video) {
          openModal(video);
        } else {
          console.error('Video not found for ID:', id);
        }
      }
    }

    el.loadMoreBtn?.addEventListener('click', () => {
      state.page++;
      render();
    });

    el.watchLaterBtn?.addEventListener('click', openWatchLater);
    el.closeWatchLater?.addEventListener('click', closeWatchLater);

    el.dashboardBtn?.addEventListener('click', openDashboard);
    el.closeDashboard?.addEventListener('click', closeDashboard);
    // Keyboard Shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        if (e.key === "Escape") e.target.blur();
        return;
      }

    // Modal Sidebar
    el.toggleTranscript?.addEventListener('click', toggleTranscript);
    el.closeTranscript?.addEventListener('click', closeTranscript);
    el.shareEpisode?.addEventListener('click', toggleShare);
    el.closeShare?.addEventListener('click', closeShare);

    el.copyLinkBtn?.addEventListener('click', () => {
      if (el.shareLink) {
        el.shareLink.select();
        document.execCommand('copy');
        showToast('Link copied to clipboard');
      }
    });

    el.shareTwitter?.addEventListener('click', () => {
      if (state.currentVideo) {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(state.currentVideo.title)}&url=${encodeURIComponent(el.shareLink.value)}`;
        window.open(url, '_blank');
      }
    });

    el.shareFacebook?.addEventListener('click', () => {
      if (state.currentVideo) {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(el.shareLink.value)}`;
        window.open(url, '_blank');
      }
    });

    el.shareWhatsApp?.addEventListener('click', () => {
      if (state.currentVideo) {
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(state.currentVideo.title + ' ' + el.shareLink.value)}`;
        window.open(url, '_blank');
      }
    });

    el.retryBtn?.addEventListener('click', init);

    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'Escape') {
        closeModal();
        closeWatchLater();
        closeDashboard();
      }
      if (e.key.toLowerCase() === '/') {
        e.preventDefault();
        el.searchInput?.focus();
      }
      if (e.key.toLowerCase() === 't') toggleTheme();
    });

    el.modal?.addEventListener('click', (e) => { if (e.target === el.modal) closeModal(); });
    el.watchLaterPage?.addEventListener('click', (e) => { if (e.target === el.watchLaterPage) closeWatchLater(); });
    el.dashboardModal?.addEventListener('click', (e) => { if (e.target === el.dashboardModal) closeDashboard(); });
  }

  // --- Initialization ---

  async function init() {
    try {
  /* ----------------------------
   * INIT
   * ---------------------------- */
  async function init() {
    try {
      console.log('Archive initializing...');
      if (el.error) el.error.style.display = 'none';
      if (el.loading) el.loading.style.display = 'block';

      applyTheme();
      await loadVideos();

      if (state.videos.length > 0) {
        console.log(`Loaded ${state.videos.length} videos.`);
        setHero(state.videos[0]);
        render();
      }

      bind();
      console.log('🚀 YT Studio initialized');
    } catch (err) {
      console.error('Initialization failed:', err);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
})();
