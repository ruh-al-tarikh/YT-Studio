import { DeepSearch } from './search.js';
import { initScriptStudio } from './script.js';
import { initIslamic } from './islamic.js';

(function() {
  'use strict';

  const CONFIG = {
    API: '/api/videos',
    FALLBACK_DATA: 'public/data/demo.json',
    CACHE_KEY: 'yt_studio_cache_v2',
    CACHE_EXPIRY: 3600000,
    THEME_KEY: 'yt_studio_theme',
    CHANNEL_KEY: 'yt_studio_channel_id',
    ITEMS_PER_PAGE: 8
  };

  const state = {
    videos: [],
    filtered: [],
    watchLater: JSON.parse(localStorage.getItem('yt_studio_watch_later') || '[]'),
    page: 0,
    category: 'all',
    search: '',
    theme: localStorage.getItem(CONFIG.THEME_KEY) || 'dark',
    current: null,
    isPlaying: false,
    isMuted: false,
    hero: null,
    debounceTimer: null
  };

  const el = {
    body: document.body,
    grid: document.getElementById('grid') || document.getElementById('archives-container') || document.getElementById('watchLaterContainer'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    errorMsg: document.getElementById('error-msg'),
    search: document.getElementById('search'),
    resultsMeta: document.getElementById('results-meta'),
    modal: document.getElementById('modal'),
    player: document.getElementById('player'),
    closeModal: document.getElementById('close'),
    themeToggle: document.getElementById('darkModeToggle'),
    heroSection: document.querySelector('.identity-hero'),
    appRoot: document.getElementById('app-root'),
    studioRoot: document.getElementById('studio-root'),
    modeBtns: document.querySelectorAll('.mode-btn'),
    activeProjectView: document.getElementById('active-project-view'),
    studioViews: document.querySelectorAll('.studio-view'),
    newProjectBtn: document.getElementById('newProjectBtn'),
    startScriptBtn: document.getElementById('startScriptBtn'),
    backToProjectsBtn: document.getElementById('backToProjectsBtn'),
    projectTabBtns: document.querySelectorAll('.project-tab-btn'),
    ptabContents: document.querySelectorAll('.ptab-content'),
    studioNavBtns: document.querySelectorAll('.studio-nav-btn'),
    transcriptContent: document.getElementById('transcriptContent'),
    geoBrowseBtn: document.getElementById('geoBrowseBtn')
  };

  const utils = {
    sanitize: str => str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])),
    truncate: (str, len) => str.length > len ? str.substring(0, len) + '...' : str,
    formatDate: d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    saveLS: (key, val) => localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val)),
    getLS: key => {
        const val = localStorage.getItem(key);
        try { return JSON.parse(val); } catch(e) { return val; }
    }
  };

  async function loadVideos() {
    const cached = utils.getLS(CONFIG.CACHE_KEY);
    if (cached && (Date.now() - cached.time < CONFIG.CACHE_EXPIRY)) return cached.data;

    try {
        const channelId = localStorage.getItem(CONFIG.CHANNEL_KEY);
        const url = channelId ? `${CONFIG.API}?channelId=${channelId}` : CONFIG.API;
        const resp = await fetch(url);
        const data = await resp.json();
        const videos = data.videos || [];
        utils.saveLS(CONFIG.CACHE_KEY, { data: videos, time: Date.now() });
        return videos;
    } catch(e) {
        const resp = await fetch(CONFIG.FALLBACK_DATA);
        const data = await resp.json();
        return data.videos || [];
    }
  }

  function render() {
    const query = state.search.toLowerCase();

    if (query.length >= 2) {
        state.filtered = DeepSearch.search(query);
    } else {
        state.filtered = state.videos.filter(v => {
            const matchCat = state.category === 'all' || v.category === state.category;
            return matchCat;
        });
    }

    if (el.grid) {
        el.grid.innerHTML = state.filtered.slice(0, CONFIG.ITEMS_PER_PAGE * (state.page + 1)).map(v => `
            <div class="card studio-card" data-id="${v.videoId || v.id}">
                <div class="card-thumb">
                    <img src="${v.thumbnail}" alt="${v.title}" loading="lazy">
                    <div class="card-overlay">
                        <button class="watch-later-btn" data-id="${v.videoId || v.id}">
                            <i class="${state.watchLater.some(s => (s.id || s.videoId) === (v.id || v.videoId)) ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <h3 class="card-title">${utils.truncate(v.title, 50)}</h3>
                    <div class="card-meta">
                        <span>${utils.formatDate(v.publishedAt)}</span>
                        <span class="card-tag">${v.category || 'History'}</span>
                    </div>
                    ${v.snippet ? `<p class="kwic-snippet text-xs text-soft mt-2">${v.snippet}</p>` : ""}
                </div>
            </div>
        `).join('');
    }
    if (el.resultsMeta) el.resultsMeta.textContent = `${state.filtered.length} episodes found`;
  }

  function openPlayer(v) {
    state.current = v;
    const id = v.videoId || v.id;
    el.player.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
    el.modal.style.display = 'flex';
    el.modal.setAttribute('aria-hidden', 'false');

    if (el.transcriptContent) {
        if (v.transcript) {
            const lines = v.transcript.split('\n').map((line, i) => `
                <p class="transcript-line" data-index="${i}">${line}</p>
            `).join('');
            el.transcriptContent.innerHTML = lines;
            el.transcriptContent.querySelectorAll('.transcript-line').forEach(line => {
                line.addEventListener('click', () => {
                    el.transcriptContent.querySelectorAll('.transcript-line').forEach(l => l.classList.remove('active'));
                    line.classList.add('active');
                });
            });
        } else {
            el.transcriptContent.innerHTML = '<p class="text-soft">Transcript not available.</p>';
        }
    }
  }

  function switchStudioView(viewId) {
    el.studioViews.forEach(v => v.style.display = 'none');
    el.activeProjectView.style.display = 'none';
    const target = document.getElementById(viewId);
    if (target) target.style.display = 'block';
  }

  function openProject() {
    el.studioViews.forEach(v => v.style.display = 'none');
    el.activeProjectView.style.display = 'block';
    initScriptStudio();
    initIslamic();
  }

  function bind() {
    el.search?.addEventListener('input', (e) => {
        state.search = e.target.value;
        clearTimeout(state.debounceTimer);
        state.debounceTimer = setTimeout(() => {
            state.page = 0;
            render();
        }, 300);
    });

    el.grid?.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (card) {
            const id = card.dataset.id;
            const video = state.videos.find(v => (v.id || v.videoId) === id);
            if (video) openPlayer(video);
        }
    });

    el.closeModal?.addEventListener('click', () => {
        el.player.src = '';
        el.modal.style.display = 'none';
    });

    el.modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            el.modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (mode === 'creator') {
                el.appRoot.style.display = 'none';
                el.studioRoot.style.display = 'block';
            } else {
                el.appRoot.style.display = 'block';
                el.studioRoot.style.display = 'none';
            }
        });
    });

    el.startScriptBtn?.addEventListener('click', () => {
        const cBtn = Array.from(el.modeBtns).find(b => b.dataset.mode === 'creator');
        cBtn?.click();
        openProject();
    });

    el.newProjectBtn?.addEventListener('click', openProject);
    el.backToProjectsBtn?.addEventListener('click', () => switchStudioView('studio-view-projects'));

    el.studioNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            el.studioNavBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            switchStudioView(`studio-view-${btn.dataset.tab}`);
            if (btn.dataset.tab === 'islamic') initIslamic();
        });
    });

    el.projectTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            el.projectTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            el.ptabContents.forEach(c => c.classList.remove('active'));
            const target = document.getElementById(`ptab-${btn.dataset.ptab}`);
            if (target) target.classList.add('active');
        });
    });

    const mapModal = document.getElementById('mapModal');
    el.geoBrowseBtn?.addEventListener('click', () => mapModal.style.display = 'flex');
    document.getElementById('closeMap')?.addEventListener('click', () => mapModal.style.display = 'none');
  }

  async function init() {
    state.videos = await loadVideos();
    DeepSearch.init(state.videos);
    render();
    bind();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
  }

  init();
})();
