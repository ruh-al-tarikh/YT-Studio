## 2025-04-12 - [Accessibility & Micro-UX in Video Galleries]
**Learning:** When dynamically rendering YouTube content, always include `title` on iframes and `alt` on thumbnails for screen reader accessibility. Adding a loading state in the container before the async fetch completes prevents "layout shift" feeling and informs the user something is happening.
**Action:** Ensure all dynamic media rendering includes appropriate ARIA/alt/title attributes and a visible loading state.

## 2025-05-15 - [Keyboard Accessibility and Focus States]
**Learning:** Interactive elements like video cards and modal close buttons often lack keyboard support and visible focus indicators, making the app unusable for screen reader or keyboard-only users.
**Action:** Always add tabindex="0", role="button", and appropriate ARIA labels to custom interactive elements. Ensure focus-visible styles are defined for all interactive components.
