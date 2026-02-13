# Specification

## Summary
**Goal:** Refine the India-focused betting app for a premium, mobile-first dark-mode experience with strict admin RBAC, Razorpay (UPI) payments in INR, and a redesigned premium spin wheel.

**Planned changes:**
- Enforce strict RBAC in the frontend: hide all admin navigation/entry points for non-admin users and prevent access to admin routes/pages.
- Enforce RBAC in the backend: restrict admin-only operations (including payment configuration) to admins, and restrict purchase/verification endpoints to authorized users only.
- Replace Stripe with a Razorpay checkout flow (UPI/Indian banking methods), including backend creation of Razorpay orders and backend verification before granting credits.
- Switch all user-facing currency display and payment amounts from USD to INR (₹), including consistent formatting across buy credits, confirmations, and transactions.
- Polish the UI to a cohesive premium dark-mode aesthetic with subtle page-entry animations and refined hover/tap states (English text only).
- Redesign the Spin Wheel visuals/animation for a high-end metallic/gold look with smoother rotation while remaining server-authoritative, plus a distinct win-only celebration animation.
- Improve mobile-first responsiveness with an app-like layout, including a persistent bottom navigation bar on small screens (Admin only for admins).

**User-visible outcome:** Non-admin users will no longer see or access any admin UI; users can buy credits in INR via Razorpay (UPI/banking) with credits granted only after verified payment; the app looks and feels like a premium dark-mode mobile experience with a redesigned spin wheel and a clearer mobile navigation.
