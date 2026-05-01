/**
 * Vercel Web Analytics Initialization
 * Documentation: https://vercel.com/docs/analytics/quickstart
 */

import { inject } from '@vercel/analytics';

// Initialize Vercel Web Analytics
inject({
  mode: 'auto', // auto-detects environment (production/development)
  debug: false, // set to true for console logging in development
  beforeSend: (event) => {
    // Optional: modify or filter events before sending
    // Return null to cancel the event, or return the modified event
    return event;
  }
});
