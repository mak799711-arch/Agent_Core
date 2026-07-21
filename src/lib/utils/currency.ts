const RATES: Record<string, number> = {
  USD: 1.0,
  IDR: 16300,
  EUR: 0.93,
  RUB: 90.0,
  CNY: 7.25,
  AUD: 1.50,
  SGD: 1.35,
  GBP: 0.79,
  JPY: 160.0
};

const SYMBOLS: Record<string, string> = {
  USD: '$',
  IDR: 'Rp ',
  EUR: '€',
  RUB: '₽',
  CNY: '¥',
  AUD: 'A$',
  SGD: 'S$',
  GBP: '£',
  JPY: '¥'
};

export function formatCurrency(amountInUSD: number, currency: string): string {
  const currencyUpper = (currency || 'USD').toUpperCase();
  const rate = RATES[currencyUpper] || 1.0;
  const symbol = SYMBOLS[currencyUpper] || `${currencyUpper} `;
  const converted = amountInUSD * rate;
  
  if (currencyUpper === 'IDR' || currencyUpper === 'JPY') {
    // Round to whole numbers for currencies like Rupiah and Yen
    return `${symbol}${Math.round(converted).toLocaleString()}`;
  }
  
  // Format with 2 decimal places for cents-based currencies
  return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatLocalCurrency(amountInLocal: number, currency: string): string {
  const currencyUpper = (currency || 'USD').toUpperCase();
  const symbol = SYMBOLS[currencyUpper] || `${currencyUpper} `;
  
  if (currencyUpper === 'IDR' || currencyUpper === 'JPY') {
    return `${symbol}${Math.round(amountInLocal).toLocaleString()}`;
  }
  
  return `${symbol}${amountInLocal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function convertToUSD(amountInLocal: number, currency: string): number {
  const currencyUpper = (currency || 'USD').toUpperCase();
  const rate = RATES[currencyUpper] || 1.0;
  return amountInLocal / rate;
}
