import React from 'react';
import { Globe } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { CURRENCIES } from '../services/currencyService';

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  
  const popularCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
  
  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
        <Globe className="h-4 w-4" />
        <span className="font-medium">{currency.code}</span>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-2">
          <p className="text-xs text-gray-500 px-2 py-1">Popular currencies</p>
          {popularCurrencies.map(code => (
            <button
              key={code}
              onClick={() => setCurrency(code)}
              className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 flex items-center justify-between ${
                currency.code === code ? 'bg-gray-100 font-medium' : ''
              }`}
            >
              <span>{code}</span>
              <span className="text-gray-500">{CURRENCIES[code].symbol}</span>
            </button>
          ))}
          <div className="border-t border-gray-200 mt-2 pt-2">
            <p className="text-xs text-gray-500 px-2 py-1">All currencies</p>
            <div className="max-h-48 overflow-y-auto">
              {Object.entries(CURRENCIES)
                .filter(([code]) => !popularCurrencies.includes(code))
                .map(([code, info]) => (
                  <button
                    key={code}
                    onClick={() => setCurrency(code)}
                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 flex items-center justify-between ${
                      currency.code === code ? 'bg-gray-100 font-medium' : ''
                    }`}
                  >
                    <span>{code}</span>
                    <span className="text-gray-500">{info.symbol}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}