import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  CurrencyInfo, 
  getUserCurrency, 
  setUserCurrency as storeCurrency,
  CURRENCIES,
  convertFromEUR,
  convertToEUR,
  formatCurrency as formatCurrencyUtil,
  updateCurrencyRates
} from '../services/currencyService';

interface CurrencyContextValue {
  currency: CurrencyInfo;
  setCurrency: (code: string) => void;
  convertFromEUR: (amountEUR: number) => number;
  convertToEUR: (amount: number) => number;
  formatCurrency: (amount: number, options?: { decimals?: number }) => string;
  formatCurrencyFromEUR: (amountEUR: number, options?: { decimals?: number }) => string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyInfo>(CURRENCIES.USD);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Update currency rates first, then get user currency
    updateCurrencyRates().then(() => {
      return getUserCurrency();
    }).then(detectedCurrency => {
      setCurrencyState(detectedCurrency);
      setLoading(false);
    });
  }, []);

  const setCurrency = (code: string) => {
    const newCurrency = CURRENCIES[code];
    if (newCurrency) {
      setCurrencyState(newCurrency);
      storeCurrency(code);
    }
  };

  const contextValue: CurrencyContextValue = {
    currency,
    setCurrency,
    convertFromEUR: (amountEUR: number) => convertFromEUR(amountEUR, currency),
    convertToEUR: (amount: number) => convertToEUR(amount, currency),
    formatCurrency: (amount: number, options) => formatCurrencyUtil(amount, currency, options),
    formatCurrencyFromEUR: (amountEUR: number, options) => 
      formatCurrencyUtil(convertFromEUR(amountEUR, currency), currency, options),
    loading
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}