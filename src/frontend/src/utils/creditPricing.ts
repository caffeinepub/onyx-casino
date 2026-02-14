/**
 * Deterministic UI-only helpers to derive credits-per-INR conversion from packages
 * and compute credits for custom INR amounts.
 */

interface CreditPackage {
  name: string;
  credits: bigint;
  priceInrMultiplier: bigint;
}

/**
 * Derives a credits-per-INR ratio from available packages.
 * Uses the median ratio to avoid outliers affecting custom pricing.
 */
export function deriveCreditsPerINR(packages: CreditPackage[]): number {
  if (!packages || packages.length === 0) {
    return 0;
  }

  // Calculate ratio for each package
  const ratios = packages.map(pkg => {
    const credits = Number(pkg.credits);
    const inr = Number(pkg.priceInrMultiplier);
    return inr > 0 ? credits / inr : 0;
  }).filter(ratio => ratio > 0);

  if (ratios.length === 0) {
    return 0;
  }

  // Use median ratio for stability
  ratios.sort((a, b) => a - b);
  const mid = Math.floor(ratios.length / 2);
  return ratios.length % 2 === 0
    ? (ratios[mid - 1] + ratios[mid]) / 2
    : ratios[mid];
}

/**
 * Computes credits for a given INR amount using the derived ratio.
 */
export function computeCreditsFromINR(inrAmount: number, packages: CreditPackage[]): bigint {
  const ratio = deriveCreditsPerINR(packages);
  if (ratio === 0) {
    return BigInt(0);
  }
  
  const credits = Math.floor(inrAmount * ratio);
  return BigInt(credits);
}

/**
 * Validates if packages are available for pricing calculations.
 */
export function arePackagesAvailable(packages: CreditPackage[] | undefined): boolean {
  return !!packages && packages.length > 0 && deriveCreditsPerINR(packages) > 0;
}
