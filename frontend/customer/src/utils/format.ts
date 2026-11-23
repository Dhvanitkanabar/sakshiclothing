/**
 * Sakshi Clothing — Currency and Price Formatting Utility
 * Formats numeric values to Indian Rupee (INR ₹) with en-IN locale commas.
 */
export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export default formatPrice;
