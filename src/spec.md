# Specification

## Summary
**Goal:** Improve focus and readability by applying a consistent blurred + dimmed backdrop behind any open overlay UI (modals and sheets).

**Planned changes:**
- Add global CSS/theme overrides to apply a dim + blur effect to overlay backdrops used by existing dialogs/modals (e.g., ProfileSetupModal).
- Apply the same dim + blur backdrop effect to slide-over sheets (e.g., the mobile navigation hamburger menu).
- Ensure the blur/dim affects only the page behind the overlay (not the modal/sheet content) and make no changes to immutable `frontend/src/components/ui` files.

**User-visible outcome:** When a modal or sheet opens, the rest of the app is visibly dimmed and blurred, keeping attention on the active popup while the popup content remains crisp.
