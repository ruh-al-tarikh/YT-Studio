<<<<<<< SEARCH
        // Show skeleton loading
        if (DOM.grid) {
            DOM.grid.innerHTML = Array(6).fill(0).map(() => `
                <div class="skeleton-card">
                    <div class="skeleton skeleton-thumb" style="aspect-ratio:16/9; border-radius:var(--radius-md);"></div>
                    <div class="skeleton skeleton-text" style="height:24px; width:90%; border-radius:4px;"></div>
                    <div class="skeleton skeleton-text short" style="height:20px; width:50%; border-radius:4px;"></div>
                </div>
            `).join('');
        }
=======
        // Show skeleton loading
        if (DOM.grid) {
            DOM.grid.innerHTML = Array(CONFIG.UI.ITEMS_PER_PAGE).fill(0).map(() => `
                <div class="skeleton-card">
                    <div class="skeleton skeleton-thumb"></div>
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-meta"></div>
                </div>
            `).join('');
        }
>>>>>>> REPLACE
