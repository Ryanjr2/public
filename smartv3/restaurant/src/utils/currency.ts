// Currency utilities for Tanzania Shillings
export const CURRENCY = {
  code: 'TZS',
  symbol: 'TSh',
  name: 'Tanzania Shilling'
};

/**
 * Format amount in Tanzania Shillings
 * @param amount - The amount to format
 * @param showSymbol - Whether to show the currency symbol (default: true)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, showSymbol: boolean = true): string => {
  const formatted = new Intl.NumberFormat('sw-TZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return showSymbol ? `${CURRENCY.symbol} ${formatted}` : formatted;
};

/**
 * Format currency for display in cards/widgets
 * @param amount - The amount to format
 * @returns Formatted currency with symbol
 */
export const formatDisplayCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `${CURRENCY.symbol} ${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${CURRENCY.symbol} ${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
};

/**
 * Parse currency input (removes symbols and formatting)
 * @param input - The currency string to parse
 * @returns Numeric value
 */
export const parseCurrency = (input: string): number => {
  return parseFloat(input.replace(/[^\d.-]/g, '')) || 0;
};

/**
 * Format amount for international display (if needed)
 * @param amount - Amount in TZS
 * @returns Amount in TZS (no conversion needed)
 */
export const formatInternationalCurrency = (amount: number): number => {
  // No conversion needed - we use TZS throughout the system
  return amount;
};
