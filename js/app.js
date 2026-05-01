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
		WATCH_LATER_KEY: 'watch_later',
		THEME_KEY: 'ui_theme',
		ITEMS_PER_PAGE: 12,
		ASSUMED_DURATION: 600,

		API_CONFIG: {
			timeout: 8000,
			retries: 3,
			backoff: 1.5,
			delay: 500,
		},
	};

	const CATEGORY_RULES = [
		{ key: 'quran', label: 'Quran', terms: ['quran', 'surah', 'ayah', 'allah', 'tafsir', 'islam'] },
		{ key: 'prophecy', label: 'Prophecy', terms: ['prophecy', 'dajjal', 'gog', 'magog', 'end times'] },
		{ key: 'discussion', label: 'Discussion', terms: ['podcast', 'debate', 'interview', 'conversation'] },
		{ key: 'educational', label: 'Educational', terms: ['lesson', 'guide', 'explained', 'documentary'] },
		{ key: 'history', label: 'History', terms: ['history', 'empire', 'caliph', 'war', 'civilization'] },
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
		bg: $('bg'),
		closeModal: $('close'),
		videoTitle: $('video-title'),

		// Theme
		themeToggle: $('darkModeToggle'),

		// Watch Later
		watchLaterBtn: $('watchLaterBadge'),
		watchLaterCount: $('watchLaterCount'),
		watchLaterPage: $('watchLaterPage'),
		watchLaterContainer: $('watchLaterContainer'),
		closeWatchLater: $('closeWatchLater'),

		// Dashboard
		dashboardBtn: $('dashboardBtn'),
		dashboardModal: $('dashboardModal'),
		closeDashboard: $('closeDashboard'),
		dashTotal: $('dashboard-total'),
		dashSaved: $('dashboard-saved'),
		dashProgress: $('dashboard-progress'),
		dashHours: $('dashboard-hours'),
		dashCategories: $('dashboardCategories'),
		dashResumeList: $('dashboardResumeList'),

		// Sidebar
		toggleTranscript: $('toggleTranscript'),
		transcriptPanel: $('transcriptPanel'),
		closeTranscript: $('closeTranscript'),
		transcriptContent: $('transcriptContent'),
		shareBtn: $('shareEpisode'),
		sharePanel: $('sharePanel'),
		closeShare: $('closeShare'),
		shareLink: $('shareLink'),
		copyLink: $('copyLinkBtn'),

		// Sections
		continueBlock: $('continue-block'),
		continueRow: $('continue-row'),
		trendingBlock: $('trending-block'),
		trendingRow: $('trending-row'),
		recommendedBlock: $('recommended-block'),
		recommendedRow: $('recommended-row'),

		// Stats
		statTotal: $('stat-total'),
		statProgress: $('stat-progress'),
		statSaved: $('stat-saved'),

		// Highlights
		highLatestTitle: $('highlight-latest-title'),
		highLatestCopy: $('highlight-latest-copy'),
		highThemeTitle: $('highlight-theme-title'),
		highThemeCopy: $('highlight-theme-copy'),
		highProgressTitle: $('highlight-progress-title'),
		highProgressCopy: $('highlight-progress-copy'),

		// Keyboard
		keyboardHints: $('keyboardHints'),
		closeHints: $('closeHints'),

		// Filters
		filters: document.querySelectorAll('.filter-chip'),
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
		progress: JSON.parse(localStorage.getItem(CONFIG.PROGRESS_KEY) || '{}'),
		theme: localStorage.getItem(CONFIG.THEME_KEY) || 'dark',
		debounceTimer: null,
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

		formatDate: (d) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d)),

		saveLS: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
		getLS: (k, f = null) => JSON.parse(localStorage.getItem(k) || JSON.stringify(f)),

		showToast: (msg) => {
			if (!el.toast) return;
			el.toast.textContent = msg;
			el.toast.classList.add('show');
			setTimeout(() => el.toast.classList.remove('show'), 3000);
		},
	};

	/* ----------------------------
	 * THEME
	 * ---------------------------- */
	function applyTheme() {
		if (state.theme === 'light') {
			el.body.classList.add('light-mode');
			if (el.themeToggle) el.themeToggle.innerHTML = '<i class="fa-regular fa-sun"></i>';
		} else {
			el.body.classList.remove('light-mode');
			if (el.themeToggle) el.themeToggle.innerHTML = '<i class="fa-regular fa-moon"></i>';
		}
		localStorage.setItem(CONFIG.THEME_KEY, state.theme);
	}

	function toggleTheme() {
		state.theme = state.theme === 'dark' ? 'light' : 'dark';
		applyTheme();
	}

	/* ----------------------------
	 * DASHBOARD
	 * ---------------------------- */
	function renderDashboard() {
		if (!el.dashboardModal) return;

		const totalVideos = state.videos.length;
		const savedCount = state.watchLater.length;
		const activeSessions = Object.keys(state.progress).length;
		const estimatedHours = (totalVideos * CONFIG.ASSUMED_DURATION) / 3600;

		if (el.dashTotal) el.dashTotal.textContent = totalVideos;
		if (el.dashSaved) el.dashSaved.textContent = savedCount;
		if (el.dashProgress) el.dashProgress.textContent = activeSessions;
		if (el.dashHours) el.dashHours.textContent = estimatedHours.toFixed(1) + 'h';

		// Categories
		if (el.dashCategories) {
			const counts = state.videos.reduce((acc, v) => {
				acc[v.category] = (acc[v.category] || 0) + 1;
				return acc;
			}, {});

			el.dashCategories.innerHTML = CATEGORY_RULES.map(r => `
				<div class="dashboard-list-row">
					<span>${r.label}</span>
					<strong>${counts[r.key] || 0}</strong>
				</div>
			`).join('');
		}

		// Resume list
		if (el.dashResumeList) {
			const resumeVideos = Object.keys(state.progress)
				.map(id => state.videos.find(v => v.id === id))
				.filter(Boolean)
				.slice(0, 5);

			if (resumeVideos.length) {
				el.dashResumeList.innerHTML = resumeVideos.map(v => `
					<div class="dashboard-list-row resume-item" data-id="${v.id}" role="button">
						<span>${utils.truncate(v.title, 40)}</span>
						<i class="fa-solid fa-play-circle"></i>
					</div>
				`).join('');
			} else {
				el.dashResumeList.innerHTML = '<p class="empty-list">No active sessions.</p>';
			}
		}
	}

	/* ----------------------------
	 * WATCH LATER
	 * ---------------------------- */
	function updateWatchLaterUI() {
		const count = state.watchLater.length;
		if (el.watchLaterCount) el.watchLaterCount.textContent = count;
		if (el.statSaved) el.statSaved.textContent = count;

		if (state.hero) {
			const isHeroSaved = state.watchLater.includes(state.hero.id);
			if (el.heroSave) {
				el.heroSave.innerHTML = `<i class="fa-${isHeroSaved ? 'solid' : 'regular'} fa-bookmark"></i> <span>${isHeroSaved ? 'Saved' : 'Save'}</span>`;
				el.heroSave.classList.toggle('active', isHeroSaved);
			}
		}

		// Update grid buttons
		document.querySelectorAll('.card-save-btn').forEach(btn => {
			const isSaved = state.watchLater.includes(btn.dataset.id);
			btn.classList.toggle('active', isSaved);
			btn.innerHTML = `<i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i>`;
		});
	}

	function toggleWatchLater(id) {
		const idx = state.watchLater.indexOf(id);
		if (idx === -1) {
			state.watchLater.push(id);
			utils.showToast('Added to Watch Later');
		} else {
			state.watchLater.splice(idx, 1);
			utils.showToast('Removed from Watch Later');
		}
		utils.saveLS(CONFIG.WATCH_LATER_KEY, state.watchLater);
		updateWatchLaterUI();
		if (el.watchLaterPage && el.watchLaterPage.style.display === 'block') {
			renderWatchLater();
		}
	}

	function renderWatchLater() {
		if (!el.watchLaterContainer) return;
		const videos = state.watchLater.map(id => state.videos.find(v => v.id === id)).filter(Boolean);
		if (!videos.length) {
			el.watchLaterContainer.innerHTML = '<p class="empty-state">No saved episodes yet.</p>';
			return;
		}
		el.watchLaterContainer.innerHTML = videos.map(card).join('');
	}

	/* ----------------------------
	 * CATEGORY
	 * ---------------------------- */
	function detectCategory(title) {
		const t = title.toLowerCase();
		const match = CATEGORY_RULES.find((r) => r.terms.some((x) => t.includes(x)));
		return match?.key || 'history';
	}

	function categoryLabel(key) {
		return CATEGORY_RULES.find((r) => r.key === key)?.label || 'History';
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
				await new Promise((r) => setTimeout(r, delay));
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

		const videos = (json.videos || []).map((v) => ({
			id: v.id || v.videoId,
			title: v.title || 'Untitled',
			thumbnail: v.thumbnail,
			publishedAt: v.publishedAt || new Date().toISOString(),
			category: detectCategory(v.title || ''),
			description: v.description || '',
		}));

		utils.saveLS(CONFIG.CACHE_KEY, { data: videos, time: Date.now() });
		return videos;
	}

	/* ----------------------------
	 * RENDER
	 * ---------------------------- */
	function card(v) {
		const title = utils.sanitize(v.title);
		const isSaved = state.watchLater.includes(v.id);
		return `
      <div class="card" data-id="${v.id}" role="button" tabindex="0" aria-label="Watch ${title}">
        <img src="${v.thumbnail}" alt="" loading="lazy" />
        <div class="card-copy">
          <div class="card-title">${utils.truncate(title, 80)}</div>
          <div class="card-meta">
            <span>${categoryLabel(v.category)}</span>
            <span>${utils.formatDate(v.publishedAt)}</span>
          </div>
        </div>
		<button class="card-save-btn ${isSaved ? 'active' : ''}" data-id="${v.id}" aria-label="Save for later">
			<i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i>
		</button>
      </div>
    `;
	}

	function render() {
		const q = state.search.toLowerCase();

		state.filtered = state.videos.filter((v) => {
			const matchCat = state.category === 'all' || v.category === state.category;
			const matchSearch = !q || v.title.toLowerCase().includes(q);
			return matchCat && matchSearch;
		});

		const slice = state.filtered.slice(0, CONFIG.ITEMS_PER_PAGE * (state.page + 1));
		el.grid.innerHTML = slice.map(card).join('');

		el.loadMore.style.display = slice.length < state.filtered.length ? 'block' : 'none';

		// Update stats
		if (el.statTotal) el.statTotal.textContent = state.videos.length;
		updateWatchLaterUI();
	}

	/* ----------------------------
	 * MODAL
	 * ---------------------------- */
	function openVideo(v) {
		if (!v) return;
		state.current = v;

		el.videoTitle.textContent = v.title;
		el.player.src = `https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0`;
		el.modal.style.display = 'flex';
		el.modal.setAttribute('aria-hidden', 'false');
		el.body.style.overflow = 'hidden';

		// Track progress (fake for now, just mark as seen)
		if (!state.progress[v.id]) {
			state.progress[v.id] = Date.now();
			utils.saveLS(CONFIG.PROGRESS_KEY, state.progress);
			renderSpecialBlocks();
		}

		// Close panels
		if (el.transcriptPanel) {
			el.transcriptPanel.setAttribute('aria-hidden', 'true');
		}
		if (el.sharePanel) {
			el.sharePanel.setAttribute('aria-hidden', 'true');
		}

		// Accessibility: Focus close button
		setTimeout(() => el.closeModal?.focus(), 100);
	}

	function closeModal() {
		el.modal.style.display = 'none';
		el.modal.setAttribute('aria-hidden', 'true');
		el.player.src = '';
		el.body.style.overflow = '';
		state.current = null;
	}

	/* ----------------------------
	 * HERO
	 * ---------------------------- */
	function setHero(v) {
		state.hero = v;
		if (!v) return;

		el.heroTitle.textContent = v.title;
		el.heroSubtitle.textContent = utils.truncate(v.description, 160);
		el.bg.style.backgroundImage = `url(${v.thumbnail})`;

		const cat = categoryLabel(v.category);
		const catEl = el.heroTitle.parentElement.querySelector('#hero-category');
		if (catEl) catEl.textContent = cat;

		updateWatchLaterUI();
	}

	/* ----------------------------
	 * SPECIAL BLOCKS
	 * ---------------------------- */
	function renderSpecialBlocks() {
		// Continue Watching
		const resumeIds = Object.keys(state.progress).slice(-6).reverse();
		const resumeVideos = resumeIds.map(id => state.videos.find(v => v.id === id)).filter(Boolean);

		if (el.continueBlock) {
			if (resumeVideos.length) {
				el.continueBlock.style.display = 'block';
				el.continueRow.innerHTML = resumeVideos.map(card).join('');
				if (el.statProgress) el.statProgress.textContent = resumeVideos.length;
				if (el.highProgressTitle) el.highProgressTitle.textContent = `${resumeVideos.length} active session${resumeVideos.length > 1 ? 's' : ''}`;
			} else {
				el.continueBlock.style.display = 'none';
			}
		}

		// Trending (just take some recent ones)
		if (el.trendingBlock) {
			const trending = state.videos.slice(4, 10);
			if (trending.length) {
				el.trendingBlock.style.display = 'block';
				el.trendingRow.innerHTML = trending.map(card).join('');
			}
		}

		// Recommended (same category as last watched)
		if (el.recommendedBlock) {
			const lastId = resumeIds[0];
			const lastVideo = state.videos.find(v => v.id === lastId);
			if (lastVideo) {
				const recs = state.videos
					.filter(v => v.category === lastVideo.category && v.id !== lastId)
					.slice(0, 6);
				if (recs.length) {
					el.recommendedBlock.style.display = 'block';
					el.recommendedRow.innerHTML = recs.map(card).join('');
				}
			}
		}

		// Highlights
		if (state.videos.length > 0) {
			if (el.highLatestTitle) el.highLatestTitle.textContent = state.videos[0].title;
		}
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

		el.heroBtn?.addEventListener('click', () => {
			if (state.hero) openVideo(state.hero);
		});

		el.heroSave?.addEventListener('click', () => {
			if (state.hero) toggleWatchLater(state.hero.id);
		});

		el.closeModal?.addEventListener('click', closeModal);

		el.themeToggle?.addEventListener('click', toggleTheme);

		// Watch Later page
		el.watchLaterBtn?.addEventListener('click', () => {
			if (!el.watchLaterPage) return;
			renderWatchLater();
			el.watchLaterPage.style.display = 'block';
			el.watchLaterPage.setAttribute('aria-hidden', 'false');
			el.body.style.overflow = 'hidden';
		});

		el.closeWatchLater?.addEventListener('click', () => {
			if (el.watchLaterPage) {
				el.watchLaterPage.style.display = 'none';
				el.watchLaterPage.setAttribute('aria-hidden', 'true');
				el.body.style.overflow = '';
			}
		});

		// Dashboard
		el.dashboardBtn?.addEventListener('click', () => {
			if (!el.dashboardModal) return;
			renderDashboard();
			el.dashboardModal.style.display = 'block';
			el.dashboardModal.setAttribute('aria-hidden', 'false');
			el.body.style.overflow = 'hidden';
		});

		el.closeDashboard?.addEventListener('click', () => {
			if (el.dashboardModal) {
				el.dashboardModal.style.display = 'none';
				el.dashboardModal.setAttribute('aria-hidden', 'true');
				el.body.style.overflow = '';
			}
		});

		// Video Sidebar
		el.toggleTranscript?.addEventListener('click', () => {
			if (!el.transcriptPanel) return;
			const hidden = el.transcriptPanel.getAttribute('aria-hidden') === 'true';
			el.transcriptPanel.setAttribute('aria-hidden', !hidden);
			if (el.sharePanel) el.sharePanel.setAttribute('aria-hidden', 'true');

			if (!hidden) {
				el.transcriptContent.innerHTML = `<p>${state.current?.description || 'No notes available for this episode.'}</p>`;
			}
		});

		el.closeTranscript?.addEventListener('click', () => {
			el.transcriptPanel?.setAttribute('aria-hidden', 'true');
		});

		el.shareBtn?.addEventListener('click', () => {
			if (!el.sharePanel) return;
			const hidden = el.sharePanel.getAttribute('aria-hidden') === 'true';
			el.sharePanel.setAttribute('aria-hidden', !hidden);
			if (el.transcriptPanel) el.transcriptPanel.setAttribute('aria-hidden', 'true');

			if (!hidden && state.current) {
				const url = `https://youtu.be/${state.current.id}`;
				if (el.shareLink) el.shareLink.value = url;
			}
		});

		el.closeShare?.addEventListener('click', () => {
			el.sharePanel?.setAttribute('aria-hidden', 'true');
		});

		el.copyLink?.addEventListener('click', async () => {
			if (!el.shareLink) return;
			const url = el.shareLink.value;
			try {
				if (navigator.clipboard && navigator.clipboard.writeText) {
					await navigator.clipboard.writeText(url);
				} else {
					el.shareLink.select();
					document.execCommand('copy');
				}
				utils.showToast('Link copied to clipboard');
			} catch (err) {
				utils.showToast('Failed to copy link');
			}
		});

		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				closeModal();
				if (el.watchLaterPage) {
					el.watchLaterPage.style.display = 'none';
					el.watchLaterPage.setAttribute('aria-hidden', 'true');
					el.body.style.overflow = '';
				}
				if (el.dashboardModal) {
					el.dashboardModal.style.display = 'none';
					el.dashboardModal.setAttribute('aria-hidden', 'true');
					el.body.style.overflow = '';
				}
			}

			if (e.key === '/' && document.activeElement !== el.search) {
				e.preventDefault();
				el.search?.focus();
			}
		});

		// Category filters
		el.filters.forEach(btn => {
			btn.addEventListener('click', () => {
				el.filters.forEach(b => b.classList.remove('active'));
				btn.classList.add('active');
				state.category = btn.dataset.category;
				state.page = 0;
				render();
			});
		});

		// Handle clicks and keyboard on cards
		const handleCardInteraction = (e) => {
			const saveBtn = e.target.closest('.card-save-btn');
			if (saveBtn) {
				e.stopPropagation();
				toggleWatchLater(saveBtn.dataset.id);
				return;
			}

			const resumeItem = e.target.closest('.resume-item');
			if (resumeItem) {
				const video = state.videos.find(v => v.id === resumeItem.dataset.id);
				if (video) openVideo(video);
				return;
			}

			const cardEl = e.target.closest('.card');
			if (!cardEl) return;

			const video = state.videos.find((v) => v.id === cardEl.dataset.id);
			if (video) openVideo(video);
		};

		el.grid?.addEventListener('click', handleCardInteraction);
		el.watchLaterContainer?.addEventListener('click', handleCardInteraction);
		el.dashResumeList?.addEventListener('click', handleCardInteraction);
		el.continueRow?.addEventListener('click', handleCardInteraction);
		el.trendingRow?.addEventListener('click', handleCardInteraction);
		el.recommendedRow?.addEventListener('click', handleCardInteraction);

		el.grid?.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				const cardEl = e.target.closest('.card');
				if (!cardEl) return;
				e.preventDefault();
				handleCardInteraction(e);
			}
		});
	}

	/* ----------------------------
	 * INIT
	 * ---------------------------- */
	async function init() {
		try {
			applyTheme();
			if (el.loading) el.loading.style.display = 'block';

			state.videos = await loadVideos();
			state.videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

			if (state.videos.length) {
				setHero(state.videos[0]);
			}
			render();
			renderSpecialBlocks();
			bind();
		} catch (e) {
			if (el.error) el.error.style.display = 'block';
			if (el.errorMsg) el.errorMsg.textContent = e.message;
		} finally {
			if (el.loading) el.loading.style.display = 'none';
		}
	}

	document.addEventListener('DOMContentLoaded', init);
})();
