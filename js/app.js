(() => {
	let i = {
			API: 'https://yt-studio.ruhdevopsytstudio.workers.dev/api/videos',
			CACHE_KEY: 'yt_studio_videos_cache_v4',
			CACHE_EXPIRY: 864e5,
			PROJECTS_KEY: "yt_studio_projects",
			RESEARCH_KEY: "yt_studio_research",
			WATCH_LATER_KEY: 'watch_later_list',
			THEME_KEY: 'ui_theme',
			SEARCH_HISTORY_KEY: 'search_history',
			PROGRESS_KEY: 'watch_progress',
			ITEMS_PER_PAGE: 12,
			API_CONFIG: { timeout: 1e4, retries: 3, backoff: 1.5, delay: 500 },
		},
		a = [
			{ key: 'quran', label: 'Quran', terms: ['quran', 'surah', 'ayah', 'allah', 'tafsir', 'islam'] },
			{ key: 'prophecy', label: 'Prophecy', terms: ['prophecy', 'dajjal', 'gog', 'magog', 'end times'] },
			{ key: 'discussion', label: 'Discussion', terms: ['podcast', 'debate', 'interview', 'conversation'] },
			{ key: 'educational', label: 'Educational', terms: ['lesson', 'guide', 'explained', 'documentary'] },
			{ key: 'history', label: 'History', terms: ['history', 'empire', 'caliph', 'war', 'civilization'] },
		],
		r = (e) => document.getElementById(e),
		s = {
			body: document.body,
			grid: r('grid'),
			modal: r('modal'),
			player: r('player'),
			closeModal: r('close'),
			heroTitle: r('hero-title'),
			heroDesc: r('hero-desc'),
			heroSubtitle: r('hero-subtitle'),
			heroBtn: r('hero-btn'),
			heroSave: r('hero-save'),
			heroCategory: r('hero-category'),
			heroDate: r('hero-date'),
			search: r('searchInput'),
			bg: r('bg'),
			clearSearch: r('clearSearch'),
			suggestions: r('searchSuggestions'),
			loadMore: r('loadMoreBtn'),
			loadMoreContainer: r('loadMoreContainer'),
			loading: r('loading'),
			error: r('error'),
			errorMsg: r('error-msg'),
			retryBtn: r('retryBtn'),
			toast: r('toast'),
			themeToggle: r('darkModeToggle'),
			mobileToggle: r('mobileMenuToggle'),
			mobileNav: r('mobileNav'),
			watchLaterBadge: r('watchLaterBadge'),
			watchLaterCount: r('watchLaterCount'),
			watchLaterPage: r('watchLaterPage'),
			watchLaterContainer: r('watchLaterContainer'),
			closeWatchLater: r('closeWatchLater'),
			dashboardBtn: r('dashboardBtn'),
			dashboardModal: r('dashboardModal'),
			closeDashboard: r('closeDashboard'),
			chips: document.querySelectorAll('.chip'),
			resultsMeta: r('results-meta'),
			statTotal: r('stat-total'),
			statSaved: r('stat-saved'),
			statProgress: r('stat-progress'),
			dashTotal: r('dashboard-total'),
			dashSaved: r('dashboard-saved'),
			dashProgress: r('dashboard-progress'),
			dashHours: r('dashboard-hours'),
			dashCategories: r('dashboardCategories'),
			dashResumeList: r('dashboardResumeList'),
			toggleTranscript: r('toggleTranscript'),
			shareEpisode: r('shareEpisode'),
			transcriptPanel: r('transcriptPanel'),
			sharePanel: r('sharePanel'),
			closeTranscript: r('closeTranscript'),
			closeShare: r('closeShare'),
			shareLink: r('shareLink'),
			copyLinkBtn: r('copyLinkBtn'),
			shareTwitter: r('shareTwitter'),
			shareFacebook: r('shareFacebook'),
			shareWhatsApp: r('shareWhatsApp'),
			scrollToTop: r('scrollToTop'),
			continueBlock: r('continue-block'),
			continueRow: r('continue-row'),
			emptyHistory: r('empty-history'),
			clearFilters: r('clearFilters'),
			studioToggleBtn: r('studioToggleBtn'),
			appRoot: r('app-root'),
			studioRoot: r('studio-root'),
			heroSection: r('hero'),
			continueBlockSec: r('continue-block'),
			trendingBlockSec: r('trending-block'),
			recommendedBlockSec: r('recommended-block'),
			trendingRow: r('trending-row'),
			recommendedRow: r('recommended-row'),
			studioNavBtns: document.querySelectorAll('.studio-nav-btn'),
			studioViews: document.querySelectorAll('.studio-view'),
			projectTabBtns: document.querySelectorAll('.project-tab-btn'),
			ptabContents: document.querySelectorAll('.ptab-content'),
			newProjectBtn: r('newProjectBtn'),
			backToProjectsBtn: r('backToProjectsBtn'),
			activeProjectView: r('active-project-view'),
			studioViewProjects: r('studio-view-projects'),
		},
		n = {
			videos: [],
			filtered: [],
			hero: null,
			current: null,
			categories: ['all'],
			search: '',
			page: 0,
			watchLater: JSON.parse(localStorage.getItem(i.WATCH_LATER_KEY) || '[]'),
			theme: localStorage.getItem(i.THEME_KEY) || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'),
			debounceTimer: null,
			searchHistory: JSON.parse(localStorage.getItem(i.SEARCH_HISTORY_KEY) || '[]'),
			progress: JSON.parse(localStorage.getItem(i.PROGRESS_KEY) || '{}'),
			ytPlayer: null,
		},
		l = {
			sanitize: (e) =>
				String(e || '')
					.replace(/&/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;'),
			truncate: (e, t) => (e.length > t ? e.slice(0, t) + '...' : e),
			formatDate: (e) => {
				try {
					return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(e));
				} catch (e) {
					return '';
				}
			},
			highlight: (e, t) => (t ? ((t = new RegExp(`(${t})`, 'gi')), e.replace(t, '<mark>$1</mark>')) : e),
			highlight: (e, t) => (t ? ((t = new RegExp(`(${t})`, 'gi')), e.replace(t, '<mark>$1</mark>')) : e),
			saveLS: (e, t) => {
				try {
					localStorage.setItem(e, JSON.stringify(t));
				} catch (e) {}
			},
			getLS: (e, t = null) => {
				try {
					var a = localStorage.getItem(e);
					return a ? JSON.parse(a) : t;
				} catch (e) {
					return t;
				}
			},
			showToast: (e) => {
				s.toast && ((s.toast.textContent = e), s.toast.classList.add('show'), setTimeout(() => s.toast.classList.remove('show'), 3e3));
			},
		};
	function o(t) {
		var e = a.find((e) => e.key === t);
		return e ? e.label : 'History';
	}
	function d(e) {
		return n.progress[e] || null;
	}
	function renderProjects() {
		const grid = document.getElementById("studioProjectsList");
		if (!grid) return;
		const saved = localStorage.getItem(i.PROJECTS_KEY);
		const projects = saved ? JSON.parse(saved) : [
			{ id: "p1", title: "The Fall of the Abbasids", status: "Writing", progress: 65, date: "2024-05-10" },
			{ id: "p2", title: "Prophecy & Modernity", status: "Research", progress: 30, date: "2024-05-12" },
			{ id: "p3", title: "The Silent Silk Road", status: "Editing", progress: 90, date: "2024-05-08" }
		];
		grid.innerHTML = projects.map(p => `
			<div class="project-card">
				<div class="project-card-header">
					<span class="status-badge ${p.status.toLowerCase()}">${p.status}</span>
					<span class="project-date">${p.date}</span>
				</div>
				<h3 class="project-title">${p.title}</h3>
				<div class="project-progress-container">
					<div class="project-progress-bar" style="width: ${p.progress}%"></div>
				</div>
				<div class="project-card-footer">
					<span>${p.progress}% Complete</span>
					<button class="secondary-button small resume-project-btn" data-id="${p.id}">Resume</button>
				</div>
			</div>
		`).join("");
		grid.querySelectorAll(".resume-project-btn").forEach(btn => {
			btn.addEventListener("click", (e) => {
				const id = e.currentTarget.dataset.id;
				const project = projects.find(p => p.id === id);
				if (project) {
					s.studioViews.forEach(v => v.style.display = "none");
					if (s.activeProjectView) s.activeProjectView.style.display = "block";
					if (r("current-project-title")) r("current-project-title").textContent = project.title;
					if (s.projectTabBtns[0]) s.projectTabBtns[0].click();
				}
			});
		});
	}
	function R() {
		if (!s.recommendedRow) return;
		const history = Object.keys(n.progress).map(id => n.videos.find(v => v.id === id)).filter(Boolean);
		let recs = [];
		if (history.length === 0) {
			recs = n.videos.slice(4, 8); // Offset from trending/hero
		} else {
			const categories = history.map(v => v.category);
			const freq = {};
			categories.forEach(c => freq[c] = (freq[c] || 0) + 1);
			const topCat = Object.keys(freq).sort((a,b) => freq[b] - freq[a])[0];
			
			recs = n.videos
				.filter(v => v.category === topCat && !history.find(h => h.id === v.id))
				.slice(0, 4);
			
			if (recs.length < 4) {
				const others = n.videos.filter(v => v.category !== topCat && !history.find(h => h.id === v.id)).slice(0, 4 - recs.length);
				recs.push(...others);
			}
		}
		
		if (recs.length > 0) {
			if (s.recommendedBlockSec) s.recommendedBlockSec.style.display = 'block';
			s.recommendedRow.innerHTML = recs.map(v => L(v)).join('');
		}
	}
	function t() {
		var e;
		s.continueBlock &&
			s.continueRow &&
			(0 <
			(e = n.videos
				.filter((e) => (e = d(e.id)) && 5 <= e.percent && e.percent < 95)
				.sort((e, t) => d(t.id).updated - d(e.id).updated)
				.slice(0, 4)).length
				? ((s.continueBlock.style.display = 'block'),
					(s.continueRow.innerHTML = e.map((e) => L(e)).join('')),
					s.emptyHistory && (s.emptyHistory.style.display = 'none'))
				: ((s.continueBlock.style.display = 'none'), s.emptyHistory && 0 < n.videos.length && (s.emptyHistory.style.display = 'block')));
	}
	function c(o) {
		var e;
		o &&
			s.modal &&
			s.player &&
			((e = d((n.current = o).id)?.time || 0),
			(e = 'https://www.youtube.com/embed/' + o.id + '?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&start=' + Math.floor(e)),
			(s.player.src = e),
			window.YT &&
				window.YT.Player &&
				(n.ytPlayer && n.ytPlayer.destroy(),
				(n.ytPlayer = new YT.Player('player', {
					events: {
						onReady: (e) => {
							// Custom controls logic
							const pipBtn = r('pipBtn');
							const speedOptions = r('speedOptions');
							const qualityOptions = r('qualityOptions');
							const currentSpeedLabel = r('currentSpeed');

							if (pipBtn) {
								pipBtn.onclick = async () => {
									try {
										if (document.pictureInPictureElement) {
											await document.exitPictureInPicture();
										} else {
											const iframe = r('player');
											// Note: Browsers might require direct video element access for PiP
											// This is a placeholder as YouTube IFrame usually handles PiP internally
											l.showToast('PiP mode toggled via YouTube player');
										}
									} catch (err) {
										l.showToast('PiP not supported');
									}
								};
							}

							if (speedOptions) {
								speedOptions.onclick = (event) => {
									const btn = event.target.closest('button');
									if (btn) {
										const speed = parseFloat(btn.dataset.speed);
										n.ytPlayer.setPlaybackRate(speed);
										currentSpeedLabel.textContent = speed + 'x';
										speedOptions.querySelectorAll('button').forEach(b => b.classList.remove('active'));
										btn.classList.add('active');
										l.showToast('Speed: ' + speed + 'x');
									}
								};
							}

							if (qualityOptions) {
								qualityOptions.onclick = (event) => {
									const btn = event.target.closest('button');
									if (btn) {
										const quality = btn.dataset.quality;
										n.ytPlayer.setPlaybackQuality(quality);
										qualityOptions.querySelectorAll('button').forEach(b => b.classList.remove('active'));
										btn.classList.add('active');
										l.showToast('Quality set to ' + quality);
									}
								};
							}
						},
						onStateChange: (e) => {
							if (e.data === YT.PlayerState.PLAYING) {
								let s = setInterval(() => {
									var e, t, a, r;
									n.ytPlayer && n.ytPlayer.getCurrentTime
										? ((t = n.ytPlayer.getCurrentTime()),
											0 < (a = n.ytPlayer.getDuration()) &&
												(e = o.id) &&
												((r = (t / a) * 100),
												(n.progress[e] = { time: t, duration: a, percent: r, updated: Date.now() }),
												l.saveLS(i.PROGRESS_KEY, n.progress),
												E()))
										: clearInterval(s);
								}, 5e3);
								n.progressTimer = s;
							} else n.progressTimer && clearInterval(n.progressTimer);
						},
					},
				}))),
			(s.modal.style.display = 'flex'),
			s.modal.setAttribute('aria-hidden', 'false'),
			(s.body.style.overflow = 'hidden'),
			s.body.classList.add('modal-open'),
			(e = r('video-title')) && (e.textContent = o.title),
			s.transcriptPanel && s.transcriptPanel.setAttribute('aria-hidden', 'true'),
			s.sharePanel && s.sharePanel.setAttribute('aria-hidden', 'true'),
			n.search) &&
			!n.searchHistory.includes(n.search) &&
			(n.searchHistory.unshift(n.search), (n.searchHistory = n.searchHistory.slice(0, 5)), l.saveLS(i.SEARCH_HISTORY_KEY, n.searchHistory));
	}
	function h() {
		s.modal &&
			s.player &&
			((s.player.src = ''),
			(s.modal.style.display = 'none'),
			s.modal.setAttribute('aria-hidden', 'true'),
			(s.body.style.overflow = ''),
			s.body.classList.remove('modal-open'),
			(n.current = null),
			n.progressTimer && clearInterval(n.progressTimer),
			t(),
			k(),
			s.transcriptPanel && s.transcriptPanel.setAttribute('aria-hidden', 'true'),
			s.sharePanel) &&
			s.sharePanel.setAttribute('aria-hidden', 'true');
	}
	function u(t) {
		if (n.current && n.filtered.length) {
			var a = n.filtered.findIndex((e) => e.id === n.current.id);
			if (-1 !== a) {
				let e = a + t;
				((e = e < 0 ? n.filtered.length - 1 : e) >= n.filtered.length && (e = 0), c(n.filtered[e]));
			}
		}
	}
	function g(t) {
		var e = n.watchLater.findIndex((e) => e.id === t.id);
		(-1 === e
			? (n.watchLater.push(t), l.showToast('Added to Watch Later'))
			: (n.watchLater.splice(e, 1), l.showToast('Removed from Watch Later')),
			l.saveLS(i.WATCH_LATER_KEY, n.watchLater),
			E());
	}
	function p() {
		s.watchLaterPage &&
			(v(),
			(s.watchLaterPage.style.display = 'block'),
			s.watchLaterPage.setAttribute('aria-hidden', 'false'),
			(s.body.style.overflow = 'hidden'),
			s.body.classList.add('modal-open'));
	}
	function y() {
		s.watchLaterPage &&
			((s.watchLaterPage.style.display = 'none'),
			s.watchLaterPage.setAttribute('aria-hidden', 'true'),
			(s.body.style.overflow = ''),
			s.body.classList.remove('modal-open'));
	}
	function v() {
		s.watchLaterContainer &&
			(n.watchLater.length
				? (s.watchLaterContainer.innerHTML = n.watchLater
						.map((e) => {
							var t = e.thumbnail || 'https://i.ytimg.com/vi/' + e.id + '/hqdefault.jpg';
							return (
								'<div class="card" data-id="' +
								e.id +
								'" data-wl="1" role="button" tabindex="0"><div class="card-thumb-wrapper"><img data-src="' +
								t +
								'" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" alt="' +
								l.sanitize(e.title) +
								'" class="lazy-img" loading="lazy"><button class="watch-later-btn active" data-id="' +
								e.id +
								'" aria-label="Remove from Watch Later"><i class="fa-solid fa-bookmark"></i></button></div><div class="card-copy"><div class="card-title">' +
								l.highlight(l.sanitize(l.truncate(e.title, 60)), n.search) +
								'</div><div class="card-meta"><span class="card-tag">' +
								o(e.category) +
								'</span><span>' +
								l.formatDate(e.publishedAt) +
								'</span></div></div></div>'
							);
						})
						.join(''),
						initLazyLoading())
				: (s.watchLaterContainer.innerHTML =
						'<div class="empty-state">No episodes saved yet. Click the bookmark icon on any episode to save it.</div>'));
	}
	function m() {
		if (s.dashboardModal) {
			(s.dashTotal && (s.dashTotal.textContent = n.videos.length),
				s.dashSaved && (s.dashSaved.textContent = n.watchLater.length),
				s.dashProgress && (s.dashProgress.textContent = 0),
				s.dashHours && (s.dashHours.textContent = (0.5 * n.videos.length).toFixed(1) + 'h'));
			var t = document.querySelector('.dashboard-panels');
			if (0 === n.videos.length) {
				t && (t.style.display = 'none');
				let e = document.getElementById('dashboard-empty');
				(!e &&
					(((e = document.createElement('div')).id = 'dashboard-empty'),
					(e.className = 'dashboard-empty-state'),
					(e.innerHTML = `
          <i class="fa-solid fa-cloud-arrow-up" aria-hidden="true"></i>
          <h4>No Channel Connected</h4>
          <p>Connect your YouTube channel to sync your archive, track progress, and unlock personalized insights.</p>
          <button type="button" class="connect-btn" aria-label="Connect YouTube Channel">
            <i class="fa-brands fa-youtube" aria-hidden="true"></i>
            Connect Channel
          </button>
        `),
					(a = document.querySelector('.dashboard-content')) && a.appendChild(e),
					(a = e.querySelector('.connect-btn'))) &&
					a.addEventListener('click', () => l.showToast('Channel connection coming soon!')),
					(e.style.display = 'flex'));
			} else {
				t && (t.style.display = 'grid');
				var a = document.getElementById('dashboard-empty');
				if ((a && (a.style.display = 'none'), s.dashCategories)) {
					let t = {};
					(n.videos.forEach((e) => {
						t[e.category] = (t[e.category] || 0) + 1;
					}),
						(s.dashCategories.innerHTML =
							Object.entries(t)
								.sort((e, t) => t[1] - e[1])
								.map(([e, t]) => '<div class="dashboard-list-row"><span>' + o(e) + '</span><strong>' + t + '</strong></div>')
								.join('') || '<p style="color:var(--text-soft)">No data yet.</p>'));
				}
				s.dashResumeList &&
					(s.dashResumeList.innerHTML = n.watchLater.length
						? n.watchLater
								.slice(0, 5)
								.map(
									(e) =>
										'<div class="dashboard-list-row"><span>' +
										l.sanitize(l.truncate(e.title, 40)) +
										'</span><strong>' +
										o(e.category) +
										'</strong></div>',
								)
								.join('')
						: '<p style="color:var(--text-soft)">No saved episodes.</p>');
			}
			((s.dashboardModal.style.display = 'block'),
				s.dashboardModal.setAttribute('aria-hidden', 'false'),
				(s.body.style.overflow = 'hidden'),
				s.body.classList.add('modal-open'));
		}
	}
	function b() {
		s.dashboardModal &&
			((s.dashboardModal.style.display = 'none'),
			s.dashboardModal.setAttribute('aria-hidden', 'true'),
			(s.body.style.overflow = ''),
			s.body.classList.remove('modal-open'));
	}
	function w() {
		'light' === n.theme ? s.body.classList.add('light-mode') : s.body.classList.remove('light-mode');
		var e = s.themeToggle ? s.themeToggle.querySelector('i') : null;
		e && (e.className = 'dark' === n.theme ? 'fa-regular fa-moon' : 'fa-regular fa-sun');
	}
	function f() {
		((n.theme = 'dark' === n.theme ? 'light' : 'dark'), l.saveLS(i.THEME_KEY, n.theme), w());
	}
	function L(t) {
		var e = n.watchLater.some((e) => e.id === t.id),
			a = t.thumbnail || 'https://i.ytimg.com/vi/' + t.id + '/hqdefault.jpg';
		return (
			'<div class="card" data-id="' +
			t.id +
			'" role="button" tabindex="0"><div class="card-thumb-wrapper"><img data-src="' +
			a +
			'" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" alt="' +
			l.sanitize(t.title) +
			'" class="lazy-img" loading="lazy"><div class="card-thumb-overlay"><i class="fa-solid fa-play play-icon"></i></div><div class="duration-badge">HD</div>' +
			(d(t.id)
				? '<div class="progress-bar-container"><div class="progress-bar-fill" style="width:' + d(t.id).percent + '%"></div></div>'
				: '') +
			'<button class="watch-later-btn ' +
			(e ? 'active' : '') +
			'" data-id="' +
			t.id +
			'" aria-label="Save for later"><i class="fa-' +
			(e ? 'solid' : 'regular') +
			' fa-bookmark"></i></button></div><div class="card-copy"><div class="card-title">' +
			l.highlight(l.sanitize(l.truncate(t.title, 60)), n.search) +
			'</div><div class="card-meta"><span class="card-tag">' +
			o(t.category) +
			'</span><span>' +
			l.formatDate(t.publishedAt) +
			'</span></div></div></div>'
		);
	}
	function k() {
		let a = n.search.toLowerCase();
		((n.filtered = n.videos.filter((e) => {
			var t = n.categories.includes('all') || n.categories.includes(e.category),
				e = !a || e.title.toLowerCase().includes(a);
			return t && e;
		})),
			s.clearFilters && (s.clearFilters.style.display = n.categories.includes('all') ? 'none' : 'inline-flex'),
			s.resultsMeta && (s.resultsMeta.textContent = n.filtered.length + ' episode' + (1 === n.filtered.length ? '' : 's') + ' found'));
		var e = n.filtered.slice(0, i.ITEMS_PER_PAGE * (n.page + 1));
		(s.grid &&
			(0 === n.filtered.length
				? (s.grid.innerHTML = `
          <div class="empty-state-card" style="grid-column: 1 / -1; margin-top: 40px;">
            <i class="fa-solid fa-magnifying-glass"></i>
            <h3>No results found</h3>
            <p>Try different keywords or browse by category to find what you're looking for.</p>
            <button type="button" class="secondary-button" style="margin-top: 20px;" onclick="document.getElementById('searchInput').value=''; document.getElementById('searchInput').dispatchEvent(new Event('input'));">
              Clear Search
            </button>
          </div>
        `)
				: (s.grid.innerHTML = e.map(L).join(''))),
			s.loadMoreContainer && (s.loadMoreContainer.style.display = e.length < n.filtered.length ? 'block' : 'none'),
			initLazyLoading());
	}

	function initLazyLoading() {
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
	function E() {
		(s.statTotal && (s.statTotal.textContent = n.videos.length),
			s.statSaved && (s.statSaved.textContent = n.watchLater.length),
			s.statProgress && (s.statProgress.textContent = Object.keys(n.progress).length),
			s.watchLaterCount && (s.watchLaterCount.textContent = n.watchLater.length));
	}
	function T(t) {
		var e, a;
		(n.hero = t) &&
			s.heroTitle &&
			((s.heroTitle.textContent = t.title),
			s.heroDesc && (s.heroDesc.textContent = t.description || ''),
			s.heroCategory && (s.heroCategory.textContent = o(t.category)),
			s.heroDate && (s.heroDate.textContent = l.formatDate(t.publishedAt)),
			s.bg && (s.bg.style.backgroundImage = 'url(' + t.thumbnail + ')'),
			(e = n.watchLater.some((e) => e.id === t.id)),
			s.heroSave &&
				(s.heroSave.innerHTML =
					'<i class="fa-' +
					(e ? 'solid' : 'regular') +
					' fa-bookmark" aria-hidden="true"></i> <span>' +
					(e ? 'Saved' : 'Save') +
					'</span>'),
			(e = r('highlight-latest-title')),
			(a = r('highlight-latest-copy')),
			e && (e.textContent = l.truncate(t.title, 60)),
			a) &&
			(a.textContent = l.formatDate(t.publishedAt));
	}
	function C() {
		s.sharePanel && s.sharePanel.setAttribute('aria-hidden', 'true');
	}
	function P() {
		s.transcriptPanel && s.transcriptPanel.setAttribute('aria-hidden', 'true');
	}
	function S() {
		s.mobileToggle &&
			s.mobileToggle.addEventListener('click', () => {
				const isOpen = s.body.classList.toggle('menu-open');
				s.mobileNav && s.mobileNav.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
				const icon = s.mobileToggle.querySelector('i');
				if (icon) icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
			});
		(s.search &&
			(s.search.addEventListener('keydown', (e) => {
				const suggestions = s.suggestions.querySelectorAll('.suggestion-item');
				if (s.suggestions.style.display === 'block' && suggestions.length > 0) {
					let activeIdx = Array.from(suggestions).findIndex(s => s.classList.contains('active'));
					if (e.key === 'ArrowDown') {
						e.preventDefault();
						if (activeIdx !== -1) suggestions[activeIdx].classList.remove('active');
						activeIdx = (activeIdx + 1) % suggestions.length;
						suggestions[activeIdx].classList.add('active');
						suggestions[activeIdx].scrollIntoView({ block: 'nearest' });
					} else if (e.key === 'ArrowUp') {
						e.preventDefault();
						if (activeIdx !== -1) suggestions[activeIdx].classList.remove('active');
						activeIdx = (activeIdx - 1 + suggestions.length) % suggestions.length;
						suggestions[activeIdx].classList.add('active');
						suggestions[activeIdx].scrollIntoView({ block: 'nearest' });
					} else if (e.key === 'Enter' && activeIdx !== -1) {
						e.preventDefault();
						suggestions[activeIdx].click();
					}
				}
			}),
			s.search.addEventListener('input', (e) => {
				var t;
				((n.search = e.target.value),
					(n.page = 0),
					s.clearSearch && (s.clearSearch.style.display = n.search ? 'block' : 'none'),
					(t = n.search),
					s.suggestions &&
						(t && !(t.length < 2) && 0 < (e = n.videos.filter((e) => e.title.toLowerCase().includes(t.toLowerCase())).slice(0, 5)).length
							? ((s.suggestions.innerHTML = e
									.map(
										(e) => `
        <div class="suggestion-item" role="option" data-id="${e.id}">
          <i class="fa-solid fa-magnifying-glass"></i>
          <span>${l.highlight(e.title, t)}</span>
        </div>
      `,
									)
									.join('')),
								(s.suggestions.style.display = 'block'),
								s.suggestions.setAttribute('aria-hidden', 'false'))
							: ((s.suggestions.style.display = 'none'), s.suggestions.setAttribute('aria-hidden', 'true'))),
					clearTimeout(n.debounceTimer),
					(n.debounceTimer = setTimeout(() => {
						((n.page = 0), k());
					}, 250)));
			}),
			document.addEventListener('click', (e) => {
				!s.suggestions ||
					s.search.contains(e.target) ||
					s.suggestions.contains(e.target) ||
					((s.suggestions.style.display = 'none'), s.suggestions.setAttribute('aria-hidden', 'true'));
			}),
			s.suggestions) &&
			s.suggestions.addEventListener('click', (e) => {
				if ((e = e.target.closest('.suggestion-item'))) {
					let t = e.dataset.id;
					(e = n.videos.find((e) => e.id === t)) &&
						((s.search.value = e.title), (n.search = e.title), (s.suggestions.style.display = 'none'), c(e));
				}
			}),
			s.clearSearch &&
				s.clearSearch.addEventListener('click', () => {
					(s.search && (s.search.value = ''), (n.search = ''), (n.page = 0), (s.clearSearch.style.display = 'none'), k());
				}),
			s.clearFilters &&
				s.clearFilters.addEventListener('click', () => {
					((n.categories = ['all']),
						document.querySelectorAll('.chip').forEach((e) => {
							'all' === e.dataset.cat ? e.classList.add('active') : e.classList.remove('active');
						}),
						(n.page = 0),
						k());
				}));
		var e = document.querySelector('.filter-chips');
		(e &&
			e.addEventListener('click', (e) => {
				if ((e = e.target.closest('.chip'))) {
					let t = e.dataset.cat;
					('all' === t
						? (n.categories = ['all'])
						: ((n.categories = n.categories.filter((e) => 'all' !== e)),
							n.categories.includes(t)
								? ((n.categories = n.categories.filter((e) => e !== t)), 0 === n.categories.length && (n.categories = ['all']))
								: n.categories.push(t)),
						document.querySelectorAll('.chip').forEach((e) => {
							n.categories.includes(e.dataset.cat) ? e.classList.add('active') : e.classList.remove('active');
						}),
						(n.page = 0),
						k());
				}
			}),
			s.themeToggle && s.themeToggle.addEventListener('click', f),
			s.heroBtn &&
				s.heroBtn.addEventListener('click', () => {
					n.hero && c(n.hero);
				}),
			s.heroSave &&
				s.heroSave.addEventListener('click', () => {
					n.hero && (g(n.hero), T(n.hero));
				}),
			s.closeModal && s.closeModal.addEventListener('click', h),
			s.modal &&
				s.modal.addEventListener('click', (e) => {
					e.target === s.modal && h();
				}),
			s.grid &&
				(s.grid.addEventListener('click', (e) => {
					var a = e.target.closest('.watch-later-btn');
					if (a) {
						e.stopPropagation();
						let t = a.dataset.id;
						(a = n.videos.find((e) => e.id === t)) && (g(a), k(), n.hero) && n.hero.id === t && T(n.hero);
					} else if ((a = e.target.closest('.card'))) {
						let t = a.dataset.id;
						(e = n.videos.find((e) => e.id === t)) && c(e);
					}
				}),
				s.grid.addEventListener('keydown', (e) => {
					if ('Enter' === e.key || ' ' === e.key) {
						var a = e.target.closest('.card');
						if (a) {
							e.preventDefault();
							let t = a.dataset.id;
							(e = n.videos.find((e) => e.id === t)) && c(e);
						}
					}
				})),
			s.loadMore &&
				s.loadMore.addEventListener('click', () => {
					(n.page++, k());
				}),
			s.watchLaterBadge && s.watchLaterBadge.addEventListener('click', p),
			s.closeWatchLater && s.closeWatchLater.addEventListener('click', y),
			s.watchLaterPage &&
				s.watchLaterPage.addEventListener('click', (e) => {
					e.target === s.watchLaterPage && y();
					var a = e.target.closest('.watch-later-btn');
					if (a) {
						e.stopPropagation();
						let t = a.dataset.id;
						(a = n.watchLater.find((e) => e.id === t)) && (g(a), v(), k());
					} else if ((a = e.target.closest('.card'))) {
						let t = a.dataset.id;
						(e = n.watchLater.find((e) => e.id === t) || n.videos.find((e) => e.id === t)) && (y(), c(e));
					}
				}),
			s.dashboardBtn && s.dashboardBtn.addEventListener('click', m),
			s.closeDashboard && s.closeDashboard.addEventListener('click', b),
			s.dashboardModal &&
				s.dashboardModal.addEventListener('click', (e) => {
					e.target === s.dashboardModal && b();
				}),
			s.toggleTranscript &&
				s.toggleTranscript.addEventListener('click', () => {
					s.transcriptPanel && 'true' === s.transcriptPanel.getAttribute('aria-hidden')
						? s.transcriptPanel &&
							(s.transcriptPanel.setAttribute('aria-hidden', 'false'), s.sharePanel) &&
							s.sharePanel.setAttribute('aria-hidden', 'true')
						: P();
				}),
			s.closeTranscript && s.closeTranscript.addEventListener('click', P),
			s.shareEpisode &&
				s.shareEpisode.addEventListener('click', () => {
					var e;
					s.sharePanel && 'true' === s.sharePanel.getAttribute('aria-hidden')
						? ((e = n.current),
							s.sharePanel &&
								e &&
								(s.shareLink && (s.shareLink.value = 'https://www.youtube.com/watch?v=' + e.id),
								s.sharePanel.setAttribute('aria-hidden', 'false'),
								s.transcriptPanel) &&
								s.transcriptPanel.setAttribute('aria-hidden', 'true'))
						: C();
				}),
			s.closeShare && s.closeShare.addEventListener('click', C),
			s.copyLinkBtn &&
				s.shareLink &&
				s.copyLinkBtn.addEventListener('click', () => {
					s.shareLink.select();
					try {
						navigator.clipboard
							.writeText(s.shareLink.value)
							.then(() => {
								l.showToast('Link copied!');
							})
							.catch(() => {
								(document.execCommand('copy'), l.showToast('Link copied!'));
							});
					} catch (e) {
						(document.execCommand('copy'), l.showToast('Link copied!'));
					}
				}),
			s.shareTwitter &&
				s.shareTwitter.addEventListener('click', () => {
					var e, t;
					n.current &&
						((e = encodeURIComponent('https://www.youtube.com/watch?v=' + n.current.id)),
						(t = encodeURIComponent(n.current.title)),
						window.open('https://twitter.com/intent/tweet?url=' + e + '&text=' + t, '_blank', 'noopener'));
				}),
			s.shareFacebook &&
				s.shareFacebook.addEventListener('click', () => {
					var e;
					n.current &&
						((e = encodeURIComponent('https://www.youtube.com/watch?v=' + n.current.id)),
						window.open('https://www.facebook.com/sharer/sharer.php?u=' + e, '_blank', 'noopener'));
				}),
			s.shareWhatsApp &&
				s.shareWhatsApp.addEventListener('click', () => {
					var e, t;
					n.current &&
						((e = encodeURIComponent('https://www.youtube.com/watch?v=' + n.current.id)),
						(t = encodeURIComponent(n.current.title + ' ')),
						window.open('https://wa.me/?text=' + t + e, '_blank', 'noopener'));
				}),
			s.retryBtn && s.retryBtn.addEventListener('click', A),
			s.scrollToTop &&
				(window.addEventListener('scroll', () => {
					500 < window.scrollY ? s.scrollToTop.classList.add('show') : s.scrollToTop.classList.remove('show');
				}),
				s.scrollToTop.addEventListener('click', () => {
					window.scrollTo({ top: 0, behavior: 'smooth' });
				})),
			document.addEventListener('keydown', (e) => {
				var t, a;
				'INPUT' === e.target.tagName || 'TEXTAREA' === e.target.tagName
					? 'Escape' === e.key && e.target.blur()
					: '/' === (t = e.key.toLowerCase())
						? (e.preventDefault(), s.search && s.search.focus())
						: 'escape' === t
							? (h(),
								y(),
								b(),
								(e = r('keyboardHints')) &&
									(e.setAttribute('aria-hidden', 'true'), (s.body.style.overflow = ''), s.body.classList.remove('modal-open')))
							: '?' === t
								? (e = r('keyboardHints')) &&
									((a = 'true' === e.getAttribute('aria-hidden')),
									e.setAttribute('aria-hidden', a ? 'false' : 'true'),
									(s.body.style.overflow = a ? 'hidden' : ''))
								: 't' === t
									? f()
									: n.current && ('j' === t ? u(-1) : 'k' === t && u(1));
			}),
			(e = r('closeHints')) &&
				e.addEventListener('click', () => {
					var e = r('keyboardHints');
					(e && e.setAttribute('aria-hidden', 'true'), (s.body.style.overflow = ''), s.body.classList.remove('modal-open'));
				}));
		let t = r('keyboardHints');
		t &&
			t.addEventListener('click', (e) => {
				e.target === t && (t.setAttribute('aria-hidden', 'true'), (s.body.style.overflow = ''), s.body.classList.remove('modal-open'));
			});

		// Header scroll effect
		const header = document.querySelector('.header');
		window.addEventListener('scroll', () => {
			if (window.scrollY > 20) {
				header.classList.add('scrolled');
			} else {
				header.classList.remove('scrolled');
			}
		});

		// Card interactive glow effect
		document.addEventListener('mousemove', (e) => {
			const cards = document.querySelectorAll('.card');
			cards.forEach(card => {
				const rect = card.getBoundingClientRect();
				const x = ((e.clientX - rect.left) / rect.width) * 100;
				const y = ((e.clientY - rect.top) / rect.height) * 100;
				card.style.setProperty('--mouse-x', `${x}%`);
				card.style.setProperty('--mouse-y', `${y}%`);
			});
		});

		// Studio Logic
		s.studioToggleBtn && s.studioToggleBtn.addEventListener('click', () => {
			const isStudioOpen = s.studioRoot.style.display === 'block';
			if (isStudioOpen) {
				s.studioRoot.style.display = 'none';
				s.appRoot.style.display = 'block';
				if(s.heroSection) s.heroSection.style.display = 'block';
				if(s.continueBlockSec && n.videos.some(v => d(v.id))) s.continueBlockSec.style.display = 'block';
				s.studioToggleBtn.classList.remove('active');
				s.studioToggleBtn.querySelector('span').textContent = 'Studio';
			} else {
				s.studioRoot.style.display = 'block';
				s.appRoot.style.display = 'none';
				if(s.heroSection) s.heroSection.style.display = 'none';
				if(s.continueBlockSec) s.continueBlockSec.style.display = 'none';
				s.studioToggleBtn.classList.add('active');
				s.studioToggleBtn.querySelector('span').textContent = 'Exit Studio';
			}
		});

		const startScriptBtn = document.getElementById("startScriptBtn");
		const openDemoBtn = document.getElementById("openDemoBtn");
		if (startScriptBtn) {
			startScriptBtn.addEventListener("click", () => {
				if (s.studioToggleBtn) s.studioToggleBtn.click();
				if (s.newProjectBtn) s.newProjectBtn.click();
			});
		}
		if (openDemoBtn) {
			openDemoBtn.addEventListener("click", () => {
				if (s.studioToggleBtn) s.studioToggleBtn.click();
				const resumeBtns = document.querySelectorAll(".resume-project-btn");
				if (resumeBtns.length > 0) resumeBtns[0].click();
			});
		}
		s.studioNavBtns && s.studioNavBtns.forEach(btn => {
			btn.addEventListener('click', () => {
				s.studioNavBtns.forEach(b => b.classList.remove('active'));
				btn.classList.add('active');
				const tab = btn.dataset.tab;
				s.studioViews.forEach(v => v.style.display = 'none');
				s.activeProjectView.style.display = 'none';
				const view = r('studio-view-' + tab);
				if(view) {
					view.style.display = 'block';
					view.classList.add('active');
				}
			});
		});

		s.newProjectBtn && s.newProjectBtn.addEventListener('click', () => {
			s.studioViews.forEach(v => v.style.display = 'none');
			s.activeProjectView.style.display = 'block';
			r('current-project-title').textContent = 'New Untitled Video';
			s.projectTabBtns[0].click(); // open research tab
		});

		s.backToProjectsBtn && s.backToProjectsBtn.addEventListener('click', () => {
			s.activeProjectView.style.display = 'none';
			r('studio-view-projects').style.display = 'block';
			s.studioNavBtns.forEach(b => {
				b.classList.remove('active');
				if(b.dataset.tab === 'projects') b.classList.add('active');
			});
		});

		s.projectTabBtns && s.projectTabBtns.forEach(btn => {
			btn.addEventListener('click', () => {
				s.projectTabBtns.forEach(b => b.classList.remove('active'));
				btn.classList.add('active');
				const ptab = btn.dataset.ptab;
				s.ptabContents.forEach(v => v.classList.remove('active'));
				const view = r('ptab-' + ptab);
				if(view) view.classList.add('active');
			});
		});
	}
	async function A() {
		try {
			if (
				(s.error && (s.error.style.display = 'none'),
				s.grid &&
					((e = Array(6)
						.fill(0)
						.map(
							() => `
      <div class="skeleton-card animate-pulse">
        <div class="skeleton skeleton-thumb" style="aspect-ratio:16/9; border-radius:var(--radius-md);"></div>
        <div class="skeleton skeleton-text" style="height:24px; width:90%; border-radius:4px;"></div>
        <div class="skeleton skeleton-text short" style="height:20px; width:50%; border-radius:4px;"></div>
      </div>
    `,
						)
						.join('')),
					(s.grid.innerHTML = e)),
				w(),
				(n.videos = await (async () => {
					var e = l.getLS(i.CACHE_KEY);
					if (e && e.data && e.data.length && Date.now() - e.time < i.CACHE_EXPIRY) return e.data;
					try {
						var t = (
							(
								await (
									await (async (r) => {
										let a = i.API_CONFIG.delay;
										for (let t = 0; t < i.API_CONFIG.retries; t++)
											try {
												let e = new AbortController(),
													t = setTimeout(() => e.abort(), i.API_CONFIG.timeout),
													a = await fetch(r, { signal: e.signal });
												if ((clearTimeout(t), a.ok)) return a;
												throw new Error('API Error: ' + a.status + ' ' + a.statusText);
											} catch (e) {
												if (t === i.API_CONFIG.retries - 1) throw e;
												(await new Promise((e) => setTimeout(e, a)), (a *= i.API_CONFIG.backoff));
											}
									})(i.API)
								).json()
							).videos || []
						).map((e) => {
							var t = e.id || e.videoId;
							return {
								id: t,
								title: e.title || 'Untitled',
								thumbnail: e.thumbnail || 'https://i.ytimg.com/vi/' + t + '/hqdefault.jpg',
								publishedAt: e.publishedAt || new Date().toISOString(),
								category: ((e) => {
									let t = e.toLowerCase();
									return (e = a.find((e) => e.terms.some((e) => t.includes(e)))) ? e.key : 'history';
								})(e.title || ''),
								description: e.description || 'Deep dive into Islamic history and theology.',
							};
						});
						return (0 < t.length && l.saveLS(i.CACHE_KEY, { data: t, time: Date.now() }), t);
					} catch (t) {
						if ((console.error('Failed to load videos:', t), e && e.data)) return e.data;
						throw t;
					}
				})()),
				n.videos.sort((e, t) => new Date(t.publishedAt) - new Date(e.publishedAt)),
				!(0 < n.videos.length))
			)
				throw new Error('No videos available in the archive.');
			(T(n.videos[0]), k(), t(), R(), E(), S(), renderProjects());
		} catch (e) {
			(s.error && (s.error.style.display = 'block'),
				s.errorMsg && (s.errorMsg.textContent = e.message || 'Connection failed. Please try again.'),
				console.error('Init Error:', e),
				S());
		} finally {
			s.loading && (s.loading.style.display = 'none');
		}
		var e;
	}
	'loading' === document.readyState ? document.addEventListener('DOMContentLoaded', A) : A();
})();
