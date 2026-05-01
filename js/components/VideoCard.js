import { utils } from '../core/utils.js';

export const VideoCard = (v) => {
  const categoryLabel = (cat) => {
    const maps = {
      history: 'History',
      scripture: 'Scripture',
      prophecy: 'Prophecy',
      debate: 'Debate'
    };
    return maps[cat] || 'General';
  };

  return `
    <article class="card" data-id="${v.id}" role="button" tabindex="0" aria-label="Play video: ${utils.sanitize(v.title)}">
      <div class="card-image-container">
        <img src="${v.thumbnail}" loading="lazy" alt="${utils.sanitize(v.title)}" class="card-img" />
        <div class="card-play-overlay" aria-hidden="true">
          <i class="fa-solid fa-play"></i>
        </div>
      </div>
      <div class="card-content">
        <h3 class="card-title">${utils.sanitize(utils.truncate(v.title, 60))}</h3>
        <div class="card-meta">
          <span class="card-category">${categoryLabel(v.category)}</span>
          <span class="card-separator">•</span>
          <span class="card-date">${utils.formatDate(v.publishedAt)}</span>
        </div>
      </div>
    </article>
  `;
};

export const SkeletonCard = () => `
  <div class="card skeleton">
    <div class="card-image-container skeleton-img"></div>
    <div class="card-content">
      <div class="skeleton-text skeleton-title"></div>
      <div class="skeleton-text skeleton-meta"></div>
    </div>
  </div>
`;
