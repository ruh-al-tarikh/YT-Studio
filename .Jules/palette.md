# Palette UX Journal - Jules

## Accessibility Insights
- **Tap Targets:** Increased all buttons and interactive elements to at least 44px for better mobile accessibility.
- **ARIA Labels:** Added aria-labels to the modal close button.
- **Contrast:** Maintained high contrast with OKLCH colors and premium dark theme tokens.

## Patterns
- **Iframe Facade:** Used thumbnails and only load iframes on interaction (modal/preview) to save bandwidth and improve TTI.
- **Data Resiliency:** Implemented a multi-tier fetch strategy: Cache -> API -> Fallback JSON.

## Design Decisions
- **Typography:** Normalized heading scales to prevent oversized titles on smaller screens.
- **Error States:** Added a explicit "Retry" path for data fetch failures to prevent "silent" failures or infinite spinners.
