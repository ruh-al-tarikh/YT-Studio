# Canvas Journal

## 2024-05-09 - Staggered Grid Animations
**Learning:** Using CSS variables for staggered delays (calc(var(--index) * 80ms)) provides a performant and elegant way to orchestrate entry animations in dynamic grids. Transitioning from transform to translate/scale can avoid layout thrash.
**Action:** Always pass a loop index to render functions to enable micro-UX orchestrations without complex JS timers.
