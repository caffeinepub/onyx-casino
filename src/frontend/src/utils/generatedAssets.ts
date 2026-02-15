/**
 * Single source of truth for generated wheel/effect asset paths.
 * All paths are relative to the public directory.
 * 
 * IMPORTANT: The on-disk file must exist at:
 * frontend/public/assets/generated/casino-wheel-base.dim_1024x1024.png
 * 
 * This path is used by assetUrl() to construct the final URL served to the browser.
 */
export const GENERATED_ASSETS = {
  // Wheel base image
  // Required file: frontend/public/assets/generated/casino-wheel-base.dim_1024x1024.png
  wheelBase: 'assets/generated/casino-wheel-base.dim_1024x1024.png',
  
  // Win effect overlays
  winSparkles: 'assets/generated/win-sparkles-overlay-v2.dim_1024x1024.png',
  winBurst: 'assets/generated/win-burst-overlay-v2.dim_1024x1024.png',
  
  // Miss effect overlay
  missNeutral: 'assets/generated/miss-neutral-overlay.dim_1024x1024.png',
  
  // Crit loss effect overlay
  critLoss: 'assets/generated/crit-loss-overlay.dim_1024x1024.png',
} as const;
