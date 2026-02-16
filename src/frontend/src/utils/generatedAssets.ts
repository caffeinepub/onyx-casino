/**
 * Single source of truth for generated wheel/effect asset paths.
 * All paths are relative to the public directory.
 * 
 * IMPORTANT: The on-disk file must exist at:
 * frontend/public/assets/generated/casino-wheel-base.dim_1024x1024.png
 * frontend/public/assets/generated/spin-wheel-base.dim_1024x1024.png
 * etc.
 * 
 * These paths are used with assetUrl() helper to construct full URLs.
 */
export const GENERATED_ASSETS = {
  // Wheel base images
  casinoWheelBase: '/assets/generated/casino-wheel-base.dim_1024x1024.png',
  spinWheelBase: '/assets/generated/spin-wheel-base.dim_1024x1024.png',
  spinWheelFace: '/assets/generated/spin-wheel-face.dim_1024x1024.png',
  spinWheelGloss: '/assets/generated/spin-wheel-gloss-overlay.dim_1024x1024.png',
  spinWheelRim: '/assets/generated/spin-wheel-rim-overlay.dim_1024x1024.png',
  wheelFrame: '/assets/generated/wheel-frame-overlay.dim_1024x1024.png',
  wheelIcons: '/assets/generated/wheel-icons-set.dim_512x512.png',
  
  // Pointer - cleaned version without grey border
  glowingPointer: '/assets/generated/glowing-yellow-pointer-clean.dim_256x256.png',
  spinWheelPointerGold: '/assets/generated/spin-wheel-pointer-gold.dim_512x512.png',
  
  // Outcome effect overlays
  winSparkles: '/assets/generated/win-sparkles-overlay-v2.dim_1024x1024.png',
  winBurst: '/assets/generated/win-burst-overlay-v2.dim_1024x1024.png',
  winCelebration: '/assets/generated/win-celebration-burst.dim_1024x1024.png',
  missNeutral: '/assets/generated/miss-neutral-overlay.dim_1024x1024.png',
  critLoss: '/assets/generated/crit-loss-overlay.dim_1024x1024.png',
  
  // Background and branding
  onyxBackground: '/assets/generated/onyx-background.dim_1920x1080.png',
  onyxOrnament: '/assets/generated/onyx-ornament-texture.dim_1920x1080.png',
  onyxWordmark: '/assets/generated/onyx-wordmark.dim_1024x256.png',
  
  // Manual payment QR
  manualPaymentQR: '/assets/generated/manual-payment-qr.dim_1024x1024.png',
} as const;
