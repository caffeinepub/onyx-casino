# Specification

## Summary
**Goal:** Make loading/spinning feedback clearly visible during wheel spins and while wheel images load, especially in dark mode and disabled-button states.

**Planned changes:**
- Update the Spin button UI on GamePage so that when a spin is in progress (`isSpinning` / `showEffects`), it shows an animated spinner plus the text “Spinning...” with styling that remains high-contrast and fully visible even when the button is disabled.
- Standardize wheel-area loading behavior so a visible loading indicator (spinner + short label) is shown until the wheel image is actually rendered.
- Add a clear fallback state in the wheel area for wheel image load errors/timeouts (avoid showing a blank wheel area).
- Implement the above by composing/overriding styles at usage sites (e.g., GamePage) or in non-immutable components (e.g., PremiumSpinner) without modifying files under `frontend/src/components/ui`.

**User-visible outcome:** When users tap Spin, they always see a clearly visible spinner and “Spinning...” label during the spin (even though the button is disabled), and they see an obvious loading indicator in the wheel area until the wheel image appears—with a clear fallback if the wheel image fails to load.
