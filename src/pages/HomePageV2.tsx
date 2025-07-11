import React, { useState } from 'react';
import { Calculator, Zap, Plane, Beef, TreePine, Cloud, ShoppingCart, ExternalLink, Car, Building, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';

interface ProviderSpending {
  openai: number;
  anthropic: number;
  google: number;
  other: number;
}

interface CarbonResults {
  totalCO2Tonnes: number;
  steakEquivalent: number;
  flightsLondonNY: number;
  offsetCost: number;
  drivingMiles: number;
  treeYears: number;
}

// Energy estimates based on expert review (July 2025)
// Methodology: Weighted mix of efficient and heavy models per provider
// Assumptions: 
// - GPT-4o: 0.3 Wh/query at ~$0.01/query = 30 Wh/$
// - o3/heavy: 39 Wh/query at ~$0.50/query = 78 Wh/$
// - Typical usage: 80% efficient, 20% heavy models
const WH_PER_DOLLAR: Record<string, number> = {
  openai: 38,      // (0.8 × 30) + (0.2 × 78) = 39.6 Wh/$
  anthropic: 32,   // Similar mix for Claude models
  google: 28,      // Flash-heavy usage pattern
  other: 35        // Conservative average
};

// Grid carbon intensity: global average 2024
// Source: IEA electricity carbon intensity data
const CO2_PER_KWH = 0.475;

const STEAK_CO2_KG = 27;
const FLIGHT_LONDON_NY_CO2_KG = 986;
const OFFSET_COST_PER_TONNE = 15;
const CAR_CO2_PER_MILE_KG = 0.404;
const TREE_CO2_PER_YEAR_KG = 21.77;

export function HomePageV2() {
  const navigate = useNavigate();
  const { currency, formatCurrency, formatCurrencyFromEUR, convertFromEUR, convertToEUR, loading: currencyLoading } = useCurrency();
  
  const [spending, setSpending] = useState<ProviderSpending>({
    openai: 0,
    anthropic: 0,
    google: 0,
    other: 0
  });

  const [results, setResults] = useState<CarbonResults | null>(null);
  const [userGuess, setUserGuess] = useState<string>('');
  const [heroAmount, setHeroAmount] = useState<string>('');
  const [showWhy430x, setShowWhy430x] = useState(false);

  const calculateCarbon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Calculate total energy consumption in Wh
    const totalWh = Object.entries(spending).reduce((total, [provider, amount]) => {
      return total + (amount * WH_PER_DOLLAR[provider]);
    }, 0);
    
    // Convert to kWh and then to CO2
    const totalKWh = totalWh / 1000;
    const totalCO2Kg = totalKWh * CO2_PER_KWH;
    const totalCO2Tonnes = totalCO2Kg / 1000;

    setResults({
      totalCO2Tonnes: Math.round(totalCO2Tonnes * 1000) / 1000, // Round to 3 decimal places
      steakEquivalent: Math.round(totalCO2Kg / STEAK_CO2_KG),
      flightsLondonNY: Math.round((totalCO2Kg / FLIGHT_LONDON_NY_CO2_KG) * 10) / 10,
      offsetCost: Math.round(totalCO2Tonnes * OFFSET_COST_PER_TONNE * 100) / 100,
      drivingMiles: Math.round(totalCO2Kg / CAR_CO2_PER_MILE_KG),
      treeYears: Math.round((totalCO2Kg / TREE_CO2_PER_YEAR_KG) * 10) / 10
    });
    
    // Reset hero amount when calculating new results
    setHeroAmount('');
  };

  const handleInputChange = (provider: keyof ProviderSpending, value: string) => {
    // Remove commas and $ before parsing
    const cleanValue = value.replace(/[$,]/g, '');
    const numValue = parseFloat(cleanValue) || 0;
    setSpending(prev => ({ ...prev, [provider]: numValue }));
  };

  const handleNumberInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, decimal point
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', '.', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    
    // Allow: Ctrl/Cmd+A, Ctrl/Cmd+C, Ctrl/Cmd+V, Ctrl/Cmd+X
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
      return;
    }
    
    // Prevent if not a number or allowed key
    if (!allowedKeys.includes(e.key) && isNaN(Number(e.key))) {
      e.preventDefault();
    }
  };

  const handleIntegerInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter (no decimal point)
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    
    // Allow: Ctrl/Cmd+A, Ctrl/Cmd+C, Ctrl/Cmd+V, Ctrl/Cmd+X
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
      return;
    }
    
    // Prevent if not a number or allowed key
    if (!allowedKeys.includes(e.key) && isNaN(Number(e.key))) {
      e.preventDefault();
    }
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              What's Your AI Carbon Score?
            </h1>
            <p className="text-xl text-gray-600">
              Calculate the environmental impact of your AI usage
            </p>
          </div>

          <form onSubmit={calculateCarbon} className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Calculator className="h-6 w-6 text-green-600" />
              Enter Your Monthly AI Spending ($)
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <img 
                    src="https://www.google.com/s2/favicons?domain=openai.com&sz=32" 
                    alt="OpenAI" 
                    className="w-4 h-4"
                  />
                  OpenAI (GPT-4, DALL-E, etc.)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="text"
                    value={spending.openai ? formatNumber(spending.openai) : ''}
                    onChange={(e) => handleInputChange('openai', e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <img 
                    src="https://www.google.com/s2/favicons?domain=anthropic.com&sz=32" 
                    alt="Anthropic" 
                    className="w-4 h-4"
                  />
                  Anthropic (Claude)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="text"
                    value={spending.anthropic ? formatNumber(spending.anthropic) : ''}
                    onChange={(e) => handleInputChange('anthropic', e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <img 
                    src="https://www.google.com/s2/favicons?domain=google.com&sz=32" 
                    alt="Google" 
                    className="w-4 h-4"
                  />
                  Google (Gemini, Bard)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="text"
                    value={spending.google ? formatNumber(spending.google) : ''}
                    onChange={(e) => handleInputChange('google', e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 rounded flex items-center justify-center text-xs font-bold text-gray-600">
                    AI
                  </div>
                  Other AI Services
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="text"
                    value={spending.other ? formatNumber(spending.other) : ''}
                    onChange={(e) => handleInputChange('other', e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
              <div className="text-center mb-4">
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                  🤔 Before we calculate...
                </label>
                <p className="text-gray-700">
                  What do you think it would cost to offset your AI carbon footprint?
                </p>
              </div>
              <div className="relative max-w-xs mx-auto">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-semibold">$</span>
                <input
                  type="text"
                  value={userGuess}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[$,]/g, '');
                    // Only allow integers
                    if (value === '' || /^\d+$/.test(value)) {
                      setUserGuess(value);
                    }
                  }}
                  onKeyDown={handleIntegerInput}
                  className="w-full pl-8 pr-4 py-3 text-lg border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center font-semibold"
                  placeholder="Take a guess..."
                  inputMode="numeric"
                />
              </div>
              <p className="text-sm text-gray-600 mt-3 text-center">
                We'll show you how your guess compares to the actual cost
              </p>
            </div>

            <button
              type="submit"
              disabled={!userGuess}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Zap className="h-5 w-5" />
              Calculate My AI Carbon Impact
            </button>
          </form>

          {results && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Cloud className="h-6 w-6 text-blue-600" />
                Your AI Carbon Impact
              </h2>

              {userGuess && (
                <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800 font-medium">
                    Your guess: ${parseFloat(userGuess).toLocaleString()} | Actual 1x cost: {formatCurrencyFromEUR(results.offsetCost)}
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    {parseFloat(userGuess) > results.offsetCost 
                      ? `You thought it would cost ${(parseFloat(userGuess) / convertFromEUR(results.offsetCost)).toFixed(0)}x more!`
                      : `The actual cost is ${(convertFromEUR(results.offsetCost) / parseFloat(userGuess)).toFixed(1)}x your guess`
                    }
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-green-50 rounded-lg p-8 text-center">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {formatCurrencyFromEUR(results.offsetCost)}
                  </div>
                  <div className="text-lg text-gray-600">Carbon offset cost</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Cloud className="h-8 w-8 text-gray-600" />
                    <div className="text-5xl font-bold text-gray-900">
                      {results.totalCO2Tonnes.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-lg text-gray-600">Tonnes of CO₂</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Beef className="h-4 w-4 text-red-600" />
                    <div className="text-2xl font-bold text-gray-900">
                      {formatNumber(results.steakEquivalent)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">Steak dinners</div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Car className="h-4 w-4 text-orange-600" />
                    <div className="text-2xl font-bold text-gray-900">
                      {formatNumber(results.drivingMiles)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">Miles driven</div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Plane className="h-4 w-4 text-blue-600" />
                    <div className="text-2xl font-bold text-gray-900">
                      {results.flightsLondonNY}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">Flights LDN→NYC</div>
                </div>

                <div className="bg-emerald-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TreePine className="h-4 w-4 text-emerald-600" />
                    <div className="text-2xl font-bold text-gray-900">
                      {results.treeYears.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">Tree-years</div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Building className="h-4 w-4 text-purple-600" />
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(results.totalCO2Tonnes * 1000 / 2.3).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">Days of home energy</div>
                </div>
              </div>


              <div className="mt-6">
                <a
                  href="/research"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  Show assumptions and methodology
                </a>
              </div>

              <div className="mt-8">
                <div className="text-center">
                  <button
                    onClick={() => navigate('/offset-order', { 
                      state: { 
                        offsetAmount: results.totalCO2Tonnes, 
                        offsetCost: results.offsetCost,
                        userCurrency: currency.code,
                        aiProviders: spending
                      } 
                    })}
                    className="bg-green-600 text-white py-4 px-8 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-2 text-lg"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    Offset My Carbon Impact for {formatCurrencyFromEUR(results.offsetCost)}
                  </button>
                  <p className="mt-3 text-sm text-gray-600">
                    Choose from verified carbon offset projects and make a difference today
                  </p>
                </div>

                {userGuess && parseFloat(userGuess) > results.offsetCost && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-300">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                        <span className="text-2xl">🦸</span>
                        Make the Hero Move!
                      </h3>
                      <p className="text-gray-700 mb-4">
                        You guessed ${parseFloat(userGuess).toFixed(2)} - great news, even at 430x it's still less!
                      </p>
                      <p className="text-sm text-gray-600 mb-6">
                        {parseFloat(userGuess) > convertFromEUR(results.offsetCost * 430) 
                          ? `Even our maximum 430x offset (${formatCurrencyFromEUR(results.offsetCost * 430)}) is less than your guess!`
                          : 'Choose your impact level or enter a custom amount:'
                        }
                      </p>
                      
                      <div className="grid grid-cols-3 gap-3 mb-4 max-w-md mx-auto">
                        <button
                          onClick={() => {
                            const roundedCost = Math.round(results.offsetCost * 100) / 100;
                            const localAmount = convertFromEUR(roundedCost * 4.3);
                            setHeroAmount(localAmount.toFixed(2));
                          }}
                          className="bg-white border-2 border-yellow-300 rounded-lg p-3 hover:bg-yellow-50 transition-colors"
                        >
                          <div className="text-2xl font-bold text-yellow-700">4.3x</div>
                          <div className="text-xs text-gray-600">{formatCurrencyFromEUR(Math.round(results.offsetCost * 100) / 100 * 4.3)}</div>
                          {(() => {
                            const totalAISpending = Object.values(spending).reduce((sum, amount) => sum + amount, 0);
                            if (totalAISpending > 0) {
                              const offsetAmount = convertFromEUR(Math.round(results.offsetCost * 100) / 100 * 4.3);
                              const percentage = (offsetAmount / totalAISpending * 100).toFixed(1);
                              return <div className="text-xs text-gray-500 mt-1">{percentage}% of AI spend</div>;
                            }
                            return null;
                          })()}
                        </button>
                        <button
                          onClick={() => {
                            const roundedCost = Math.round(results.offsetCost * 100) / 100;
                            const localAmount = convertFromEUR(roundedCost * 43);
                            setHeroAmount(localAmount.toFixed(2));
                          }}
                          className="bg-white border-2 border-yellow-300 rounded-lg p-3 hover:bg-yellow-50 transition-colors"
                        >
                          <div className="text-2xl font-bold text-yellow-700">43x</div>
                          <div className="text-xs text-gray-600">{formatCurrencyFromEUR(Math.round(results.offsetCost * 100) / 100 * 43)}</div>
                          {(() => {
                            const totalAISpending = Object.values(spending).reduce((sum, amount) => sum + amount, 0);
                            if (totalAISpending > 0) {
                              const offsetAmount = convertFromEUR(Math.round(results.offsetCost * 100) / 100 * 43);
                              const percentage = (offsetAmount / totalAISpending * 100).toFixed(1);
                              return <div className="text-xs text-gray-500 mt-1">{percentage}% of AI spend</div>;
                            }
                            return null;
                          })()}
                        </button>
                        <button
                          onClick={() => {
                            const roundedCost = Math.round(results.offsetCost * 100) / 100;
                            const localAmount = convertFromEUR(roundedCost * 430);
                            setHeroAmount(localAmount.toFixed(2));
                          }}
                          className="bg-white border-2 border-yellow-300 rounded-lg p-3 hover:bg-yellow-50 transition-colors relative"
                        >
                          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            430ppm CO₂
                          </div>
                          <div className="text-2xl font-bold text-yellow-700">430x</div>
                          <div className="text-xs text-gray-600">{formatCurrencyFromEUR(Math.round(results.offsetCost * 100) / 100 * 430)}</div>
                          {(() => {
                            const totalAISpending = Object.values(spending).reduce((sum, amount) => sum + amount, 0);
                            if (totalAISpending > 0) {
                              const offsetAmount = convertFromEUR(Math.round(results.offsetCost * 100) / 100 * 430);
                              const percentage = (offsetAmount / totalAISpending * 100).toFixed(1);
                              return <div className="text-xs text-gray-500 mt-1">{percentage}% of AI spend</div>;
                            }
                            return null;
                          })()}
                        </button>
                      </div>
                      
                      <div className="flex flex-col items-center mb-6">
                        <div className="flex items-center justify-center gap-3 mb-3">
                          <span className="text-lg font-semibold">Or offset for</span>
                          <div className="relative bg-white border-2 border-yellow-300 rounded-lg p-3">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-xl">{currency.symbol}</span>
                            <input
                              type="text"
                              value={heroAmount !== '' ? heroAmount : userGuess}
                              onChange={(e) => setHeroAmount(e.target.value.replace(/[$,]/g, ''))}
                              onKeyDown={handleNumberInput}
                              className="w-36 pl-8 pr-4 text-2xl font-bold text-center bg-transparent focus:outline-none"
                              inputMode="decimal"
                            />
                          </div>
                        </div>
                        {(heroAmount !== '' ? heroAmount : userGuess) && parseFloat(heroAmount !== '' ? heroAmount : userGuess) > 0 && (() => {
                          const amount = parseFloat(heroAmount !== '' ? heroAmount : userGuess);
                          const amountEUR = convertToEUR(amount);
                          const multiplier = (amountEUR / results.offsetCost).toFixed(1);
                          const totalAISpending = Object.values(spending).reduce((sum, amount) => sum + amount, 0);
                          const percentage = totalAISpending > 0 ? (amount / totalAISpending * 100).toFixed(1) : null;
                          
                          return (
                            <div className="text-center mt-2">
                              <div className="text-3xl font-bold text-yellow-700">{multiplier}x</div>
                              {percentage && (
                                <div className="text-sm text-gray-600 mt-1">{percentage}% of AI spend</div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      
                      <button
                        onClick={() => navigate('/offset-order', { 
                          state: { 
                            offsetAmount: results.totalCO2Tonnes, 
                            offsetCost: convertToEUR(parseFloat(heroAmount !== '' ? heroAmount : userGuess)),
                            heroAmount: convertToEUR(parseFloat(heroAmount !== '' ? heroAmount : userGuess)),
                            standardCost: results.offsetCost,
                            userCurrency: currency.code,
                            aiProviders: spending
                          } 
                        })}
                        disabled={!heroAmount && !userGuess}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-4 px-8 rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all inline-flex items-center gap-2 text-lg shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-xl">🌍</span>
                        Offset My Carbon Impact
                      </button>
                    </div>
                  </div>
                )}

                {/* Why 430x? Explainer */}
                <div className="mt-8 bg-blue-50 rounded-lg p-6">
                  <button
                    onClick={() => setShowWhy430x(!showWhy430x)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-600" />
                      Why 430x?
                    </h3>
                    {showWhy430x ? (
                      <ChevronUp className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                  
                  {showWhy430x && (
                    <div className="mt-4 space-y-4 text-gray-700">
                      <div>
                        <h4 className="font-semibold mb-2">🌍 We're at 430ppm CO₂</h4>
                        <p className="text-sm">
                          Earth's atmosphere hit 430ppm CO₂ - a fun coincidence that became our rallying cry! 
                          We're at an inflection point with both AI and climate. While AI saves you massive costs, 
                          let's reinvest 10-100x our footprint into regenerative environmental projects.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">💡 Less than you think, more than enough</h4>
                        <p className="text-sm">
                          Most people overestimate offset costs by 500x-10,000x. Even at 430x offset, 
                          it's typically just ~10% of your AI spend - far less than most initial guesses, 
                          yet enough to make a massive climate impact.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">🚀 Beyond neutral to climate positive</h4>
                        <p className="text-sm">
                          1x offset = carbon neutral. 430x = actively removing historic emissions. 
                          Join the movement of companies going beyond neutrality to reverse climate change.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}