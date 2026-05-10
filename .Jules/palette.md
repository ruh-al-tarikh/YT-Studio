# Palette Journal
## 2025-05-01 - Duplicate Logic and Accessibility Fixes
**Learning:** Redundant event listeners and missing keyboard hints reduce application stability and discoverability of features.
**Action:** Always audit for structural duplicates in main JS files and provide clear keyboard shortcut hints.
## 2025-05-01 - Video Playback and Loading Stability
**Learning:** API timeouts and inconsistent video ID normalization (videoId vs id) can cause broken playback experiences.
**Action:** Use a unified normalization step in data fetching and provide robust logging for debugging.

## 2025-05-03 - Header Enhancements & Grid Layout
**Learning:** For a "Cinematic Archive", larger typography and a consistent grid layout (3 columns) improve the premium feel and readability.
**Action:** Ensure typography scales are consistent with the design system (OKLCH) and grid layouts are responsive but structured.

## 2025-05-03 - Empty State Implementation with CTA
**Learning:** Empty states should guide users with clear next steps. Using dynamic injection for modal-based empty states avoids static HTML clutter while maintaining consistent state management.
**Action:** Implement dashed borders and clear iconography for empty states. Always include an accessible call-to-action (CTA) even if the feature is still in development.

## 2025-05-04 - Advanced Personalization & Smart UX
**Learning:** Transitioning from "Good UI" to "Intelligent Experience" involves behavior-based state management (Watch Progress, Multi-select Filtering, Live Suggestions).
**Action:** Use YouTube Iframe API for granular progress tracking. Implement regex-based highlighting for search discoverability. Use 'modal-open' body classes to trigger global immersive styles (dimming/blurring).
## 2024-05-04 - YouTube API Data Fetching Optimization
**Learning:** Using the 'search' endpoint for listing channel videos is quota-intensive and less reliable for production.
**Action:** Transitioned to 'playlistItems' logic by fetching the channel's 'uploads' playlist ID first. This reduces quota usage and provides more consistent results for live data loading.

## 2024-05-07 - "Scroll to Top" Implementation for Infinite Feeds
**Learning:** In long-scrolling cinematic archives, providing a quick return to navigation is essential for orientation. Leveraging existing JS logic for missing UI elements (like scrollToTop) ensures feature parity across development cycles.
**Action:** Always verify if JS event handlers assume the presence of specific DOM elements and implement them if missing to maintain expected UX.

## 2024-05-20 - Accessible Custom Chips without Layout Shifts
**Learning:** Converting non-semantic interactive elements (like custom-styled spans) to buttons can introduce unintended layout shifts due to browser-default button styles (padding, border, appearance). Using role="button" with tabindex="0" and explicit keydown listeners provides the same accessibility benefits while preserving the intended visual design.
**Action:** Use role="button" + tabindex="0" + keydown listeners for complex custom-styled interactive elements that aren't easily replaced by standard buttons without layout regressions.
## 2024-05-21 - Enhanced Accessibility for Dynamic Content and State Toggles
**Learning:** For dynamic applications with real-time filtering and mode switching, using `aria-live` and `aria-pressed` significantly improves the experience for assistive technology users by announcing state changes that are otherwise purely visual.
**Action:** Always pair visual state changes (like "active" classes) with corresponding ARIA attributes (`aria-pressed`, `aria-expanded`) and use `aria-live` regions for status updates like search result counts.
## 2025-05-08 - Accessible Tooltips and Touch Target Reliability
**Learning:** Pairing `aria-label` with `title` on icon-only buttons provides a dual-layer of UX: screen reader accessibility and visual tooltips for mouse users. Additionally, ensuring click listeners target the parent button rather than nested decorative elements (like badges) prevents "dead zones" in the UI.
**Action:** Always wrap icons and badges in semantic buttons and apply attributes to the outermost interactive element. Use 'title' for native tooltips on all icon-only actions.
