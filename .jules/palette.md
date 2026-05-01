## 2026-05-20 - [Accessibility & Modal Integration]
**Learning:** Vanilla JS SPAs often lack keyboard accessibility (tabindex, role="button") and focus management when handling dynamic content like video grids and modals. Always ensure interactive elements are keyboard-reachable and that focus is trapped or directed when modals open.
**Action:** Consistently apply `role="button"`, `tabindex="0"`, and `aria-label` to custom interactive cards. Use `setTimeout` to shift focus to close buttons in modals for immediate keyboard accessibility.
