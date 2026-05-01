import { store } from '../core/store.js';

export class VideoPlayer {
  constructor() {
    this.player = null;
    this.container = document.getElementById('modal');
    this.iframe = document.getElementById('player');
    this.title = document.getElementById('video-title');
    this.closeBtn = document.getElementById('close');
    this.shareLink = document.getElementById('shareLink');

    this.init();
  }

  init() {
    this.closeBtn?.addEventListener('click', () => this.close());
    window.addEventListener('message', this.handleYTEvents.bind(this));

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (this.container?.getAttribute('aria-hidden') === 'false') {
        if (e.code === 'Space') {
          e.preventDefault();
          this.togglePlay();
        }
        if (e.code === 'ArrowRight') this.seek(10);
        if (e.code === 'ArrowLeft') this.seek(-10);
      }
    });
  }

  handleYTEvents(event) {
    if (event.origin !== 'https://www.youtube.com') return;
    try {
      const data = JSON.parse(event.data);
      if (data.event === 'onStateChange' && data.info === 0) { // Ended
        this.playNext();
      }
    } catch (e) {}
  }

  play(video) {
    if (!video) return;
    store.setState({ current: video });

    const url = `https://www.youtube.com/embed/${video.id}?enablejsapi=1&autoplay=1&modestbranding=1&rel=0`;
    if (this.iframe) this.iframe.src = url;
    if (this.title) this.title.textContent = video.title;
    if (this.shareLink) this.shareLink.value = `https://youtu.be/${video.id}`;

    this.container.style.display = 'block';
    this.container.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Add to history
    const history = [video.id, ...store.state.history.filter(id => id !== video.id)].slice(0, 50);
    store.setState({ history });
    store.saveToStorage('yt_studio_history', history);
  }

  close() {
    this.container.style.display = 'none';
    this.container.setAttribute('aria-hidden', 'true');
    if (this.iframe) this.iframe.src = '';
    document.body.style.overflow = '';
    store.setState({ current: null });
  }

  togglePlay() {
    this.iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    // Simplified: would need better state tracking for true toggle
  }

  seek(seconds) {
    // Requires Player API properly initialized
  }

  playNext() {
    const { videos, current } = store.state;
    const idx = videos.findIndex(v => v.id === current?.id);
    if (idx !== -1 && idx < videos.length - 1) {
      this.play(videos[idx + 1]);
    }
  }
}
