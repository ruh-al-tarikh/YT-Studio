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
/**
 * YT Studio - Main Application
 * YouTube API V3 Integration via Cloudflare Worker
 * Version: 2.0.0
 */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    // API Endpoints
    API: {
        YOUTUBE_WORKER: 'https://yt-studio-youtube-api.ruhdevopsytstudio.workers.dev',
        FALLBACK_DATA: '/data/demo.json'
    },
    
    // Storage Keys
    STORAGE: {
        CHANNEL_KEY: 'yt_studio_channel_id',
        CACHE_KEY: 'yt_studio_videos_cache_v4',
        CACHE_EXPIRY: 86400000, // 24 hours
        PROJECTS_KEY: 'yt_studio_projects',
        RESEARCH_KEY: 'yt_studio_research',
        WATCH_LATER_KEY: 'watch_later_list',
        THEME_KEY: 'ui_theme',
        SEARCH_HISTORY_KEY: 'search_history',
        PROGRESS_KEY: 'watch_progress'
    },
    
    // UI Settings
    UI: {
        ITEMS_PER_PAGE: 15,
        LAZY_LOAD_THRESHOLD: 400
    },
    
    // API Retry Config
    API_CONFIG: {
        timeout: 10000,
        retries: 3,
        backoff: 1.5,
        delay: 500
    }
};

// ============================================
// CATEGORIES
// ============================================
const CATEGORIES = [
    { key: 'quran', label: 'Quran', terms: ['quran', 'surah', 'ayah', 'allah', 'tafsir', 'islam'] },
    { key: 'prophecy', label: 'Prophecy', terms: ['prophecy', 'dajjal', 'gog', 'magog', 'end times'] },
    { key: 'discussion', label: 'Discussion', terms: ['podcast', 'debate', 'interview', 'conversation'] },
    { key: 'educational', label: 'Educational', terms: ['lesson', 'guide', 'explained', 'documentary'] },
    { key: 'history', label: 'History', terms: ['history', 'empire', 'caliph', 'war', 'civilization'] }
];

// ============================================
// DOM ELEMENTS
// ============================================
const DOM = {
    // Core elements
    body: document.body,
    grid: document.getElementById('grid'),
    modal: document.getElementById('modal'),
    player: document.getElementById('player'),
    closeModal: document.getElementById('close'),
    
    // Hero section
    heroTitle: document.getElementById('hero-title'),
    heroDesc: document.getElementById('hero-desc'),
    heroSubtitle: document.getElementById('hero-subtitle'),
    heroBtn: document.getElementById('hero-btn'),
    heroSave: document.getElementById('hero-save'),
    heroCategory: document.getElementById('hero-category'),
    heroDate: document.getElementById('hero-date'),
    
    // Search
    search: document.getElementById('searchInput'),
    clearSearch: document.getElementById('clearSearch'),
    suggestions: document.getElementById('searchSuggestions'),
    
    // Pagination
    loadMore: document.getElementById('loadMoreBtn'),
    loadMoreContainer: document.getElementById('loadMoreContainer'),
    
    // Status
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    errorMsg: document.getElementById('error-msg'),
    retryBtn: document.getElementById('retryBtn'),
    toast: document.getElementById('toast'),
    
    // Theme
    themeToggle: document.getElementById('darkModeToggle'),
    
    // Mobile
    mobileToggle: document.getElementById('mobileMenuToggle'),
    mobileNav: document.getElementById('mobileNav'),
    
    // Watch Later
    watchLaterBadge: document.getElementById('watchLaterBadge'),
    watchLaterCount: document.getElementById('watchLaterCount'),
    watchLaterPage: document.getElementById('watchLaterPage'),
    watchLaterContainer: document.getElementById('watchLaterContainer'),
    closeWatchLater: document.getElementById('closeWatchLater'),
    
    // Dashboard
    dashboardBtn: document.getElementById('dashboardBtn'),
    dashboardModal: document.getElementById('dashboardModal'),
    closeDashboard: document.getElementById('closeDashboard'),
    
    // Stats
    resultsMeta: document.getElementById('results-meta'),
    statTotal: document.getElementById('stat-total'),
    statSaved: document.getElementById('stat-saved'),
    statProgress: document.getElementById('stat-progress'),
    dashTotal: document.getElementById('dashboard-total'),
    dashSaved: document.getElementById('dashboard-saved'),
    dashProgress: document.getElementById('dashboard-progress'),
    dashHours: document.getElementById('dashboard-hours'),
    dashCategories: document.getElementById('dashboardCategories'),
    dashResumeList: document.getElementById('dashboardResumeList'),
    
    // Transcript & Share
    toggleTranscript: document.getElementById('toggleTranscript'),
    shareEpisode: document.getElementById('shareEpisode'),
    transcriptPanel: document.getElementById('transcriptPanel'),
    sharePanel: document.getElementById('sharePanel'),
    closeTranscript: document.getElementById('closeTranscript'),
    closeShare: document.getElementById('closeShare'),
    shareLink: document.getElementById('shareLink'),
    copyLinkBtn: document.getElementById('copyLinkBtn'),
    shareTwitter: document.getElementById('shareTwitter'),
    shareFacebook: document.getElementById('shareFacebook'),
    shareWhatsApp: document.getElementById('shareWhatsApp'),
    
    // Scroll
    scrollToTop: document.getElementById('scrollToTop'),
    
    // Blocks
    continueBlock: document.getElementById('continue-block'),
    continueRow: document.getElementById('continue-row'),
    emptyHistory: document.getElementById('empty-history'),
    clearFilters: document.getElementById('clearFilters'),
    trendingRow: document.getElementById('trending-row'),
    recommendedRow: document.getElementById('recommended-row'),
    
    // Studio Mode
    modeSwitcher: document.getElementById('modeSwitcher'),
    modeBtns: document.querySelectorAll('.mode-btn'),
    studioRoot: document.getElementById('studio-root'),
    appRoot: document.getElementById('app-root'),
    heroSection: document.getElementById('hero'),
    continueBlockSec: document.getElementById('continue-block'),
    trendingBlockSec: document.getElementById('trending-block'),
    recommendedBlockSec: document.getElementById('recommended-block'),
    
    // Studio Navigation
    studioNavBtns: document.querySelectorAll('.studio-nav-btn'),
    studioViews: document.querySelectorAll('.studio-view'),
    studioBreadcrumbs: document.getElementById('studioBreadcrumbs'),
    
    // Projects
    projectTabBtns: document.querySelectorAll('.project-tab-btn'),
    ptabContents: document.querySelectorAll('.ptab-content'),
    newProjectBtn: document.getElementById('newProjectBtn'),
    backToProjectsBtn: document.getElementById('backToProjectsBtn'),
    activeProjectView: document.getElementById('active-project-view'),
    studioViewProjects: document.getElementById('studio-view-projects'),
    
    // Channel
    channelInput: document.getElementById('channelIdInput'),
    connectBtn: document.getElementById('connectChannelBtn'),
    
    // Chips
    chips: document.querySelectorAll('.chip'),
    
    // Background
    bg: document.getElementById('bg'),
    
    // Filters
    clearFiltersBtn: document.getElementById('clearFilters')
};

