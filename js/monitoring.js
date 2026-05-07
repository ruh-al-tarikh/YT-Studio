import { isFeatureEnabled } from './config.js';

export const initMonitoring = () => {
  if (!isFeatureEnabled('WEB_VITALS')) return;

  // Simple Web Vitals tracker
  const reportVital = ({ name, delta, value, id }) => {
    console.log(`[Performance] ${name}: ${value.toFixed(2)} (ID: ${id})`);
    // Here you would send to your analytics endpoint
  };

  if ('performance' in window && 'getEntriesByType' in performance) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const paint = performance.getEntriesByType('paint');
        paint.forEach(entry => {
          console.log(`[Performance] ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
        });

        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          console.log(`[Performance] Load Time: ${navigation.loadEventEnd.toFixed(2)}ms`);
          console.log(`[Performance] TTFB: ${navigation.responseStart.toFixed(2)}ms`);
        }
      }, 0);
    });
  }

  // Error logging
  window.addEventListener('error', (event) => {
    console.error('[Runtime Error]', {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      col: event.colno,
      error: event.error
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Promise Rejection]', event.reason);
  });
};
