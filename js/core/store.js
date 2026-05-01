export const store = {
  state: {
    videos: [],
    filtered: [],
    search: '',
    category: 'all',
    page: 0,
    theme: localStorage.getItem('yt_studio_theme') || 'dark',
    watchLater: JSON.parse(localStorage.getItem('yt_studio_watch_later') || '[]'),
    history: JSON.parse(localStorage.getItem('yt_studio_history') || '[]'),
    current: null,
    queue: [],
    progress: JSON.parse(localStorage.getItem('yt_studio_progress') || '{}'),
  },

  listeners: [],

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
  },

  saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};
