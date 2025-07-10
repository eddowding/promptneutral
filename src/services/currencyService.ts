export interface CurrencyInfo {
  code: string;
  symbol: string;
  rate: number; // Rate from EUR
  position: 'before' | 'after';
}

// Currency conversion rates from EUR (approximate)
export const CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', rate: 1.08, position: 'before' },
  EUR: { code: 'EUR', symbol: '€', rate: 1.00, position: 'before' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.85, position: 'before' },
  CAD: { code: 'CAD', symbol: 'C$', rate: 1.48, position: 'before' },
  AUD: { code: 'AUD', symbol: 'A$', rate: 1.65, position: 'before' },
  JPY: { code: 'JPY', symbol: '¥', rate: 161, position: 'before' },
  CNY: { code: 'CNY', symbol: '¥', rate: 7.85, position: 'before' },
  INR: { code: 'INR', symbol: '₹', rate: 90, position: 'before' },
  BRL: { code: 'BRL', symbol: 'R$', rate: 5.40, position: 'before' },
  MXN: { code: 'MXN', symbol: '$', rate: 18.50, position: 'before' },
  CHF: { code: 'CHF', symbol: 'CHF', rate: 0.95, position: 'before' },
  SEK: { code: 'SEK', symbol: 'kr', rate: 11.30, position: 'after' },
  NOK: { code: 'NOK', symbol: 'kr', rate: 11.50, position: 'after' },
  DKK: { code: 'DKK', symbol: 'kr', rate: 7.45, position: 'after' },
  SGD: { code: 'SGD', symbol: 'S$', rate: 1.45, position: 'before' },
  NZD: { code: 'NZD', symbol: 'NZ$', rate: 1.75, position: 'before' },
  ZAR: { code: 'ZAR', symbol: 'R', rate: 19.80, position: 'before' },
  KRW: { code: 'KRW', symbol: '₩', rate: 1420, position: 'before' },
  // Default to EUR for unsupported countries
};

// Country to currency mapping
const COUNTRY_CURRENCY: Record<string, string> = {
  US: 'USD', CA: 'CAD', MX: 'MXN', // North America
  GB: 'GBP', IE: 'EUR', FR: 'EUR', DE: 'EUR', IT: 'EUR', ES: 'EUR', PT: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR', // Europe
  CH: 'CHF', NO: 'NOK', SE: 'SEK', DK: 'DKK', FI: 'EUR', // More Europe
  JP: 'JPY', CN: 'CNY', IN: 'INR', KR: 'KRW', SG: 'SGD', // Asia
  AU: 'AUD', NZ: 'NZD', // Oceania
  BR: 'BRL', AR: 'USD', CL: 'USD', CO: 'USD', // South America (many use USD informally)
  ZA: 'ZAR', NG: 'USD', EG: 'USD', // Africa
};

export async function detectUserCountry(): Promise<string> {
  try {
    // Try multiple IP geolocation services for reliability
    const services = [
      'https://ipapi.co/json/',
      'https://api.ipdata.co?api-key=test', // Free tier
      'https://ipinfo.io/json',
    ];

    for (const service of services) {
      try {
        const response = await fetch(service);
        if (response.ok) {
          const data = await response.json();
          const country = data.country_code || data.country;
          if (country) return country.toUpperCase();
        }
      } catch {
        // Try next service
      }
    }
  } catch (error) {
    console.error('Failed to detect country:', error);
  }
  
  // Default to US if detection fails
  return 'US';
}

export function getCurrencyForCountry(countryCode: string): CurrencyInfo {
  const currencyCode = COUNTRY_CURRENCY[countryCode] || 'EUR';
  return CURRENCIES[currencyCode] || CURRENCIES.EUR;
}

export function convertFromEUR(amountEUR: number, currency: CurrencyInfo): number {
  return amountEUR * currency.rate;
}

export function convertToEUR(amount: number, currency: CurrencyInfo): number {
  return amount / currency.rate;
}

export function formatCurrency(amount: number, currency: CurrencyInfo, options?: { decimals?: number }): string {
  const decimals = options?.decimals ?? 2;
  const rounded = amount.toFixed(decimals);
  
  if (currency.position === 'before') {
    return `${currency.symbol}${rounded}`;
  } else {
    return `${rounded} ${currency.symbol}`;
  }
}

// Get stored currency preference or detect new
export async function getUserCurrency(): Promise<CurrencyInfo> {
  // Check localStorage first
  const stored = localStorage.getItem('userCurrency');
  if (stored) {
    try {
      const currencyCode = JSON.parse(stored);
      return CURRENCIES[currencyCode] || CURRENCIES.EUR;
    } catch {
      // Invalid stored value
    }
  }

  // Detect from IP
  const country = await detectUserCountry();
  const currency = getCurrencyForCountry(country);
  
  // Store for future use
  localStorage.setItem('userCurrency', JSON.stringify(currency.code));
  
  return currency;
}

export function setUserCurrency(currencyCode: string): void {
  localStorage.setItem('userCurrency', JSON.stringify(currencyCode));
}