export const utils = {
  sanitize: (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  truncate: (str, len) => {
    if (!str || str.length <= len) return str;
    return str.slice(0, len).trim() + '...';
  },

  formatDate: (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  },

  getLS: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  },

  saveLS: (key, val) => {
    localStorage.setItem(key, JSON.stringify(val));
  },

  detectCategory: (title) => {
    const t = title.toLowerCase();
    if (t.includes('prophet') || t.includes('seerah')) return 'prophecy';
    if (t.includes('debate') || t.includes('vs')) return 'debate';
    if (t.includes('scripture') || t.includes('quran') || t.includes('bible')) return 'scripture';
    return 'history';
  }
};
