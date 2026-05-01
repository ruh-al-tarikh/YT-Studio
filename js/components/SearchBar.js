import { store } from '../core/store.js';

export class SearchBar {
  constructor(renderCallback) {
    this.input = document.getElementById('search');
    this.clearBtn = document.getElementById('clearSearch');
    this.render = renderCallback;
    this.debounceTimer = null;

    this.init();
  }

  init() {
    this.input?.addEventListener('input', (e) => {
      const val = e.target.value;
      if (this.clearBtn) this.clearBtn.style.display = val ? 'block' : 'none';

      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        store.setState({ search: val, page: 0 });
        this.render();
      }, 300);
    });

    this.clearBtn?.addEventListener('click', () => {
      if (this.input) this.input.value = '';
      this.clearBtn.style.display = 'none';
      store.setState({ search: '', page: 0 });
      this.render();
    });

    // Slash to focus
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== this.input) {
        e.preventDefault();
        this.input?.focus();
      }
    });
  }
}
