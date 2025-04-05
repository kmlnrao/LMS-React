/**
 * Format-related utility functions
 */

/**
 * Formats a number as Indian currency (₹xx,xx,xxx.xx)
 * @param amount - The amount to format
 * @returns Formatted amount as string with ₹ symbol
 */
export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Formats a number with Indian number formatting (x,xx,xxx)
 * @param number - The number to format
 * @returns Formatted number as string
 */
export function formatIndianNumber(number: number): string {
  return new Intl.NumberFormat('en-IN').format(number);
}