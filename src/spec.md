# Specification

## Summary
**Goal:** Implement a 4-section Tiger/Dragon/Miss/Crit spin wheel with proper circular rendering, fixed pointer, smooth spin flow, correct payouts, and outcome feedback.

**Planned changes:**
- Replace the current wheel rendering in `frontend/src/components/game/SpinWheel.tsx` with a true circular wheel divided into exactly 4 labeled segments: Tiger, Dragon, Miss, Crit (not a rotated square/diamond image), and keep it visible in both idle and spinning states.
- Add/ensure a fixed pointer at the top-center that stays stationary while the wheel rotates and indicates the final segment when the spin stops.
- In `frontend/src/pages/GamePage.tsx`, implement a smooth spin interaction: on Spin click, call backend to deduct 50 credits, animate rotation smoothly, stop on backend outcome, disable Spin during animation, and show an English result popup/notification styled by outcome (win=green for Tiger/Dragon, neutral for Miss, red for Crit); block spins under 50 credits with an English error message.
- Ensure displayed balance updates from backend `balanceAfterSpin` and reflects payout rules: cost 50; Dragon pays 1.96×50; Tiger pays 1.4×50; Miss pays 0; Crit applies an additional -25 beyond spin cost.
- Update backend `spinWheel()` in `backend/main.mo` to produce variable outcomes per spin (not constant) using configured probabilities and return `outcome`, `profit`, and `balanceAfterSpin` consistent with the payout rules.
- Show outcome-specific visual effects only after the wheel stops: reward effect for Tiger/Dragon, neutral effect for Miss, and loss animation for Crit; allow spinning again after effects complete.

**User-visible outcome:** The Game page shows a always-visible circular 4-section wheel with a fixed pointer; clicking Spin smoothly animates the wheel, lands on Tiger/Dragon/Miss/Crit, updates balance correctly for the 50-credit spin and payout rules, and displays an outcome popup/effect with appropriate win/neutral/loss styling.
