# Specification

## Summary
**Goal:** Fix the wheel UI so segment labels are properly centered within wedges and the pointer is correctly aligned/styled/animated.

**Planned changes:**
- Adjust wheel SVG label placement so each segment name (TIGER/DRAGON/MISS/CRIT) and multiplier renders centered inside its wedge with padding from divider lines and rims across responsive sizes.
- Reposition the wheel pointer to the exact top-middle (12 o’clock) and ensure its centering transform is not overridden by animation.
- Replace the pointer asset with a cleaned transparent version (no grey border/background).
- Update pointer animation from left-right/scale pulsing to a subtle repeating up-down bobbing motion while keeping perfect horizontal centering.

**User-visible outcome:** On the game wheel, labels sit clearly within their segments and the glowing yellow pointer sits centered at 12 o’clock, animating vertically without drifting.
