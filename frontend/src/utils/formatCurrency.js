import { DEFAULT_CURRENCY } from './constants';

/**
 * Formats a numeric value into a localized currency string based on the user's settings.
 * @param {number} amount - The numeric amount to format.
 * @param {string} currencyCode - The ISO-3166 currency code (e.g., 'INR', 'USD', 'EUR'). Defaults to 'INR'.
 * @param {boolean} includeCents - Whether to display decimal cents. Defaults to false.
 */
const formatCurrency = (amount, currencyCode = DEFAULT_CURRENCY, includeCents = false) => {
  const code = currencyCode ? currencyCode.toUpperCase() : DEFAULT_CURRENCY;
  
  // Custom format options
  const options = {
    style: 'currency',
    currency: code,
    minimumFractionDigits: includeCents ? 2 : 0,
    maximumFractionDigits: includeCents ? 2 : 0,
  };

  // Determine standard locale string
  let locale = 'en-IN';
  if (code === 'USD') locale = 'en-US';
  else if (code === 'EUR') locale = 'en-EU';
  else if (code === 'GBP') locale = 'en-GB';

  try {
    return new Intl.NumberFormat(locale, options).format(amount);
  } catch (error) {
    // Graceful fallback format in case of locale conflicts
    const symbol = code === 'INR' ? '₹' : code === 'USD' ? '$' : code === 'EUR' ? '€' : `${code} `;
    return `${symbol}${Number(amount).toFixed(includeCents ? 2 : 0)}`;
  }
};

export default formatCurrency;
