const RATES = {
  USD: 1.0,
  IDR: 16300,
  EUR: 0.93
};

const SYMBOLS = {
  USD: '$',
  IDR: 'Rp ',
  EUR: '€'
};

export function formatCurrency(amountInUSD: number, currency: 'USD' | 'IDR' | 'EUR'): string {
  const converted = amountInUSD * RATES[currency];
  
  if (currency === 'IDR') {
    // Форматируем рупии красиво без копеек
    return `${SYMBOLS.IDR}${Math.round(converted).toLocaleString()}`;
  }
  
  return `${SYMBOLS[currency]}${converted.toFixed(2)}`;
}
