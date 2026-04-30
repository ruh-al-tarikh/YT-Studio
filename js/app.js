(function () {
  'use strict';

  /* ----------------------------
   * CONFIG
   * ---------------------------- */
  const CONFIG = {
    API: 'https://yt-proxy.ruhdevopsytstudio.workers.dev',
    CACHE_KEY: 'yt_studio_videos_cache',
    CACHE_EXPIRY: 24 * 60 * 60 * 1000,
    PROGRESS_KEY: 'watch_progress',
    LAST_PLAYED_KEY: 'last_played_video',
    WATCH_LATER_KEY: 'watch_later',
    THEME_KEY: 'ui_theme',
    SEARCH_HISTORY_KEY: 'search_history',
    BOOKMARKS_KEY: 'video_bookmarks',
    ITEMS_PER_PAGE: 12,
    ASSUMED_DURATION: 600,

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
    heroTitle: $('hero-title'),
    heroSubtitle: $('hero-subtitle'),
    heroBtn: $('hero-btn'),
    heroSave: $('hero-save-btn'),
    search: $('searchInput'),
    suggestions: $('searchSuggestions'),
    loadMore: $('loadMoreBtn'),
    loading: $('loading-state'),
    error: $('error-container'),
    errorMsg: $('error-message'),
    toast: $('toast'),
    bg: $('bg')
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
    bookmarks: JSON.parse(localStorage.getItem(CONFIG.BOOKMARKS_KEY) || '{}'),
    theme: 'dark',
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
      description: v.description || ''
    }));

    utils.saveLS(CONFIG.CACHE_KEY, { data: videos, time: Date.now() });
    return videos;
  }

  /* ----------------------------
   * RENDER
   * ---------------------------- */
  function card(v) {
    return `
      <div class="card" data-id="${v.id}">
        <img src="${v.thumbnail}" />
        <div class="title">${utils.sanitize(utils.truncate(v.title, 80))}</div>
        <div class="meta">${categoryLabel(v.category)} • ${utils.formatDate(v.publishedAt)}</div>
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
    el.grid.innerHTML = slice.map(card).join('');

    el.loadMore.style.display =
      slice.length < state.filtered.length ? 'block' : 'none';
  }

  /* ----------------------------
   * HERO
   * ---------------------------- */
  function setHero(v) {
    state.hero = v;
    if (!v) return;

    el.heroTitle.textContent = v.title;
    el.heroSubtitle.textContent = v.description;
    el.bg.style.backgroundImage = `url(${v.thumbnail})`;
  }

  /* ----------------------------
   * EVENTS
   * ---------------------------- */
  function bind() {
    el.search?.addEventListener('input', (e) => {
      state.search = e.target.value;
      clearTimeout(state.debounceTimer);
      state.debounceTimer = setTimeout(render, 250);
    });

    el.loadMore?.addEventListener('click', () => {
      state.page++;
      render();
    });

    document.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (!card) return;

      const video = state.videos.find(v => v.id === card.dataset.id);
      if (video) setHero(video);
    });
  }

  /* ----------------------------
   * INIT
   * ---------------------------- */
  async function init() {
    try {
      el.loading.style.display = 'block';

      state.videos = await loadVideos();
      state.videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      setHero(state.videos[0]);
      render();
      bind();
    } catch (e) {
      el.error.style.display = 'block';
      el.errorMsg.textContent = e.message;
    } finally {
      el.loading.style.display = 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();