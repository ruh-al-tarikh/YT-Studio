import { store } from './core/store.js';
import { utils } from './core/utils.js';
import { VideoCard } from './components/VideoCard.js';
import { VideoPlayer } from './components/VideoPlayer.js';
import { SearchBar } from './components/SearchBar.js';
import { ThemeToggle } from './components/ThemeToggle.js';
import { Toast } from './components/Toast.js';
import { setupInfiniteScroll } from './core/infiniteScroll.js';

class App {
  constructor() {
    this.config = {
      API: 'https://yt-studio-api.ruhdevopsytstudio.workers.dev/api/videos',
      ITEMS_PER_PAGE: 12
    };

    this.elements = {
      grid: document.getElementById('grid'),
      loadMore: document.getElementById('loadMoreBtn'),
      loadMoreContainer: document.getElementById('loadMoreContainer'),
      heroTitle: document.getElementById('hero-title'),
      heroSubtitle: document.getElementById('hero-subtitle'),
      heroBtn: document.getElementById('hero-btn'),
      heroSave: document.getElementById('hero-save-btn'),
      bg: document.getElementById('hero-bg'),
      loading: document.querySelector('.loading-state'),
      error: document.querySelector('.error-container'),
      errorMsg: document.getElementById('error-msg'),
      retry: document.getElementById('retryBtn'),
      chips: document.querySelectorAll('.pill-button'),
      statTotal: document.getElementById('stat-total'),
      statSaved: document.getElementById('stat-saved'),
      watchLaterCount: document.getElementById('watchLaterCount')
    };

    this.player = new VideoPlayer();
    this.searchBar = new SearchBar(() => this.render());
    this.themeToggle = new ThemeToggle();

    this.init();
  }

  async init() {
    try {
      this.showLoading(true);
      await this.fetchVideos();
      this.bindEvents();
      this.render();
      this.updateStats();
      this.registerSW();

      if (this.elements.loadMoreContainer) {
        setupInfiniteScroll(this.elements.loadMoreContainer, () => this.render());
      }
    } catch (e) {
      this.showError(e.message);
    } finally {
      this.showLoading(false);
    }
  }

  async fetchVideos() {
    const res = await fetch(this.config.API);
    if (!res.ok) throw new Error('Failed to fetch from archive');
    const json = await res.json();

    const videos = (json.videos || []).map(v => ({
      id: v.id || v.videoId,
      title: v.title || 'Untitled',
      thumbnail: v.thumbnail,
      publishedAt: v.publishedAt || new Date().toISOString(),
      category: utils.detectCategory(v.title || ''),
      description: v.description || 'No description available.'
    }));

    store.setState({
      videos: videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    });

    if (videos.length) this.setHero(videos[0]);
  }

  setHero(v) {
    if (!v) return;
    if (this.elements.heroTitle) this.elements.heroTitle.textContent = v.title;
    if (this.elements.heroSubtitle) this.elements.heroSubtitle.textContent = utils.truncate(v.description, 160);
    if (this.elements.bg) {
      this.elements.bg.style.backgroundImage = `linear-gradient(to bottom, rgba(4,8,15,0.7), rgba(4,8,15,1)), url(${v.thumbnail})`;
    }
    this.elements.heroBtn?.addEventListener('click', () => this.player.play(v));
  }

  render() {
    const { videos, search, category, page } = store.state;
    const q = search.toLowerCase();

    const filtered = videos.filter(v => {
      const matchCat = category === 'all' || v.category === category;
      const matchSearch = !q || v.title.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    const slice = filtered.slice(0, this.config.ITEMS_PER_PAGE * (page + 1));
    if (this.elements.grid) {
      this.elements.grid.innerHTML = slice.map(VideoCard).join('');
    }

    if (this.elements.loadMoreContainer) {
      this.elements.loadMoreContainer.style.display =
        slice.length < filtered.length ? 'block' : 'none';
    }
  }

  bindEvents() {
    this.elements.loadMore?.addEventListener('click', () => {
      store.setState({ page: store.state.page + 1 });
      this.render();
    });

    this.elements.chips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.elements.chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        store.setState({ category: chip.dataset.cat, page: 0 });
        this.render();
      });
    });

    this.elements.grid?.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (!card) return;
      const video = store.state.videos.find(v => v.id === card.dataset.id);
      if (video) this.player.play(video);
    });

    this.elements.heroSave?.addEventListener('click', () => {
      const hero = store.state.videos[0];
      if (!hero) return;
      const watchLater = store.state.watchLater;
      if (!watchLater.includes(hero.id)) {
        const next = [...watchLater, hero.id];
        store.setState({ watchLater: next });
        store.saveToStorage('yt_studio_watch_later', next);
        Toast.show('Saved to Watch Later');
        this.updateStats();
      } else {
        Toast.show('Already saved');
      }
    });

    this.elements.retry?.addEventListener('click', () => this.init());
  }

  updateStats() {
    const { videos, watchLater } = store.state;
    if (this.elements.statTotal) this.elements.statTotal.textContent = videos.length;
    if (this.elements.statSaved) this.elements.statSaved.textContent = watchLater.length;
    if (this.elements.watchLaterCount) this.elements.watchLaterCount.textContent = watchLater.length;
  }

  showLoading(show) {
    if (this.elements.loading) this.elements.loading.style.display = show ? 'grid' : 'none';
  }

  showError(msg) {
    if (this.elements.error) this.elements.error.style.display = 'grid';
    if (this.elements.errorMsg) this.elements.errorMsg.textContent = msg;
  }

  registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new App());
