# Palette UX Journal - Jules

## Accessibility Insights
- **Tap Targets:** Increased all buttons and interactive elements to at least 44px for better mobile accessibility.
- **ARIA Labels:** Added aria-labels to the modal close button.
- **Contrast:** Maintained high contrast with OKLCH colors and premium dark theme tokens.

## Patterns
- **Iframe Facade:** Used thumbnails and only load iframes on interaction (modal/preview) to save bandwidth and improve TTI.
- **Data Resiliency:** Implemented a multi-tier fetch strategy: Cache -> API -> Fallback JSON.

## Rejected Design Changes
- **React Migration:** Considered finishing the React migration mentioned in memory, but decided against it to avoid breaking existing legacy DOM logic as per instructions.

## 2025-05-22 - Accessibility and Cleanup
**Learning:** Redundant code and structural duplicates (like multiple modals) lead to inconsistent UX and accessibility gaps. Keyboard navigation (Enter/Space/Escape) and proper ARIA roles are essential for an inclusive video platform.
**Action:** Always audit the HTML for duplicates before adding new features and ensure all custom interactive elements (like div-based cards) have role="button" and keyboard listeners.
## Design Decisions
- **Typography:** Normalized heading scales to prevent oversized titles on smaller screens.
- **Error States:** Added a explicit "Retry" path for data fetch failures to prevent "silent" failures or infinite spinners.
