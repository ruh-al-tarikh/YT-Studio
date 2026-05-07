<<<<<<< SEARCH
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        init();
        bindEvents();
    });
} else {
    init();
    bindEvents();
}
=======
// PWA Support & App Lifecycle
let deferredPrompt;
const setupPWA = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('[PWA] Service Worker registered'))
        .catch(err => console.log('[PWA] Registration failed:', err));
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] Install prompt ready');
  });

  window.addEventListener('online', () => {
    if (window.utils && utils.showToast) {
      utils.showToast('Back online! Syncing data...', 'success');
    }
    document.body.classList.remove('offline-mode');
  });

  window.addEventListener('offline', () => {
    if (window.utils && utils.showToast) {
      utils.showToast('You are offline. Some features may be limited.', 'warning');
    }
    document.body.classList.add('offline-mode');
  });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        init();
        bindEvents();
        setupPWA();
    });
} else {
    init();
    bindEvents();
    setupPWA();
}
>>>>>>> REPLACE
