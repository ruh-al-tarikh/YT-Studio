import { store } from '../core/store.js';

export class ThemeToggle {
  constructor() {
    this.btn = document.getElementById('darkMode');
    this.init();
  }

  init() {
    // Detect system preference if no stored theme
    if (!localStorage.getItem('yt_studio_theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      store.setState({ theme: prefersDark ? 'dark' : 'light' });
    }

    this.apply();

    this.btn?.addEventListener('click', () => {
      const newTheme = store.state.theme === 'dark' ? 'light' : 'dark';
      store.setState({ theme: newTheme });
      store.saveToStorage('yt_studio_theme', newTheme);
      this.apply();
    });
  }

  apply() {
    const theme = store.state.theme;
    document.body.className = theme === 'light' ? 'light-mode' : '';
    const icon = this.btn?.querySelector('i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fa-regular fa-moon' : 'fa-regular fa-sun';
    }
  }
}
