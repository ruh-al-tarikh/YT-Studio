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
