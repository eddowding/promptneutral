export interface CurrencyInfo {
  code: string;
  symbol: string;
  rate: number; // Rate from EUR
  position: 'before' | 'after';
}

// Default currency info (fallback rates if API fails)
const DEFAULT_RATES: Record<string, number> = {
  USD: 1.08, EUR: 1.00, GBP: 0.85, CAD: 1.48, AUD: 1.65,
  JPY: 161, CNY: 7.85, INR: 90, BRL: 5.40, MXN: 18.50,
  CHF: 0.95, SEK: 11.30, NOK: 11.50, DKK: 7.45, SGD: 1.45,
  NZD: 1.75, ZAR: 19.80, KRW: 1420
};

// Currency symbols and positions
const CURRENCY_SYMBOLS: Record<string, { symbol: string; position: 'before' | 'after' }> = {
  USD: { symbol: '$', position: 'before' },
  EUR: { symbol: '€', position: 'before' },
  GBP: { symbol: '£', position: 'before' },
  CAD: { symbol: 'C$', position: 'before' },
  AUD: { symbol: 'A$', position: 'before' },
  JPY: { symbol: '¥', position: 'before' },
  CNY: { symbol: '¥', position: 'before' },
  INR: { symbol: '₹', position: 'before' },
  BRL: { symbol: 'R$', position: 'before' },
  MXN: { symbol: '$', position: 'before' },
  CHF: { symbol: 'CHF', position: 'before' },
  SEK: { symbol: 'kr', position: 'after' },
  NOK: { symbol: 'kr', position: 'after' },
  DKK: { symbol: 'kr', position: 'after' },
  SGD: { symbol: 'S$', position: 'before' },
  NZD: { symbol: 'NZ$', position: 'before' },
  ZAR: { symbol: 'R', position: 'before' },
  KRW: { symbol: '₩', position: 'before' },
};

// Build CURRENCIES object with cached rates
export let CURRENCIES: Record<string, CurrencyInfo> = {};

// Initialize with default rates
Object.entries(DEFAULT_RATES).forEach(([code, rate]) => {
  const symbolInfo = CURRENCY_SYMBOLS[code];
  CURRENCIES[code] = {
    code,
    symbol: symbolInfo.symbol,
    rate,
    position: symbolInfo.position
  };
});

// Cache rates for 24 hours
const RATE_CACHE_KEY = 'currency_rates_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface RateCache {
  rates: Record<string, number>;
  timestamp: number;
}

async function fetchLatestRates(): Promise<Record<string, number>> {
  try {
    // Try multiple free APIs
    const apis = [
      'https://api.exchangerate-api.com/v4/latest/EUR',
      'https://api.frankfurter.app/latest',
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json'
    ];

    for (const api of apis) {
      try {
        const response = await fetch(api);
        if (response.ok) {
          const data = await response.json();
          
          // Handle different API response formats
          let rates: Record<string, number> = {};
          
          if (data.rates) {
            rates = data.rates;
          } else if (data.eur) {
            // fawazahmed0 API format
            Object.entries(data.eur).forEach(([code, rate]) => {
              rates[code.toUpperCase()] = rate as number;
            });
          }
          
          // Only return rates we support
          const supportedRates: Record<string, number> = { EUR: 1 };
          Object.keys(DEFAULT_RATES).forEach(code => {
            if (rates[code]) {
              supportedRates[code] = rates[code];
            }
          });
          
          return supportedRates;
        }
      } catch {
        // Try next API
      }
    }
  } catch (error) {
    console.error('Failed to fetch currency rates:', error);
  }
  
  return DEFAULT_RATES;
}

export async function updateCurrencyRates(): Promise<void> {
  // Check cache first
  const cached = localStorage.getItem(RATE_CACHE_KEY);
  if (cached) {
    try {
      const cache: RateCache = JSON.parse(cached);
      if (Date.now() - cache.timestamp < CACHE_DURATION) {
        // Update CURRENCIES with cached rates
        Object.entries(cache.rates).forEach(([code, rate]) => {
          if (CURRENCIES[code]) {
            CURRENCIES[code].rate = rate;
          }
        });
        return;
      }
    } catch {
      // Invalid cache
    }
  }

  // Fetch new rates
  const rates = await fetchLatestRates();
  
  // Update CURRENCIES
  Object.entries(rates).forEach(([code, rate]) => {
    if (CURRENCIES[code]) {
      CURRENCIES[code].rate = rate;
    }
  });
  
  // Cache the rates
  const cache: RateCache = {
    rates,
    timestamp: Date.now()
  };
  localStorage.setItem(RATE_CACHE_KEY, JSON.stringify(cache));
}

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

// USD conversion functions for OpenAI Costs API
const USD_TO_EUR_RATE = 0.92; // Approximate rate, should be updated from real exchange rates

export function convertFromUSD(amountUSD: number, targetCurrency: CurrencyInfo): number {
  // Convert USD → EUR → target currency
  const amountEUR = amountUSD * USD_TO_EUR_RATE;
  return convertFromEUR(amountEUR, targetCurrency);
}

export function formatCurrencyFromUSD(amountUSD: number, currency: CurrencyInfo, options?: { decimals?: number }): string {
  const convertedAmount = convertFromUSD(amountUSD, currency);
  return formatCurrency(convertedAmount, currency, options);
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