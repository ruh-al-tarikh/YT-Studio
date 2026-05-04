(function () {
  'use strict';

  /* ----------------------------
   * CONFIG
   * ---------------------------- */
  const CONFIG = {
    API: 'https://yt-proxy.ruhdevopsytstudio.workers.dev',
    CACHE_KEY: 'yt_studio_videos_cache_v4',
    CACHE_EXPIRY: 24 * 60 * 60 * 1000,
    WATCH_LATER_KEY: 'watch_later_list',
    THEME_KEY: 'ui_theme',
    SEARCH_HISTORY_KEY: 'search_history',
    PROGRESS_KEY: 'watch_progress',
    ITEMS_PER_PAGE: 12,

    API_CONFIG: {
      timeout: 10000,
      retries: 3,
      backoff: 1.5,
      delay: 500
    }
  };

  const CATEGORY_RULES = [
    { key: 'quran',       label: 'Quran',       terms: ['quran', 'surah', 'ayah', 'allah', 'tafsir', 'islam'] },
    { key: 'prophecy',    label: 'Prophecy',    terms: ['prophecy', 'dajjal', 'gog', 'magog', 'end times'] },
    { key: 'discussion',  label: 'Discussion',  terms: ['podcast', 'debate', 'interview', 'conversation'] },
    { key: 'educational', label: 'Educational', terms: ['lesson', 'guide', 'explained', 'documentary'] },
    { key: 'history',     label: 'History',     terms: ['history', 'empire', 'caliph', 'war', 'civilization'] }
  ];

  /* ----------------------------
   * DOM CACHE
   * ---------------------------- */
  const $ = (id) => document.getElementById(id);

  const el = {
    body:              document.body,
    grid:              $('grid'),
    modal:             $('modal'),
    player:            $('player'),
    closeModal:        $('close'),
    heroTitle:         $('hero-title'),
    heroDesc:          $('hero-desc'),
    heroSubtitle:      $('hero-subtitle'),
    heroBtn:           $('hero-btn'),
    heroSave:          $('hero-save'),
    heroCategory:      $('hero-category'),
    heroDate:          $('hero-date'),
    search:            $('searchInput'),
    bg:                $('bg'),
    clearSearch:       $('clearSearch'),
    suggestions:       $('searchSuggestions'),
    loadMore:          $('loadMoreBtn'),
    loadMoreContainer: $('loadMoreContainer'),
    loading:           $('loading'),
    error:             $('error'),
    errorMsg:          $('error-msg'),
    retryBtn:          $('retryBtn'),
    toast:             $('toast'),
    themeToggle:       $('darkModeToggle'),
    watchLaterBadge:   $('watchLaterBadge'),
    watchLaterCount:   $('watchLaterCount'),
    watchLaterPage:    $('watchLaterPage'),
    watchLaterContainer: $('watchLaterContainer'),
    closeWatchLater:   $('closeWatchLater'),
    dashboardBtn:      $('dashboardBtn'),
    dashboardModal:    $('dashboardModal'),
    closeDashboard:    $('closeDashboard'),
    chips:             document.querySelectorAll('.chip'),
    resultsMeta:       $('results-meta'),
    statTotal:         $('stat-total'),
    statSaved:         $('stat-saved'),
    statProgress:      $('stat-progress'),
    // Dashboard stats
    dashTotal:         $('dashboard-total'),
    dashSaved:         $('dashboard-saved'),
    dashProgress:      $('dashboard-progress'),
    dashHours:         $('dashboard-hours'),
    dashCategories:    $('dashboardCategories'),
    dashResumeList:    $('dashboardResumeList'),
    // Transcript / Share panels
    toggleTranscript:  $('toggleTranscript'),
    shareEpisode:      $('shareEpisode'),
    transcriptPanel:   $('transcriptPanel'),
    sharePanel:        $('sharePanel'),
    closeTranscript:   $('closeTranscript'),
    closeShare:        $('closeShare'),
    shareLink:         $('shareLink'),
    copyLinkBtn:       $('copyLinkBtn'),
    shareTwitter:      $('shareTwitter'),
    shareFacebook:     $('shareFacebook'),
    shareWhatsApp:     $('shareWhatsApp'),
    scrollToTop:       $('scrollToTop'),
    continueBlock:     $('continue-block'),
    continueRow:       $('continue-row'),
    emptyHistory:      $('empty-history'),
    clearFilters: $('clearFilters')
  };

  /* ----------------------------
   * STATE
   * ---------------------------- */
  const state = {
    videos:        [],
    filtered:      [],
    hero:          null,
    current:       null,
    categories:    ['all'],
    search:        '',
    page:          0,
    watchLater:    JSON.parse(localStorage.getItem(CONFIG.WATCH_LATER_KEY) || '[]'),
    theme:         localStorage.getItem(CONFIG.THEME_KEY) || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'),
    debounceTimer: null,
    searchHistory: JSON.parse(localStorage.getItem(CONFIG.SEARCH_HISTORY_KEY) || '[]'),
    progress: JSON.parse(localStorage.getItem(CONFIG.PROGRESS_KEY) || '{}'),
    ytPlayer: null
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

    formatDate: (d) => {
      try {
        return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' })
          .format(new Date(d));
      } catch (e) {
        return '';
      }
    },

    highlight: (text, query) => {
      if (!query) return text;
      const re = new RegExp(`(${query})`, 'gi');
      return text.replace(re, '<mark>$1</mark>');
    },

    saveLS: (k, v) => {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
    },

    getLS: (k, fallback = null) => {
      try {
        const val = localStorage.getItem(k);
        return val ? JSON.parse(val) : fallback;
      } catch (e) { return fallback; }
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
    return match ? match.key : 'history';
  }

  function categoryLabel(key) {
    const rule = CATEGORY_RULES.find(r => r.key === key);
    return rule ? rule.label : 'History';
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

        if (!res.ok) throw new Error('API Error: ' + res.status + ' ' + res.statusText);
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

    if (cached && cached.data && cached.data.length && Date.now() - cached.time < CONFIG.CACHE_EXPIRY) {
      return cached.data;
    }

    try {
      const res = await fetchWithRetry(CONFIG.API);
      const json = await res.json();

      const videos = (json.videos || []).map(v => ({
        id:          v.id || v.videoId,
        title:       v.title || 'Untitled',
        thumbnail:   v.thumbnail || ('https://i.ytimg.com/vi/' + (v.id || v.videoId) + '/hqdefault.jpg'),
        publishedAt: v.publishedAt || new Date().toISOString(),
        category:    detectCategory(v.title || ''),
        description: v.description || 'Deep dive into Islamic history and theology.'
      }));

      if (videos.length > 0) {
        utils.saveLS(CONFIG.CACHE_KEY, { data: videos, time: Date.now() });
      }
      return videos;
    } catch (err) {
      console.error('Failed to load videos:', err);
      if (cached && cached.data) return cached.data;
      throw err;
    }
  }

  /* ----------------------------
   * MODAL / PLAYER
   * ---------------------------- */

  /* ----------------------------
   * PROGRESS TRACKING
   * ---------------------------- */
  function saveProgress(videoId, time, duration) {
    if (!videoId) return;
    const percent = (time / duration) * 100;
    state.progress[videoId] = { time, duration, percent, updated: Date.now() };
    utils.saveLS(CONFIG.PROGRESS_KEY, state.progress);

    updateStats();
  }

  function getProgress(videoId) {
    return state.progress[videoId] || null;
  }

  function renderContinueWatching() {
    if (!el.continueBlock || !el.continueRow) return;

    const threshold = 5; // 5% minimum progress
    const items = state.videos
      .filter(v => {
        const p = getProgress(v.id);
        return p && p.percent >= threshold && p.percent < 95;
      })
      .sort((a, b) => getProgress(b.id).updated - getProgress(a.id).updated)
      .slice(0, 4);

    if (items.length > 0) {
      el.continueBlock.style.display = 'block';
      el.continueRow.innerHTML = items.map(v => card(v)).join('');
      if (el.emptyHistory) el.emptyHistory.style.display = 'none';
    } else {
      el.continueBlock.style.display = 'none';
      if (el.emptyHistory && state.videos.length > 0) el.emptyHistory.style.display = 'block';
    }
  }

  /* ----------------------------
   * SEARCH SUGGESTIONS
   * ---------------------------- */
  function renderSuggestions(q) {
    if (!el.suggestions) return;
    if (!q || q.length < 2) {
      el.suggestions.style.display = 'none';
      el.suggestions.setAttribute('aria-hidden', 'true');
      return;
    }

    const matches = state.videos
      .filter(v => v.title.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 5);

    if (matches.length > 0) {
      el.suggestions.innerHTML = matches.map(v => `
        <div class="suggestion-item" role="option" data-id="${v.id}">
          <i class="fa-solid fa-magnifying-glass"></i>
          <span>${utils.highlight(v.title, q)}</span>
        </div>
      `).join('');
      el.suggestions.style.display = 'block';
      el.suggestions.setAttribute('aria-hidden', 'false');
    } else {
      el.suggestions.style.display = 'none';
      el.suggestions.setAttribute('aria-hidden', 'true');
    }
  }
function openModal(video) {
    if (!video || !el.modal || !el.player) return;
    state.current = video;

    const startAt = getProgress(video.id)?.time || 0;
    const embedUrl = 'https://www.youtube.com/embed/' + video.id + '?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&start=' + Math.floor(startAt);
    el.player.src = embedUrl;

    // Initialize YT Player API for tracking
    if (window.YT && window.YT.Player) {
      if (state.ytPlayer) {
        state.ytPlayer.destroy();
      }
      state.ytPlayer = new YT.Player('player', {
        events: {
          'onStateChange': (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              const timer = setInterval(() => {
                if (state.ytPlayer && state.ytPlayer.getCurrentTime) {
                  const time = state.ytPlayer.getCurrentTime();
                  const duration = state.ytPlayer.getDuration();
                  if (duration > 0) saveProgress(video.id, time, duration);
                } else {
                  clearInterval(timer);
                }
              }, 5000);
              state.progressTimer = timer;
            } else {
              if (state.progressTimer) clearInterval(state.progressTimer);
            }
          }
        }
      });
    }

    el.modal.style.display = 'flex';
    el.modal.setAttribute('aria-hidden', 'false');
    el.body.style.overflow = 'hidden';
    el.body.classList.add('modal-open');

    const titleEl = $('video-title');
    if (titleEl) titleEl.textContent = video.title;

    // Reset side panels
    if (el.transcriptPanel) el.transcriptPanel.setAttribute('aria-hidden', 'true');
    if (el.sharePanel) el.sharePanel.setAttribute('aria-hidden', 'true');

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
    el.body.classList.remove('modal-open');
    state.current = null;
    if (state.progressTimer) clearInterval(state.progressTimer);
    renderContinueWatching();
    render();
    if (el.transcriptPanel) el.transcriptPanel.setAttribute('aria-hidden', 'true');
    if (el.sharePanel) el.sharePanel.setAttribute('aria-hidden', 'true');
  }

  function navigateEpisode(direction) {
    if (!state.current || !state.filtered.length) return;
    const currentIndex = state.filtered.findIndex((v) => v.id === state.current.id);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = state.filtered.length - 1;
    if (nextIndex >= state.filtered.length) nextIndex = 0;

    openModal(state.filtered[nextIndex]);
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

  function openWatchLater() {
    if (!el.watchLaterPage) return;
    renderWatchLater();
    el.watchLaterPage.style.display = 'block';
    el.watchLaterPage.setAttribute('aria-hidden', 'false');
    el.body.style.overflow = 'hidden';
    el.body.classList.add('modal-open');
  }

  function closeWatchLater() {
    if (!el.watchLaterPage) return;
    el.watchLaterPage.style.display = 'none';
    el.watchLaterPage.setAttribute('aria-hidden', 'true');
    el.body.style.overflow = '';
    el.body.classList.remove('modal-open');
  }

  function renderWatchLater() {
    if (!el.watchLaterContainer) return;
    if (!state.watchLater.length) {
      el.watchLaterContainer.innerHTML = '<div class="empty-state">No episodes saved yet. Click the bookmark icon on any episode to save it.</div>';
      return;
    }
    el.watchLaterContainer.innerHTML = state.watchLater.map(v => {
      const thumb = v.thumbnail || ('https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg');
      return '<div class="card" data-id="' + v.id + '" data-wl="1" role="button" tabindex="0">' +
        '<div class="card-thumb-wrapper">' +
        '<img src="' + thumb + '" alt="' + utils.sanitize(v.title) + '" loading="lazy">' +
        '<button class="watch-later-btn active" data-id="' + v.id + '" aria-label="Remove from Watch Later">' +
        '<i class="fa-solid fa-bookmark"></i>' +
        '</button>' +
        '</div>' +
        '<div class="card-copy">' +
        '<div class="card-title">' + utils.highlight(utils.sanitize(utils.truncate(v.title, 60)), state.search) + '</div>' +
        '<div class="card-meta">' +
        '<span class="card-tag">' + categoryLabel(v.category) + '</span>' +
        '<span>' + utils.formatDate(v.publishedAt) + '</span>' +
        '</div></div></div>';
    }).join('');
  }

  /* ----------------------------
   * DASHBOARD
   * ---------------------------- */
  function openDashboard() {
    if (!el.dashboardModal) return;
    renderDashboard();
    el.dashboardModal.style.display = 'block';
    el.dashboardModal.setAttribute('aria-hidden', 'false');
    el.body.style.overflow = 'hidden';
    el.body.classList.add('modal-open');
  }

  function closeDashboard() {
    if (!el.dashboardModal) return;
    el.dashboardModal.style.display = 'none';
    el.dashboardModal.setAttribute('aria-hidden', 'true');
    el.body.style.overflow = '';
    el.body.classList.remove('modal-open');
  }

  function renderDashboard() {
    if (el.dashTotal) el.dashTotal.textContent = state.videos.length;
    if (el.dashSaved) el.dashSaved.textContent = state.watchLater.length;
    if (el.dashProgress) el.dashProgress.textContent = 0;
    if (el.dashHours) el.dashHours.textContent = (state.videos.length * 0.5).toFixed(1) + 'h';

    const panels = document.querySelector('.dashboard-panels');
    if (state.videos.length === 0) {
      if (panels) panels.style.display = 'none';

      let emptyState = document.getElementById('dashboard-empty');
      if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.id = 'dashboard-empty';
        emptyState.className = 'dashboard-empty-state';
        emptyState.innerHTML = `
          <i class="fa-solid fa-cloud-arrow-up" aria-hidden="true"></i>
          <h4>No Channel Connected</h4>
          <p>Connect your YouTube channel to sync your archive, track progress, and unlock personalized insights.</p>
          <button type="button" class="connect-btn" aria-label="Connect YouTube Channel">
            <i class="fa-brands fa-youtube" aria-hidden="true"></i>
            Connect Channel
          </button>
        `;
        const content = document.querySelector('.dashboard-content');
        if (content) content.appendChild(emptyState);

        const btn = emptyState.querySelector('.connect-btn');
        if (btn) btn.addEventListener('click', () => utils.showToast('Channel connection coming soon!'));
      }
      emptyState.style.display = 'flex';
      return;
    } else {
      if (panels) panels.style.display = 'grid';
      const emptyState = document.getElementById('dashboard-empty');
      if (emptyState) emptyState.style.display = 'none';
    }

    if (el.dashCategories) {
      const counts = {};
      state.videos.forEach(v => {
        counts[v.category] = (counts[v.category] || 0) + 1;
      });
      el.dashCategories.innerHTML = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([key, count]) =>
          '<div class="dashboard-list-row">' +
          '<span>' + categoryLabel(key) + '</span>' +
          '<strong>' + count + '</strong>' +
          '</div>'
        ).join('') || '<p style="color:var(--text-soft)">No data yet.</p>';
    }

    if (el.dashResumeList) {
      el.dashResumeList.innerHTML = state.watchLater.length
        ? state.watchLater.slice(0, 5).map(v =>
            '<div class="dashboard-list-row">' +
            '<span>' + utils.sanitize(utils.truncate(v.title, 40)) + '</span>' +
            '<strong>' + categoryLabel(v.category) + '</strong>' +
            '</div>'
          ).join('')
        : '<p style="color:var(--text-soft)">No saved episodes.</p>';
    }
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
    const icon = el.themeToggle ? el.themeToggle.querySelector('i') : null;
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
   * RENDER GRID
   * ---------------------------- */
  function card(v) {
    const isSaved = state.watchLater.some(s => s.id === v.id);
    const thumb = v.thumbnail || ('https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg');
    return '<div class="card" data-id="' + v.id + '" role="button" tabindex="0">' +
      '<div class="card-thumb-wrapper">' +
      '<img src="' + thumb + '" alt="' + utils.sanitize(v.title) + '" loading="lazy">' +
      '<div class="card-thumb-overlay"><i class="fa-solid fa-play play-icon"></i></div>' +
      '<div class="duration-badge">HD</div>' +
      (getProgress(v.id) ? '<div class="progress-bar-container"><div class="progress-bar-fill" style="width:' + getProgress(v.id).percent + '%"></div></div>' : '') +
      '<button class="watch-later-btn ' + (isSaved ? 'active' : '') + '" data-id="' + v.id + '" aria-label="Save for later">' +
      '<i class="fa-' + (isSaved ? 'solid' : 'regular') + ' fa-bookmark"></i>' +
      '</button>' +
      '</div>' +
      '<div class="card-copy">' +
      '<div class="card-title">' + utils.highlight(utils.sanitize(utils.truncate(v.title, 60)), state.search) + '</div>' +
      '<div class="card-meta">' +
      '<span class="card-tag">' + categoryLabel(v.category) + '</span>' +
      '<span>' + utils.formatDate(v.publishedAt) + '</span>' +
      '</div></div></div>';
  }

  function render() {
    const q = state.search.toLowerCase();

    state.filtered = state.videos.filter(v => {
      const matchCat = state.categories.includes('all') || state.categories.includes(v.category);
      const matchSearch = !q || v.title.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

        if (el.clearFilters) {
      el.clearFilters.style.display = state.categories.includes('all') ? 'none' : 'inline-flex';
    }
if (el.resultsMeta) {
      el.resultsMeta.textContent = state.filtered.length + ' episode' + (state.filtered.length === 1 ? '' : 's') + ' found';
    }

    const slice = state.filtered.slice(0, CONFIG.ITEMS_PER_PAGE * (state.page + 1));

    if (el.grid) {
      if (state.filtered.length === 0) {
        el.grid.innerHTML = `
          <div class="empty-state-card" style="grid-column: 1 / -1; margin-top: 40px;">
            <i class="fa-solid fa-magnifying-glass"></i>
            <h3>No results found</h3>
            <p>Try different keywords or browse by category to find what you're looking for.</p>
            <button type="button" class="secondary-button" style="margin-top: 20px;" onclick="document.getElementById('searchInput').value=''; document.getElementById('searchInput').dispatchEvent(new Event('input'));">
              Clear Search
            </button>
          </div>
        `;
      } else {
        el.grid.innerHTML = slice.map(card).join('');
      }
    }

    if (el.loadMoreContainer) {
      el.loadMoreContainer.style.display = slice.length < state.filtered.length ? 'block' : 'none';
    }
  }

  /* ----------------------------
   * STATS
   * ---------------------------- */
  function updateStats() {
    if (el.statTotal) el.statTotal.textContent = state.videos.length;
    if (el.statSaved) el.statSaved.textContent = state.watchLater.length;
    if (el.statProgress) el.statProgress.textContent = Object.keys(state.progress).length;
    if (el.watchLaterCount) el.watchLaterCount.textContent = state.watchLater.length;
  }

  /* ----------------------------
   * HERO
   * ---------------------------- */
  function setHero(v) {
    state.hero = v;
    if (!v || !el.heroTitle) return;

    el.heroTitle.textContent = v.title;
    if (el.heroDesc) el.heroDesc.textContent = v.description || '';
    if (el.heroCategory) el.heroCategory.textContent = categoryLabel(v.category);
    if (el.heroDate) el.heroDate.textContent = utils.formatDate(v.publishedAt);
    if (el.bg) el.bg.style.backgroundImage = 'url(' + v.thumbnail + ')';

    const isSaved = state.watchLater.some(s => s.id === v.id);
    if (el.heroSave) {
      el.heroSave.innerHTML =
        '<i class="fa-' + (isSaved ? 'solid' : 'regular') + ' fa-bookmark" aria-hidden="true"></i>' +
        ' <span>' + (isSaved ? 'Saved' : 'Save') + '</span>';
    }

    // Update highlight cards
    const latestTitle = $('highlight-latest-title');
    const latestCopy  = $('highlight-latest-copy');
    if (latestTitle) latestTitle.textContent = utils.truncate(v.title, 60);
    if (latestCopy)  latestCopy.textContent  = utils.formatDate(v.publishedAt);
  }

  /* ----------------------------
   * SHARE
   * ---------------------------- */
  function openSharePanel(video) {
    if (!el.sharePanel || !video) return;
    if (el.shareLink) el.shareLink.value = 'https://www.youtube.com/watch?v=' + video.id;
    el.sharePanel.setAttribute('aria-hidden', 'false');
    if (el.transcriptPanel) el.transcriptPanel.setAttribute('aria-hidden', 'true');
  }

  function closeSharePanel() {
    if (el.sharePanel) el.sharePanel.setAttribute('aria-hidden', 'true');
  }

  function openTranscriptPanel() {
    if (!el.transcriptPanel) return;
    el.transcriptPanel.setAttribute('aria-hidden', 'false');
    if (el.sharePanel) el.sharePanel.setAttribute('aria-hidden', 'true');
  }

  function closeTranscriptPanel() {
    if (el.transcriptPanel) el.transcriptPanel.setAttribute('aria-hidden', 'true');
  }

  /* ----------------------------
   * EVENTS
   * ---------------------------- */
  function bind() {
    // Search input
    if (el.search) {
      el.search.addEventListener('input', (e) => {
        state.search = e.target.value;
        state.page = 0;
        if (el.clearSearch) el.clearSearch.style.display = state.search ? 'block' : 'none';
        renderSuggestions(state.search);
        clearTimeout(state.debounceTimer);
        state.debounceTimer = setTimeout(() => {
          state.page = 0;
          render();
        }, 250);
      });

      // Close suggestions on blur
      document.addEventListener('click', (e) => {
        if (el.suggestions && !el.search.contains(e.target) && !el.suggestions.contains(e.target)) {
          el.suggestions.style.display = 'none';
          el.suggestions.setAttribute('aria-hidden', 'true');
        }
      });

      // Suggestion click
      if (el.suggestions) {
        el.suggestions.addEventListener('click', (e) => {
          const item = e.target.closest('.suggestion-item');
          if (item) {
            const id = item.dataset.id;
            const video = state.videos.find(v => v.id === id);
            if (video) {
              el.search.value = video.title;
              state.search = video.title;
              el.suggestions.style.display = 'none';
              openModal(video);
            }
          }
        });
      }
    }

    // Clear search
    if (el.clearSearch) {
      el.clearSearch.addEventListener('click', () => {
        if (el.search) el.search.value = '';
        state.search = '';
        state.page = 0;
        el.clearSearch.style.display = 'none';
        render();
      });
    }

    // Filter chips (event delegation on container for reliability)
        if (el.clearFilters) {
      el.clearFilters.addEventListener('click', () => {
        state.categories = ['all'];
        document.querySelectorAll('.chip').forEach(c => {
          if (c.dataset.cat === 'all') c.classList.add('active');
          else c.classList.remove('active');
        });
        state.page = 0;
        render();
      });
    }
const filterChips = document.querySelector('.filter-chips');
    if (filterChips) {
      filterChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;

        const cat = chip.dataset.cat;
        if (cat === 'all') {
          state.categories = ['all'];
        } else {
          // Remove 'all' if it's there
          state.categories = state.categories.filter(c => c !== 'all');

          if (state.categories.includes(cat)) {
            state.categories = state.categories.filter(c => c !== cat);
            if (state.categories.length === 0) state.categories = ['all'];
          } else {
            state.categories.push(cat);
          }
        }

        // Update UI
        document.querySelectorAll('.chip').forEach(c => {
          if (state.categories.includes(c.dataset.cat)) {
            c.classList.add('active');
          } else {
            c.classList.remove('active');
          }
        });

        state.page = 0;
        render();
      });
    }

    // Theme toggle
    if (el.themeToggle) el.themeToggle.addEventListener('click', toggleTheme);

    // Hero buttons
    if (el.heroBtn) {
      el.heroBtn.addEventListener('click', () => {
        if (state.hero) openModal(state.hero);
      });
    }

    if (el.heroSave) {
      el.heroSave.addEventListener('click', () => {
        if (state.hero) {
          toggleWatchLater(state.hero);
          setHero(state.hero);
        }
      });
    }

    // Modal close
    if (el.closeModal) el.closeModal.addEventListener('click', closeModal);

    if (el.modal) {
      el.modal.addEventListener('click', (e) => {
        if (e.target === el.modal) closeModal();
      });
    }

    // Video grid - event delegation
    if (el.grid) {
      el.grid.addEventListener('click', (e) => {
        const saveBtn = e.target.closest('.watch-later-btn');
        if (saveBtn) {
          e.stopPropagation();
          const id = saveBtn.dataset.id;
          const video = state.videos.find(v => v.id === id);
          if (video) {
            toggleWatchLater(video);
            render();
            if (state.hero && state.hero.id === id) setHero(state.hero);
          }
          return;
        }

        const cardEl = e.target.closest('.card');
        if (cardEl) {
          const id = cardEl.dataset.id;
          const video = state.videos.find(v => v.id === id);
          if (video) openModal(video);
        }
      });

      el.grid.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const cardEl = e.target.closest('.card');
          if (cardEl) {
            e.preventDefault();
            const id = cardEl.dataset.id;
            const video = state.videos.find(v => v.id === id);
            if (video) openModal(video);
          }
        }
      });
    }

    // Load more
    if (el.loadMore) {
      el.loadMore.addEventListener('click', () => {
        state.page++;
        render();
      });
    }

    // Watch Later badge opens overlay
    if (el.watchLaterBadge) el.watchLaterBadge.addEventListener('click', openWatchLater);
    if (el.closeWatchLater) el.closeWatchLater.addEventListener('click', closeWatchLater);

    if (el.watchLaterPage) {
      el.watchLaterPage.addEventListener('click', (e) => {
        if (e.target === el.watchLaterPage) closeWatchLater();

        const saveBtn = e.target.closest('.watch-later-btn');
        if (saveBtn) {
          e.stopPropagation();
          const id = saveBtn.dataset.id;
          const video = state.watchLater.find(v => v.id === id);
          if (video) {
            toggleWatchLater(video);
            renderWatchLater();
            render();
          }
          return;
        }

        const cardEl = e.target.closest('.card');
        if (cardEl) {
          const id = cardEl.dataset.id;
          const video = state.watchLater.find(v => v.id === id) || state.videos.find(v => v.id === id);
          if (video) {
            closeWatchLater();
            openModal(video);
          }
        }
      });
    }

    // Dashboard
    if (el.dashboardBtn) el.dashboardBtn.addEventListener('click', openDashboard);
    if (el.closeDashboard) el.closeDashboard.addEventListener('click', closeDashboard);
    if (el.dashboardModal) {
      el.dashboardModal.addEventListener('click', (e) => {
        if (e.target === el.dashboardModal) closeDashboard();
      });
    }

    // Transcript panel
    if (el.toggleTranscript) {
      el.toggleTranscript.addEventListener('click', () => {
        const isHidden = el.transcriptPanel && el.transcriptPanel.getAttribute('aria-hidden') === 'true';
        if (isHidden) openTranscriptPanel();
        else closeTranscriptPanel();
      });
    }
    if (el.closeTranscript) el.closeTranscript.addEventListener('click', closeTranscriptPanel);

    // Share panel
    if (el.shareEpisode) {
      el.shareEpisode.addEventListener('click', () => {
        const isHidden = el.sharePanel && el.sharePanel.getAttribute('aria-hidden') === 'true';
        if (isHidden) openSharePanel(state.current);
        else closeSharePanel();
      });
    }
    if (el.closeShare) el.closeShare.addEventListener('click', closeSharePanel);

    // Copy link
    if (el.copyLinkBtn && el.shareLink) {
      el.copyLinkBtn.addEventListener('click', () => {
        el.shareLink.select();
        try {
          navigator.clipboard.writeText(el.shareLink.value).then(() => {
            utils.showToast('Link copied!');
          }).catch(() => {
            document.execCommand('copy');
            utils.showToast('Link copied!');
          });
        } catch (e) {
          document.execCommand('copy');
          utils.showToast('Link copied!');
        }
      });
    }

    // Social share
    if (el.shareTwitter) {
      el.shareTwitter.addEventListener('click', () => {
        if (!state.current) return;
        const url = encodeURIComponent('https://www.youtube.com/watch?v=' + state.current.id);
        const text = encodeURIComponent(state.current.title);
        window.open('https://twitter.com/intent/tweet?url=' + url + '&text=' + text, '_blank', 'noopener');
      });
    }

    if (el.shareFacebook) {
      el.shareFacebook.addEventListener('click', () => {
        if (!state.current) return;
        const url = encodeURIComponent('https://www.youtube.com/watch?v=' + state.current.id);
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank', 'noopener');
      });
    }

    if (el.shareWhatsApp) {
      el.shareWhatsApp.addEventListener('click', () => {
        if (!state.current) return;
        const url = encodeURIComponent('https://www.youtube.com/watch?v=' + state.current.id);
        const text = encodeURIComponent(state.current.title + ' ');
        window.open('https://wa.me/?text=' + text + url, '_blank', 'noopener');
      });
    }

    // Retry button
    if (el.retryBtn) el.retryBtn.addEventListener('click', init);

    // Scroll to Top
    if (el.scrollToTop) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 500) el.scrollToTop.classList.add('show');
        else el.scrollToTop.classList.remove('show');
      });
      el.scrollToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') e.target.blur();
        return;
      }

      const key = e.key.toLowerCase();

      if (key === '/') {
        e.preventDefault();
        if (el.search) el.search.focus();
        return;
      }

      if (key === 'escape') {
        closeModal();
        closeWatchLater();
        closeDashboard();
        const hints = $('keyboardHints');
        if (hints) {
          hints.setAttribute('aria-hidden', 'true');
          el.body.style.overflow = '';
    el.body.classList.remove('modal-open');
        }
        return;
      }

      if (key === '?') {
        const hintsModal = $('keyboardHints');
        if (hintsModal) {
          const isHidden = hintsModal.getAttribute('aria-hidden') === 'true';
          hintsModal.setAttribute('aria-hidden', isHidden ? 'false' : 'true');
          el.body.style.overflow = isHidden ? 'hidden' : '';
        }
        return;
      }

      if (key === 't') {
        toggleTheme();
        return;
      }

      if (state.current) {
        if (key === 'j') {
          navigateEpisode(-1);
          return;
        }
        if (key === 'k') {
          navigateEpisode(1);
          return;
        }
      }
    });

    // Close keyboard hints
    const closeHints = $('closeHints');
    if (closeHints) {
      closeHints.addEventListener('click', () => {
        const hints = $('keyboardHints');
        if (hints) hints.setAttribute('aria-hidden', 'true');
        el.body.style.overflow = '';
    el.body.classList.remove('modal-open');
      });
    }

    const keyboardHints = $('keyboardHints');
    if (keyboardHints) {
      keyboardHints.addEventListener('click', (e) => {
        if (e.target === keyboardHints) {
          keyboardHints.setAttribute('aria-hidden', 'true');
          el.body.style.overflow = '';
    el.body.classList.remove('modal-open');
        }
      });
    }
  }

  /* ----------------------------
   * INIT
   * ---------------------------- */
  function renderSkeletons() {
    if (!el.grid) return;
    const skeletons = Array(6).fill(0).map(() => `
      <div class="skeleton-card animate-pulse">
        <div class="skeleton skeleton-thumb"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text short"></div>
      </div>
    `).join('');
    el.grid.innerHTML = skeletons;
  }

  async function init() {
    try {
      if (el.error) el.error.style.display = 'none';
      renderSkeletons();

      applyTheme();
      state.videos = await loadVideos();
      state.videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      if (state.videos.length > 0) {
        setHero(state.videos[0]);
        render();
        renderContinueWatching();
        updateStats();
      } else {
        throw new Error('No videos available in the archive.');
      }

      bind();
    } catch (e) {
      if (el.error) el.error.style.display = 'block';
      if (el.errorMsg) el.errorMsg.textContent = e.message || 'Connection failed. Please try again.';
      console.error('Init Error:', e);
      // Still bind so retry button works
      bind();
    } finally {
      if (el.loading) el.loading.style.display = 'none';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
