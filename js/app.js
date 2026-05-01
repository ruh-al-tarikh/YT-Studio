(function () {
  'use strict';

  /* ----------------------------
   * CONFIG
   * ---------------------------- */
  const CONFIG = {
    API: 'https://yt-proxy.ruhdevopsytstudio.workers.dev',
    CACHE_KEY: 'yt_studio_videos_cache',
    CACHE_EXPIRY: 24 * 60 * 60 * 1000,
    WATCH_LATER_KEY: 'watch_later',
    THEME_KEY: 'ui_theme',
    ITEMS_PER_PAGE: 12,
    API_CONFIG: {
      timeout: 8000,
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
    videoTitle: $('video-title'),
    heroTitle: $('hero-title'),
    heroSubtitle: $('hero-subtitle'),
    heroBtn: $('hero-btn'),
    heroSave: $('hero-save-btn'),
    search: $('searchInput'),
    suggestions: $('searchSuggestions'),
    clearSearch: $('clearSearch'),
    loadMore: $('loadMoreBtn'),
    loading: $('loading-state'),
    error: $('error-container'),
    errorMsg: $('error-message'),
    retry: $('retry-btn'),
    toast: $('toast'),
    bg: $('bg'),
    closeModal: $('close'),
    darkMode: $('darkModeToggle'),
    watchLater: $('watchLaterBadge'),
    watchLaterPage: $('watchLaterPage'),
    closeWatchLater: $('closeWatchLater'),
    dashboard: $('dashboardBtn'),
    dashboardModal: $('dashboardModal'),
    closeDashboard: $('closeDashboard'),
    chips: document.querySelectorAll('.chip'),
    toggleTranscript: $('toggleTranscript'),
    transcriptPanel: $('transcriptPanel'),
    closeTranscript: $('closeTranscript'),
    shareEpisode: $('shareEpisode'),
    sharePanel: $('sharePanel'),
    closeShare: $('closeShare'),
    shareLink: $('shareLink'),
    copyLinkBtn: $('copyLinkBtn'),
    statTotal: $('stat-total'),
    statProgress: $('stat-progress'),
    statSaved: $('stat-saved'),
    dashTotal: $('dashboard-total'),
    dashSaved: $('dashboard-saved')
  };

  /* ----------------------------
   * STATE
   * ---------------------------- */
  const state = {
    videos: [],
    filtered: [],
    hero: null,
    current: null,
    category: 'all',
    search: '',
    page: 0,
    watchLater: JSON.parse(localStorage.getItem(CONFIG.WATCH_LATER_KEY) || '[]'),
    theme: localStorage.getItem(CONFIG.THEME_KEY) || 'dark',
    debounceTimer: null
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
    getLS: (k, f = null) => JSON.parse(localStorage.getItem(k) || JSON.stringify(f))
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

        if (!res.ok) throw new Error(res.statusText);
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

    const res = await fetchWithRetry(CONFIG.API);
    const json = await res.json();

    const videos = (json.videos || []).map(v => ({
      id: v.id || v.videoId,
      title: v.title || 'Untitled',
      thumbnail: v.thumbnail,
      publishedAt: v.publishedAt || new Date().toISOString(),
      category: detectCategory(v.title || ''),
      description: v.description || 'No description available for this episode.'
    }));

    utils.saveLS(CONFIG.CACHE_KEY, { data: videos, time: Date.now() });
    return videos;
  }

  /* ----------------------------
   * PLAYER
   * ---------------------------- */
  function playVideo(v) {
    if (!v || !v.id) return;
    state.current = v;
    if (el.videoTitle) el.videoTitle.textContent = v.title;
    if (el.player) el.player.src = `https://www.youtube.com/embed/${v.id}?autoplay=1`;
    if (el.modal) {
      el.modal.style.display = 'block';
      el.modal.setAttribute('aria-hidden', 'false');
    }
    el.body.style.overflow = 'hidden';

    if (el.shareLink) {
      el.shareLink.value = `https://youtu.be/${v.id}`;
    }
  }

  function closeModal() {
    if (el.modal) {
      el.modal.style.display = 'none';
      el.modal.setAttribute('aria-hidden', 'true');
    }
    if (el.player) el.player.src = '';
    el.body.style.overflow = '';
    state.current = null;

    // Reset panels
    el.transcriptPanel?.setAttribute('aria-hidden', 'true');
    el.sharePanel?.setAttribute('aria-hidden', 'true');
  }

  /* ----------------------------
   * RENDER
   * ---------------------------- */
  function card(v) {
    return `
      <div class="card" data-id="${v.id}">
        <div class="card-image-container">
          <img src="${v.thumbnail}" loading="lazy" alt="${utils.sanitize(v.title)}" />
          <div class="card-play-overlay"><i class="fa-solid fa-play"></i></div>
        </div>
        <div class="card-content">
          <div class="card-title">${utils.sanitize(utils.truncate(v.title, 60))}</div>
          <div class="card-meta">${categoryLabel(v.category)} • ${utils.formatDate(v.publishedAt)}</div>
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

    const slice = state.filtered.slice(0, CONFIG.ITEMS_PER_PAGE * (state.page + 1));
    if (el.grid) el.grid.innerHTML = slice.map(card).join('');

    const container = el.loadMore?.parentElement;
    if (container) {
      container.style.display = slice.length < state.filtered.length ? 'block' : 'none';
    }
  }

  /* ----------------------------
   * HERO & STATS
   * ---------------------------- */
  function setHero(v) {
    state.hero = v;
    if (!v) return;

    if (el.heroTitle) el.heroTitle.textContent = v.title;
    if (el.heroSubtitle) el.heroSubtitle.textContent = utils.truncate(v.description, 160);
    if (el.bg) el.bg.style.backgroundImage = `linear-gradient(to bottom, rgba(4,8,15,0.7), rgba(4,8,15,1)), url(${v.thumbnail})`;
  }

  function updateStats() {
    const total = state.videos.length;
    const saved = state.watchLater.length;

    if (el.statTotal) el.statTotal.textContent = total;
    if (el.statSaved) el.statSaved.textContent = saved;
    if (el.dashTotal) el.dashTotal.textContent = total;
    if (el.dashSaved) el.dashSaved.textContent = saved;

    const badge = document.getElementById('watchLaterCount');
    if (badge) badge.textContent = saved;
  }

  /* ----------------------------
   * UI ACTIONS
   * ---------------------------- */
  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.body.className = state.theme === 'light' ? 'light-mode' : '';
    localStorage.setItem(CONFIG.THEME_KEY, state.theme);
    const icon = el.darkMode?.querySelector('i');
    if (icon) {
      icon.className = state.theme === 'dark' ? 'fa-regular fa-moon' : 'fa-regular fa-sun';
    }
  }

  function showToast(msg) {
    if (!el.toast) return;
    el.toast.textContent = msg;
    el.toast.classList.add('show');
    setTimeout(() => el.toast.classList.remove('show'), 3000);
  }

  function openOverlay(element) {
    if (!element) return;
    element.style.display = 'block';
    element.setAttribute('aria-hidden', 'false');
    el.body.style.overflow = 'hidden';
  }

  function closeOverlay(element) {
    if (!element) return;
    element.style.display = 'none';
    element.setAttribute('aria-hidden', 'true');
    el.body.style.overflow = '';
  }

  /* ----------------------------
   * EVENTS
   * ---------------------------- */
  function bind() {
    el.search?.addEventListener('input', (e) => {
      state.search = e.target.value;
      if (el.clearSearch) el.clearSearch.style.display = state.search ? 'block' : 'none';
      clearTimeout(state.debounceTimer);
      state.debounceTimer = setTimeout(() => {
        state.page = 0;
        render();
      }, 300);
    });

    el.clearSearch?.addEventListener('click', () => {
      if (el.search) el.search.value = '';
      state.search = '';
      if (el.clearSearch) el.clearSearch.style.display = 'none';
      state.page = 0;
      render();
    });

    el.loadMore?.addEventListener('click', () => {
      state.page++;
      render();
    });

    el.heroBtn?.addEventListener('click', () => {
      if (state.hero) playVideo(state.hero);
    });

    el.closeModal?.addEventListener('click', closeModal);

    el.darkMode?.addEventListener('click', toggleTheme);

    el.watchLater?.addEventListener('click', () => openOverlay(el.watchLaterPage));
    el.closeWatchLater?.addEventListener('click', () => closeOverlay(el.watchLaterPage));

    el.dashboard?.addEventListener('click', () => openOverlay(el.dashboardModal));
    el.closeDashboard?.addEventListener('click', () => closeOverlay(el.dashboardModal));

    el.toggleTranscript?.addEventListener('click', () => {
      const hidden = el.transcriptPanel?.getAttribute('aria-hidden') === 'true';
      el.transcriptPanel?.setAttribute('aria-hidden', !hidden);
      el.sharePanel?.setAttribute('aria-hidden', 'true');
    });

    el.closeTranscript?.addEventListener('click', () => {
      el.transcriptPanel?.setAttribute('aria-hidden', 'true');
    });

    el.shareEpisode?.addEventListener('click', () => {
      const hidden = el.sharePanel?.getAttribute('aria-hidden') === 'true';
      el.sharePanel?.setAttribute('aria-hidden', !hidden);
      el.transcriptPanel?.setAttribute('aria-hidden', 'true');
    });

    el.closeShare?.addEventListener('click', () => {
      el.sharePanel?.setAttribute('aria-hidden', 'true');
    });

    el.copyLinkBtn?.addEventListener('click', () => {
      if (el.shareLink) {
        el.shareLink.select();
        document.execCommand('copy');
        showToast('Link copied to clipboard');
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

    el.grid?.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (!card) return;

      const video = state.videos.find(v => v.id === card.dataset.id);
      if (video) playVideo(video);
    });

    el.retry?.addEventListener('click', init);

    el.heroSave?.addEventListener('click', () => {
      if (state.hero) {
        const index = state.watchLater.findIndex(id => id === state.hero.id);
        if (index === -1) {
          state.watchLater.push(state.hero.id);
          localStorage.setItem(CONFIG.WATCH_LATER_KEY, JSON.stringify(state.watchLater));
          showToast('Saved to Watch Later');
          updateStats();
        } else {
          showToast('Already in Watch Later');
        }
      }
    });

    // Close on Escape or click outside
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
        closeOverlay(el.watchLaterPage);
        closeOverlay(el.dashboardModal);
      }
    });

    window.addEventListener('click', (e) => {
      if (e.target === el.modal) closeModal();
      if (e.target === el.watchLaterPage) closeOverlay(el.watchLaterPage);
      if (e.target === el.dashboardModal) closeOverlay(el.dashboardModal);
    });
  }

  /* ----------------------------
   * INIT
   * ---------------------------- */
  async function init() {
    try {
      if (el.loading) el.loading.style.display = 'grid';
      if (el.error) el.error.style.display = 'none';

      // Apply theme
      if (state.theme === 'light') {
        document.body.className = 'light-mode';
        const icon = el.darkMode?.querySelector('i');
        if (icon) icon.className = 'fa-regular fa-sun';
      }

      state.videos = await loadVideos();
      state.videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      if (state.videos.length > 0) {
        setHero(state.videos[0]);
        render();
        updateStats();
      } else {
        throw new Error('No videos found in the archive.');
      }

      bind();
    } catch (e) {
      if (el.error) el.error.style.display = 'grid';
      if (el.errorMsg) el.errorMsg.textContent = e.message || 'Failed to load archive.';
    } finally {
      if (el.loading) el.loading.style.display = 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
