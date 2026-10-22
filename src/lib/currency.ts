/**
 * Financial Calculation & Monetary Utilities (E1)
 * All monetary amounts are stored as integer minor units (piasters: 1 EGP = 100 piasters).
 * Never use floating-point arithmetic for currency calculations.
 */

export const CURRENCY_CODE = 'EGP';
export const CURRENCY_SYMBOL = 'EGP';
export const FREE_SHIPPING_THRESHOLD_PIASTERS = 100000; // 1,000.00 EGP

/**
 * Format integer piasters into a luxury formatted string
 * e.g., 240000 -> "2,400.00 EGP"
 */
export function formatPrice(piasters: number, showDecimals: boolean = true): string {
  const egp = piasters / 100;
  const formattedNumber = new Intl.NumberFormat('en-EG', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(egp);

  return `${formattedNumber} ${CURRENCY_CODE}`;
}

/**
 * Convert user-entered EGP decimal number to integer piasters
 * e.g., 2400 -> 240000
 */
export function egpToPiasters(egp: number | string): number {
  const numericVal = typeof egp === 'string' ? parseFloat(egp) : egp;
  if (isNaN(numericVal)) return 0;
  return Math.round(numericVal * 100);
}

/**
 * Convert integer piasters to EGP decimal number
 * e.g., 240000 -> 2400
 */
export function piastersToEgp(piasters: number): number {
  return piasters / 100;
}

export interface FinancialCalculationResult {
  subtotalInPiasters: number;
  shippingInPiasters: number;
  discountInPiasters: number;
  taxInPiasters: number;
  totalInPiasters: number;
  isEligibleForFreeShipping: boolean;
  amountNeededForFreeShipping: number;
}

/**
 * Calculate order financials with server-side validation
 */
export function calculateOrderTotals(params: {
  subtotalInPiasters: number;
  baseShippingInPiasters: number;
  discountInPiasters?: number;
  vatRatePercentage?: number; // e.g. 14 for 14% Egypt standard VAT
  pricesIncludeTax?: boolean;
}): FinancialCalculationResult {
  const {
    subtotalInPiasters,
    baseShippingInPiasters,
    discountInPiasters = 0,
    vatRatePercentage = 14,
    pricesIncludeTax = true,
  } = params;

  // Free shipping check
  const isEligibleForFreeShipping = subtotalInPiasters >= FREE_SHIPPING_THRESHOLD_PIASTERS;
  const shippingInPiasters = isEligibleForFreeShipping ? 0 : baseShippingInPiasters;
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD_PIASTERS - subtotalInPiasters);

  // Discount calculation
  const safeDiscount = Math.min(discountInPiasters, subtotalInPiasters);
  const taxableBase = Math.max(0, subtotalInPiasters - safeDiscount);

  let taxInPiasters = 0;
  if (!pricesIncludeTax && vatRatePercentage > 0) {
    taxInPiasters = Math.round((taxableBase * vatRatePercentage) / 100);
  }

  const totalInPiasters = taxableBase + shippingInPiasters + taxInPiasters;

  return {
    subtotalInPiasters,
    shippingInPiasters,
    discountInPiasters: safeDiscount,
    taxInPiasters,
    totalInPiasters,
    isEligibleForFreeShipping,
    amountNeededForFreeShipping,
  };
}
