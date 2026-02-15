# Specification

## Summary
**Goal:** Update the app UI to match the provided dark premium casino reference style and improve perceived performance by reducing unnecessary refetching and blocking loading states.

**Planned changes:**
- Update the global layout (header/navigation/background) to match the reference: dark premium header surface, compact pill-style nav items with clear active state, and a right-side “Verified Secure” badge plus balance chip (with placeholder while loading).
- Redesign the Game page layout and hierarchy to match the reference: left marketing hero (headline, description, jackpot badge), right wheel area, two quick-action buttons (Deposit Funds / View History), and a wide gradient primary spin CTA showing “50 credits”, while keeping existing game behavior unchanged.
- Apply the same visual system across all user and admin pages (typography, spacing, page headers, card/panel surfaces, and button styles) without changing existing flows or user-facing text.
- Improve page load/transition performance by reducing repeated React Query refetching, using cached data when available, avoiding full-page spinners, and limiting query invalidation/refetch during actor initialization—without backend interface changes.

**User-visible outcome:** The app visually matches the provided premium casino reference across pages, the Game page has the new hero/wheel/CTA layout, and navigation between pages feels immediate with fewer blocking loading screens when data is already cached.
