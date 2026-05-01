import { store } from './store.js';

export const setupInfiniteScroll = (element, callback) => {
  if (!element) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      const { videos, search, category, page } = store.state;
      const q = search.toLowerCase();

      const filteredCount = videos.filter(v => {
        const matchCat = category === 'all' || v.category === category;
        const matchSearch = !q || v.title.toLowerCase().includes(q);
        return matchCat && matchSearch;
      }).length;

      // If we haven't reached the end, load more
      if ((page + 1) * 12 < filteredCount) {
        store.setState({ page: page + 1 });
        callback();
      }
    }
  }, { rootMargin: '400px' });

  observer.observe(element);
  return observer;
};