// ============================================
// APPLICATION STATE
// ============================================
const AppState = {
    videos: [],
    filtered: [],
    hero: null,
    current: null,
    categories: ['all'],
    search: '',
    page: 0,
    watchLater: [],
    theme: 'dark',
    debounceTimer: null,
    searchHistory: [],
    progress: {},
    ytPlayer: null,
    isPlaying: false,
    isMuted: false,
    currentView: 'list' // list or kanban
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const Utils = {
    sanitize(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },
    
    truncate(str, maxLength) {
        if (!str) return '';
        return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
    },
    
    formatDate(dateStr) {
        try {
            return new Intl.DateTimeFormat('en', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }).format(new Date(dateStr));
        } catch {
            return '';
        }
    },
    
    highlight(text, search) {
        if (!search) return text;
        const regex = new RegExp(`(${this.escapeRegex(search)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },
    
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },
    
    saveLS(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('LS Save Error:', e);
        }
    },
    
    getLS(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    },
    
    async fetchWithRetry(url, config = CONFIG.API_CONFIG) {
        let delay = config.delay;
        for (let i = 0; i < config.retries; i++) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), config.timeout);
                const response = await fetch(url, { signal: controller.signal });
                clearTimeout(timeout);
                if (response.ok) return response;
                throw new Error(`API Error: ${response.status}`);
            } catch (error) {
                if (i === config.retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= config.backoff;
            }
        }
    },
    
    showToast(message) {
        if (DOM.toast) {
            DOM.toast.textContent = message;
            DOM.toast.classList.add('show');
            setTimeout(() => DOM.toast.classList.remove('show'), 3000);
        }
    }
};

// ============================================
// CATEGORY HELPERS
// ============================================
function getCategoryLabel(key) {
    const cat = CATEGORIES.find(c => c.key === key);
    return cat ? cat.label : 'History';
}

function detectCategory(title) {
    const text = (title || '').toLowerCase();
    const cat = CATEGORIES.find(c => c.terms.some(term => text.includes(term)));
    return cat ? cat.key : 'history';
}

// ============================================
// PROGRESS TRACKING
// ============================================
function getProgress(videoId) {
    return AppState.progress[videoId] || null;
}

// ============================================
// YOUTUBE API INTEGRATION (via Cloudflare Worker)
// ============================================
async function fetchYouTubeChannelData() {
    try {
        const response = await fetch(`${CONFIG.API.YOUTUBE_WORKER}/api/channel`);
        if (!response.ok) throw new Error('Failed to fetch channel data');
        return await response.json();
    } catch (error) {
        console.error('YouTube Worker Error:', error);
        return null;
    }
}

async function loadVideos() {
    // Check cache first
    const cached = Utils.getLS(CONFIG.STORAGE.CACHE_KEY);
    if (cached && cached.data && cached.data.length && Date.now() - cached.time < CONFIG.STORAGE.CACHE_EXPIRY) {
        return cached.data;
    }
    
    try {
        // Try to fetch from channel ID if available
        const channelId = Utils.getLS(CONFIG.STORAGE.CHANNEL_KEY);
        let url = CONFIG.API.YOUTUBE_WORKER;
        if (channelId) {
            url += `/api/channel/videos?channelId=${channelId}`;
        }
        
        const response = await Utils.fetchWithRetry(url);
        const data = await response.json();
        
        if (data.isDemo) {
            document.body.classList.add('demo-mode');
            Utils.showToast('Using demo archives');
        } else {
            document.body.classList.remove('demo-mode');
        }
        
        const videos = (data.videos || []).map(video => ({
            id: video.id || video.videoId,
            title: video.title || 'Untitled',
            thumbnail: video.thumbnail || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
            publishedAt: video.publishedAt || new Date().toISOString(),
            category: detectCategory(video.title),
            description: video.description || 'Deep dive into Islamic history and theology.'
        }));
        
        if (videos.length) {
            Utils.saveLS(CONFIG.STORAGE.CACHE_KEY, { data: videos, time: Date.now() });
        }
        
        return videos;
        
    } catch (error) {
        console.error('Worker fetch failed, using fallback:', error);
        const fallback = await fetch(CONFIG.API.FALLBACK_DATA);
        const data = await fallback.json();
        document.body.classList.add('demo-mode');
        return (data.videos || []).map(video => ({
            ...video,
            category: video.category || 'history',
            description: video.description || 'Deep dive into Islamic history and theology.'
        }));
    }
}

// ============================================
// RENDER FUNCTIONS
// ============================================
function renderCard(video) {
    const isSaved = AppState.watchLater.some(v => v.id === video.id);
    const thumbnail = video.thumbnail || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
    const progress = getProgress(video.id);
    
    return `
        <div class="card" data-id="${video.id}" role="button" tabindex="0">
            <div class="card-thumb-wrapper">
                <img data-src="${thumbnail}" 
                     src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" 
                     alt="${Utils.sanitize(video.title)}" 
                     class="lazy-img" 
                     loading="lazy">
                <div class="card-thumb-overlay">
                    <i class="fa-solid fa-play play-icon"></i>
                </div>
                <div class="duration-badge">HD</div>
                ${progress ? `<div class="progress-bar-container"><div class="progress-bar-fill" style="width:${progress.percent}%"></div></div>` : ''}
                <button class="watch-later-btn ${isSaved ? 'active' : ''}" 
                        data-id="${video.id}" 
                        aria-label="${isSaved ? 'Remove from Watch Later' : 'Save for later'}">
                    <i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i>
                </button>
            </div>
            <div class="card-copy">
                <div class="card-title">${Utils.highlight(Utils.sanitize(Utils.truncate(video.title, 60)), AppState.search)}</div>
                <div class="card-meta">
                    <span class="card-tag">${getCategoryLabel(video.category)}</span>
                    <span>${Utils.formatDate(video.publishedAt)}</span>
                </div>
            </div>
        </div>
    `;
}

function renderHero(video) {
    if (!video) return;
    
    if (DOM.heroTitle) DOM.heroTitle.textContent = video.title;
    if (DOM.heroDesc) DOM.heroDesc.textContent = video.description || '';
    if (DOM.heroCategory) DOM.heroCategory.textContent = getCategoryLabel(video.category);
    if (DOM.heroDate) DOM.heroDate.textContent = Utils.formatDate(video.publishedAt);
    if (DOM.bg) DOM.bg.style.backgroundImage = `url(${video.thumbnail})`;
    
    const isSaved = AppState.watchLater.some(v => v.id === video.id);
    if (DOM.heroSave) {
        DOM.heroSave.innerHTML = `<i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i> <span>${isSaved ? 'Saved' : 'Save'}</span>`;
    }
}

function renderGrid() {
    const searchTerm = AppState.search.toLowerCase();
    
    AppState.filtered = AppState.videos.filter(video => {
        const categoryMatch = AppState.categories.includes('all') || AppState.categories.includes(video.category);
        const searchMatch = !searchTerm || video.title.toLowerCase().includes(searchTerm);
        return categoryMatch && searchMatch;
    });
    
    if (DOM.clearFilters) {
        DOM.clearFilters.style.display = AppState.categories.includes('all') ? 'none' : 'inline-flex';
    }
    
    if (DOM.resultsMeta) {
        DOM.resultsMeta.textContent = `${AppState.filtered.length} episode${AppState.filtered.length !== 1 ? 's' : ''} found`;
    }
    
    const displayVideos = AppState.filtered.slice(0, CONFIG.UI.ITEMS_PER_PAGE * (AppState.page + 1));
    
    if (DOM.grid) {
        if (AppState.filtered.length === 0) {
            DOM.grid.innerHTML = `
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
            DOM.grid.innerHTML = displayVideos.map(renderCard).join('');
            
            // Infinite scroll
            if (displayVideos.length < AppState.filtered.length) {
                const sentinel = document.createElement('div');
                sentinel.id = 'grid-sentinel';
                sentinel.style.height = '10px';
                DOM.grid.appendChild(sentinel);
                
                const observer = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting) {
                        observer.disconnect();
                        AppState.page++;
                        renderGrid();
                    }
                }, { rootMargin: '400px' });
                observer.observe(sentinel);
            }
        }
    }
    
    lazyLoadImages();
    
    if (DOM.loadMoreContainer) {
        DOM.loadMoreContainer.style.display = displayVideos.length < AppState.filtered.length ? 'block' : 'none';
    }
}

function lazyLoadImages() {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.onload = () => img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '100px' });
    
    document.querySelectorAll('.lazy-img').forEach(img => observer.observe(img));
}

function renderContinueWatching() {
    if (!DOM.continueBlock || !DOM.continueRow) return;
    
    const continueVideos = AppState.videos
        .filter(video => {
            const progress = getProgress(video.id);
            return progress && progress.percent >= 5 && progress.percent < 95;
        })
        .sort((a, b) => getProgress(b.id).updated - getProgress(a.id).updated)
        .slice(0, 4);
    
    if (continueVideos.length) {
        DOM.continueBlock.style.display = 'block';
        DOM.continueRow.innerHTML = continueVideos.map(renderCard).join('');
        if (DOM.emptyHistory) DOM.emptyHistory.style.display = 'none';
    } else {
        DOM.continueBlock.style.display = 'none';
        if (DOM.emptyHistory && AppState.videos.length) DOM.emptyHistory.style.display = 'block';
    }
}

function renderWatchLater() {
    if (!DOM.watchLaterContainer) return;
    
    if (AppState.watchLater.length) {
        DOM.watchLaterContainer.innerHTML = AppState.watchLater.map(video => {
            const thumbnail = video.thumbnail || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
            return `
                <div class="card" data-id="${video.id}" data-wl="1" role="button" tabindex="0">
                    <div class="card-thumb-wrapper">
                        <img data-src="${thumbnail}" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" alt="${Utils.sanitize(video.title)}" class="lazy-img" loading="lazy">
                        <button class="watch-later-btn active" data-id="${video.id}" aria-label="Remove from Watch Later">
                            <i class="fa-solid fa-bookmark"></i>
                        </button>
                    </div>
                    <div class="card-copy">
                        <div class="card-title">${Utils.highlight(Utils.sanitize(Utils.truncate(video.title, 60)), AppState.search)}</div>
                        <div class="card-meta">
                            <span class="card-tag">${getCategoryLabel(video.category)}</span>
                            <span>${Utils.formatDate(video.publishedAt)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        lazyLoadImages();
    } else {
        DOM.watchLaterContainer.innerHTML = '<div class="empty-state">No episodes saved yet. Click the bookmark icon on any episode to save it.</div>';
    }
}

function renderDashboard() {
    if (!DOM.dashboardModal) return;
    
    if (DOM.dashTotal) DOM.dashTotal.textContent = AppState.videos.length;
    if (DOM.dashSaved) DOM.dashSaved.textContent = AppState.watchLater.length;
    if (DOM.dashProgress) DOM.dashProgress.textContent = Object.keys(AppState.progress).length;
    if (DOM.dashHours) DOM.dashHours.textContent = (0.5 * AppState.videos.length).toFixed(1) + 'h';
    
    if (DOM.dashCategories && AppState.videos.length) {
        const categoryCount = {};
        AppState.videos.forEach(video => {
            categoryCount[video.category] = (categoryCount[video.category] || 0) + 1;
        });
        DOM.dashCategories.innerHTML = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, count]) => `<div class="dashboard-list-row"><span>${getCategoryLabel(cat)}</span><strong>${count}</strong></div>`)
            .join('');
    }
    
    if (DOM.dashResumeList) {
        DOM.dashResumeList.innerHTML = AppState.watchLater.length
            ? AppState.watchLater.slice(0, 5).map(video => `
                <div class="dashboard-list-row">
                    <span>${Utils.sanitize(Utils.truncate(video.title, 40))}</span>
                    <strong>${getCategoryLabel(video.category)}</strong>
                </div>
            `).join('')
            : '<p style="color:var(--text-soft)">No saved episodes.</p>';
    }
}

function updateStats() {
    if (DOM.statTotal) DOM.statTotal.textContent = AppState.videos.length;
    if (DOM.statSaved) DOM.statSaved.textContent = AppState.watchLater.length;
    if (DOM.statProgress) DOM.statProgress.textContent = Object.keys(AppState.progress).length;
    if (DOM.watchLaterCount) DOM.watchLaterCount.textContent = AppState.watchLater.length;
    if (DOM.watchLaterBadge) {
        DOM.watchLaterBadge.setAttribute('aria-label', `Open watch later list (${AppState.watchLater.length} episodes)`);
    }
}

// ============================================
// VIDEO PLAYER FUNCTIONS
// ============================================
function openVideo(video) {
    if (!DOM.modal || !DOM.player) return;
    
    AppState.current = video;
    const progress = getProgress(video.id);
    const startTime = progress?.time || 0;
    
    DOM.player.src = `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&start=${Math.floor(startTime)}`;
    
    DOM.modal.style.display = 'flex';
    DOM.modal.setAttribute('aria-hidden', 'false');
    DOM.body.style.overflow = 'hidden';
    DOM.body.classList.add('modal-open');
    
    const titleEl = document.getElementById('video-title');
    if (titleEl) titleEl.textContent = video.title;
    
    if (DOM.transcriptPanel) DOM.transcriptPanel.setAttribute('aria-hidden', 'true');
    if (DOM.sharePanel) DOM.sharePanel.setAttribute('aria-hidden', 'true');
}

function closeVideo() {
    if (!DOM.modal || !DOM.player) return;
    
    DOM.player.src = '';
    DOM.modal.style.display = 'none';
    DOM.modal.setAttribute('aria-hidden', 'true');
    DOM.body.style.overflow = '';
    DOM.body.classList.remove('modal-open');
    AppState.current = null;
    clearInterval(AppState.progressTimer);
    
    renderContinueWatching();
    renderDashboard();
    
    if (DOM.transcriptPanel) DOM.transcriptPanel.setAttribute('aria-hidden', 'true');
    if (DOM.sharePanel) DOM.sharePanel.setAttribute('aria-hidden', 'true');
}

function navigateVideo(direction) {
    if (!AppState.current || !AppState.filtered.length) return;
    
    const currentIndex = AppState.filtered.findIndex(v => v.id === AppState.current.id);
    if (currentIndex === -1) return;
    
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = AppState.filtered.length - 1;
    if (newIndex >= AppState.filtered.length) newIndex = 0;
    
    openVideo(AppState.filtered[newIndex]);
}

// ============================================
// WATCH LATER FUNCTIONS
// ============================================
function toggleWatchLater(video) {
    const index = AppState.watchLater.findIndex(v => v.id === video.id);
    
    if (index === -1) {
        AppState.watchLater.push(video);
        Utils.showToast('Added to Watch Later');
    } else {
        AppState.watchLater.splice(index, 1);
        Utils.showToast('Removed from Watch Later');
    }
    
    Utils.saveLS(CONFIG.STORAGE.WATCH_LATER_KEY, AppState.watchLater);
    updateStats();
    
    // Re-render affected components
    if (AppState.hero && AppState.hero.id === video.id) renderHero(AppState.hero);
    renderGrid();
    if (DOM.watchLaterContainer) renderWatchLater();
}

function openWatchLater() {
    if (!DOM.watchLaterPage) return;
    renderWatchLater();
    DOM.watchLaterPage.style.display = 'block';
    DOM.watchLaterPage.setAttribute('aria-hidden', 'false');
    DOM.body.style.overflow = 'hidden';
    DOM.body.classList.add('modal-open');
}

function closeWatchLater() {
    if (!DOM.watchLaterPage) return;
    DOM.watchLaterPage.style.display = 'none';
    DOM.watchLaterPage.setAttribute('aria-hidden', 'true');
    DOM.body.style.overflow = '';
    DOM.body.classList.remove('modal-open');
}

// ============================================
// DASHBOARD FUNCTIONS
// ============================================
function openDashboard() {
    if (!DOM.dashboardModal) return;
    renderDashboard();
    DOM.dashboardModal.style.display = 'block';
    DOM.dashboardModal.setAttribute('aria-hidden', 'false');
    DOM.body.style.overflow = 'hidden';
    DOM.body.classList.add('modal-open');
}

function closeDashboard() {
    if (!DOM.dashboardModal) return;
    DOM.dashboardModal.style.display = 'none';
    DOM.dashboardModal.setAttribute('aria-hidden', 'true');
    DOM.body.style.overflow = '';
    DOM.body.classList.remove('modal-open');
}

// ============================================
// THEME FUNCTIONS
// ============================================
function setTheme(theme) {
    AppState.theme = theme;
    Utils.saveLS(CONFIG.STORAGE.THEME_KEY, theme);
    
    if (theme === 'light') {
        DOM.body.classList.add('light-mode');
    } else {
        DOM.body.classList.remove('light-mode');
    }
    
    const icon = DOM.themeToggle?.querySelector('i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fa-regular fa-moon' : 'fa-regular fa-sun';
    }
}

function toggleTheme() {
    const newTheme = AppState.theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// ============================================
// STUDIO MODE & PROJECTS
// ============================================
function switchMode(mode) {
    if (mode === 'creator') {
        if (DOM.studioRoot) DOM.studioRoot.style.display = 'block';
        if (DOM.appRoot) DOM.appRoot.style.display = 'none';
        if (DOM.heroSection) DOM.heroSection.style.display = 'none';
        if (DOM.continueBlockSec) DOM.continueBlockSec.style.display = 'none';
        updateBreadcrumbs('Studio > Projects');
    } else {
        if (DOM.studioRoot) DOM.studioRoot.style.display = 'none';
        if (DOM.appRoot) DOM.appRoot.style.display = 'block';
        if (DOM.heroSection) DOM.heroSection.style.display = 'block';
        if (DOM.continueBlockSec && AppState.videos.some(v => getProgress(v.id))) {
            DOM.continueBlockSec.style.display = 'block';
        }
    }
}

function updateBreadcrumbs(path) {
    if (!DOM.studioBreadcrumbs) return;
    
    const parts = path.split(' > ');
    DOM.studioBreadcrumbs.innerHTML = parts.map((part, i) => 
        i === parts.length - 1 
            ? `<span class="current">${part}</span>` 
            : `<span>${part}</span>`
    ).join(' <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; margin:0 8px; opacity:0.5;"></i> ');
}

function renderProjects() {
    const projectsList = document.getElementById('studioProjectsList');
    if (!projectsList) return;
    
    const projects = Utils.getLS(CONFIG.STORAGE.PROJECTS_KEY, [
        { id: 'p1', title: 'The Fall of the Abbasids', status: 'Writing', progress: 65, date: '2024-05-10' },
        { id: 'p2', title: 'Prophecy & Modernity', status: 'Researching', progress: 30, date: '2024-05-12' },
        { id: 'p3', title: 'The Silent Silk Road', status: 'Editing', progress: 90, date: '2024-05-08' },
        { id: 'p4', title: 'The Golden Age', status: 'Published', progress: 100, date: '2024-05-01' }
    ]);
    
    if (AppState.currentView === 'list') {
        projectsList.className = 'studio-projects-grid';
        projectsList.innerHTML = projects.map(project => `
            <div class="project-card">
                <div class="project-card-header">
                    <span class="status-badge ${project.status.toLowerCase()}">${project.status}</span>
                    <span class="project-date">${project.date}</span>
                </div>
                <h3 class="project-title">${project.title}</h3>
                <div class="project-progress-container">
                    <div class="project-progress-bar" style="width: ${project.progress}%"></div>
                </div>
                <div class="project-card-footer">
                    <span>${project.progress}% Complete</span>
                    <button class="secondary-button small resume-project-btn" data-id="${project.id}">Resume</button>
                </div>
            </div>
        `).join('');
    } else {
        projectsList.className = 'kanban-grid';
        const columns = ['Research', 'Writing', 'Editing', 'Published'];
        projectsList.innerHTML = columns.map(status => {
            const filtered = projects.filter(p => p.status === status || (status === 'Research' && p.status === 'Researching'));
            return `
                <div class="kanban-column">
                    <h3>${status} <span class="kanban-count">${filtered.length}</span></h3>
                    <div class="kanban-cards">
                        ${filtered.map(project => `
                            <div class="kanban-card resume-project-btn" data-id="${project.id}">
                                <h4 class="text-sm font-bold mb-2">${project.title}</h4>
                                <div class="project-progress-container" style="height:4px;">
                                    <div class="project-progress-bar" style="width: ${project.progress}%"></div>
                                </div>
                                <div class="flex justify-between items-center mt-2 text-xs text-soft">
                                    <span>${project.progress}%</span>
                                    <span>${project.date}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Add event listeners to resume buttons
    projectsList.querySelectorAll('.resume-project-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const projectId = e.currentTarget.dataset.id;
            const project = projects.find(p => p.id === projectId);
            if (project) {
                // Show project detail view
                if (DOM.studioViews) DOM.studioViews.forEach(v => v.style.display = 'none');
                if (DOM.activeProjectView) DOM.activeProjectView.style.display = 'block';
                const titleEl = document.getElementById('current-project-title');
                if (titleEl) titleEl.textContent = project.title;
                updateBreadcrumbs(`Studio > Projects > ${project.title}`);
                if (DOM.projectTabBtns && DOM.projectTabBtns[0]) DOM.projectTabBtns[0].click();
            }
        });
    });
}

// ============================================
// SEARCH & FILTERS
// ============================================
function initSearch() {
    if (!DOM.search) return;
    
    DOM.search.addEventListener('input', (e) => {
        AppState.search = e.target.value;
        AppState.page = 0;
        if (DOM.clearSearch) DOM.clearSearch.style.display = AppState.search ? 'block' : 'none';
        
        clearTimeout(AppState.debounceTimer);
        AppState.debounceTimer = setTimeout(() => {
            renderGrid();
        }, 250);
    });
    
    if (DOM.clearSearch) {
        DOM.clearSearch.addEventListener('click', () => {
            if (DOM.search) DOM.search.value = '';
            AppState.search = '';
            AppState.page = 0;
            if (DOM.clearSearch) DOM.clearSearch.style.display = 'none';
            renderGrid();
        });
    }
    
    // Category filters
    const filterContainer = document.querySelector('.filter-chips');
    if (filterContainer) {
        filterContainer.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip');
            if (!chip) return;
            
            const category = chip.dataset.cat;
            
            if (category === 'all') {
                AppState.categories = ['all'];
            } else {
                AppState.categories = AppState.categories.filter(c => c !== 'all');
                if (AppState.categories.includes(category)) {
                    AppState.categories = AppState.categories.filter(c => c !== category);
                    if (AppState.categories.length === 0) AppState.categories = ['all'];
                } else {
                    AppState.categories.push(category);
                }
            }
            
            document.querySelectorAll('.chip').forEach(ch => {
                if (AppState.categories.includes(ch.dataset.cat)) {
                    ch.classList.add('active');
                } else {
                    ch.classList.remove('active');
                }
            });
            
            AppState.page = 0;
            renderGrid();
        });
    }
    
    if (DOM.clearFilters) {
        DOM.clearFilters.addEventListener('click', () => {
            AppState.categories = ['all'];
            document.querySelectorAll('.chip').forEach(chip => {
                if (chip.dataset.cat === 'all') {
                    chip.classList.add('active');
                } else {
                    chip.classList.remove('active');
                }
            });
            AppState.page = 0;
            renderGrid();
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================
async function init() {
    try {
        // Load saved theme
        const savedTheme = Utils.getLS(CONFIG.STORAGE.THEME_KEY);
        if (savedTheme) setTheme(savedTheme);
        
        // Load watch later
        AppState.watchLater = Utils.getLS(CONFIG.STORAGE.WATCH_LATER_KEY, []);
        AppState.progress = Utils.getLS(CONFIG.STORAGE.PROGRESS_KEY, {});
        
        // Load channel ID
        const savedChannel = Utils.getLS(CONFIG.STORAGE.CHANNEL_KEY);
        if (DOM.channelInput) DOM.channelInput.value = savedChannel || '';
        
        // Show skeleton loading
        if (DOM.grid) {
            DOM.grid.innerHTML = Array(6).fill(0).map(() => `
                <div class="skeleton-card">
                    <div class="skeleton skeleton-thumb" style="aspect-ratio:16/9; border-radius:var(--radius-md);"></div>
                    <div class="skeleton skeleton-text" style="height:24px; width:90%; border-radius:4px;"></div>
                    <div class="skeleton skeleton-text short" style="height:20px; width:50%; border-radius:4px;"></div>
                </div>
            `).join('');
        }
        
        // Load videos
        AppState.videos = await loadVideos();
        AppState.videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        
        if (AppState.videos.length === 0) {
            throw new Error('No videos available in the archive.');
        }
        
        // Set hero
        AppState.hero = AppState.videos[0];
        renderHero(AppState.hero);
        
        // Render grid
        renderGrid();
        renderContinueWatching();
        updateStats();
        
        // Fetch channel stats from Cloudflare Worker (optional)
        const channelStats = await fetchYouTubeChannelData();
        if (channelStats) {
            console.log('Channel Stats:', channelStats);
            // Update UI with channel stats if needed
            const channelStatsEl = document.getElementById('channel-stats');
            if (channelStatsEl) {
                channelStatsEl.innerHTML = `
                    <span>📺 ${channelStats.subscribers?.toLocaleString()} subscribers</span>
                    <span>👁️ ${channelStats.views?.toLocaleString()} views</span>
                    <span>🎬 ${channelStats.videos} videos</span>
                `;
            }
        }
        
        // Initialize projects
        if (!Utils.getLS('yt_studio_demo_loaded_v2')) {
            const demoProjects = [
                { id: 'demo-1', title: 'The Lost Library of Timbuktu', status: 'Writing', progress: 45, date: new Date().toLocaleDateString() },
                { id: 'demo-2', title: 'Secrets of the Ottoman Archives', status: 'Researching', progress: 20, date: new Date().toLocaleDateString() }
            ];
            Utils.saveLS(CONFIG.STORAGE.PROJECTS_KEY, demoProjects);
            localStorage.setItem('yt_studio_demo_loaded_v2', 'true');
            Utils.showToast('Demo data preloaded!');
        }
        
        renderProjects();
        
        // Setup recommended section
        setupRecommendedSection();
        
    } catch (error) {
        console.error('Init Error:', error);
        if (DOM.error) DOM.error.style.display = 'block';
        if (DOM.errorMsg) DOM.errorMsg.textContent = error.message || 'Connection failed. Please try again.';
    } finally {
        if (DOM.loading) DOM.loading.style.display = 'none';
    }
}

function setupRecommendedSection() {
    if (!DOM.recommendedRow) return;
    
    const watchedVideos = Object.keys(AppState.progress)
        .map(id => AppState.videos.find(v => v.id === id))
        .filter(Boolean);
    
    let recommended = [];
    
    if (watchedVideos.length === 0) {
        recommended = AppState.videos.slice(4, 8);
    } else {
        // Get most watched category
        const categoryCount = {};
        watchedVideos.forEach(v => {
            categoryCount[v.category] = (categoryCount[v.category] || 0) + 1;
        });
        const topCategory = Object.keys(categoryCount).sort((a, b) => categoryCount[b] - categoryCount[a])[0];
        
        // Find videos in same category not watched
        recommended = AppState.videos
            .filter(v => v.category === topCategory && !watchedVideos.some(w => w.id === v.id))
            .slice(0, 4);
        
        // If not enough, add from other categories
        if (recommended.length < 4) {
            const otherVideos = AppState.videos
                .filter(v => v.category !== topCategory && !watchedVideos.some(w => w.id === v.id))
                .slice(0, 4 - recommended.length);
            recommended.push(...otherVideos);
        }
    }
    
    if (recommended.length) {
        if (DOM.recommendedBlockSec) DOM.recommendedBlockSec.style.display = 'block';
        DOM.recommendedRow.innerHTML = recommended.map(renderCard).join('');
        lazyLoadImages();
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function bindEvents() {
    // Theme toggle
    if (DOM.themeToggle) DOM.themeToggle.addEventListener('click', toggleTheme);
    
    // Hero buttons
    if (DOM.heroBtn) DOM.heroBtn.addEventListener('click', () => AppState.hero && openVideo(AppState.hero));
    if (DOM.heroSave) DOM.heroSave.addEventListener('click', () => AppState.hero && toggleWatchLater(AppState.hero));
    
    // Modal close
    if (DOM.closeModal) DOM.closeModal.addEventListener('click', closeVideo);
    if (DOM.modal) DOM.modal.addEventListener('click', (e) => { if (e.target === DOM.modal) closeVideo(); });
    
    // Grid click delegation
    if (DOM.grid) {
        DOM.grid.addEventListener('click', (e) => {
            const wlBtn = e.target.closest('.watch-later-btn');
            if (wlBtn) {
                e.stopPropagation();
                const video = AppState.videos.find(v => v.id === wlBtn.dataset.id);
                if (video) toggleWatchLater(video);
                return;
            }
            
            const card = e.target.closest('.card');
            if (card) {
                const video = AppState.videos.find(v => v.id === card.dataset.id);
                if (video) openVideo(video);
            }
        });
        
        DOM.grid.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const card = e.target.closest('.card');
                if (card) {
                    e.preventDefault();
                    const video = AppState.videos.find(v => v.id === card.dataset.id);
                    if (video) openVideo(video);
                }
            }
        });
    }
    
    // Load more button
    if (DOM.loadMore) {
        DOM.loadMore.addEventListener('click', () => {
            AppState.page++;
            renderGrid();
        });
    }
    
    // Watch Later
    if (DOM.watchLaterBadge) DOM.watchLaterBadge.addEventListener('click', openWatchLater);
    if (DOM.closeWatchLater) DOM.closeWatchLater.addEventListener('click', closeWatchLater);
    if (DOM.watchLaterPage) {
        DOM.watchLaterPage.addEventListener('click', (e) => {
            if (e.target === DOM.watchLaterPage) closeWatchLater();
            
            const wlBtn = e.target.closest('.watch-later-btn');
            if (wlBtn) {
                e.stopPropagation();
                const video = AppState.watchLater.find(v => v.id === wlBtn.dataset.id);
                if (video) toggleWatchLater(video);
                return;
            }
            
            const card = e.target.closest('.card');
            if (card) {
                const video = AppState.watchLater.find(v => v.id === card.dataset.id);
                if (video) {
                    closeWatchLater();
                    openVideo(video);
                }
            }
        });
    }
    
    // Dashboard
    if (DOM.dashboardBtn) DOM.dashboardBtn.addEventListener('click', openDashboard);
    if (DOM.closeDashboard) DOM.closeDashboard.addEventListener('click', closeDashboard);
    if (DOM.dashboardModal) {
        DOM.dashboardModal.addEventListener('click', (e) => {
            if (e.target === DOM.dashboardModal) closeDashboard();
        });
    }
    
    // Retry button
    if (DOM.retryBtn) DOM.retryBtn.addEventListener('click', () => location.reload());
    
    // Connect channel
    if (DOM.connectBtn) {
        DOM.connectBtn.addEventListener('click', () => {
            const channelId = DOM.channelInput?.value.trim();
            if (channelId) {
                localStorage.setItem(CONFIG.STORAGE.CHANNEL_KEY, channelId);
                localStorage.removeItem(CONFIG.STORAGE.CACHE_KEY);
                Utils.showToast('Channel ID saved! Reloading archives...');
                setTimeout(() => location.reload(), 1500);
            } else {
                Utils.showToast('Please enter a valid Channel ID');
            }
        });
    }
    
    // Scroll to top
    if (DOM.scrollToTop) {
        window.addEventListener('scroll', () => {
            DOM.scrollToTop.classList.toggle('show', window.scrollY > 500);
        });
        DOM.scrollToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Header scroll effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 20);
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Don't interfere with input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            if (e.key === 'Escape') e.target.blur();
            return;
        }
        
        const key = e.key.toLowerCase();
        
        // Search focus
        if (key === '/' && DOM.search) {
            e.preventDefault();
            DOM.search.focus();
        }
        
        // Escape - close all modals
        if (key === 'escape') {
            closeVideo();
            closeWatchLater();
            closeDashboard();
        }
        
        // Video navigation (when current video is playing)
        if (AppState.current) {
            if (key === 'j') {
                e.preventDefault();
                navigateVideo(-1);
            } else if (key === 'k') {
                e.preventDefault();
                navigateVideo(1);
            }
        }
        
        // Theme toggle
        if (key === 't') {
            toggleTheme();
        }
    });
    
    // Mouse move effect for cards
    document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('.card').forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });
    });
    
    // Mode switcher
    if (DOM.modeBtns) {
        DOM.modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                DOM.modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                switchMode(mode);
            });
        });
    }
    
    // New project button
    if (DOM.newProjectBtn) {
        DOM.newProjectBtn.addEventListener('click', () => {
            if (DOM.studioViews) DOM.studioViews.forEach(v => v.style.display = 'none');
            if (DOM.activeProjectView) DOM.activeProjectView.style.display = 'block';
            const titleEl = document.getElementById('current-project-title');
            if (titleEl) titleEl.textContent = 'New Untitled Video';
            updateBreadcrumbs('Studio > Projects > New Untitled Video');
            if (DOM.projectTabBtns && DOM.projectTabBtns[0]) DOM.projectTabBtns[0].click();
        });
    }
    
    // Back to projects
    if (DOM.backToProjectsBtn) {
        DOM.backToProjectsBtn.addEventListener('click', () => {
            if (DOM.activeProjectView) DOM.activeProjectView.style.display = 'none';
            if (DOM.studioViewProjects) DOM.studioViewProjects.style.display = 'block';
            updateBreadcrumbs('Studio > Projects');
            if (DOM.studioNavBtns) {
                DOM.studioNavBtns.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.tab === 'projects') btn.classList.add('active');
                });
            }
        });
    }
    
    // Project tab buttons
    if (DOM.projectTabBtns) {
        DOM.projectTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                DOM.projectTabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const tabId = btn.dataset.ptab;
                if (DOM.ptabContents) {
                    DOM.ptabContents.forEach(content => content.classList.remove('active'));
                    const activeTab = document.getElementById(`ptab-${tabId}`);
                    if (activeTab) activeTab.classList.add('active');
                }
            });
        });
    }
}

// ============================================
// START APPLICATION
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        init();
        bindEvents();
    });
} else {
    init();
    bindEvents();
}
