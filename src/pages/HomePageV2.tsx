import React, { useState } from 'react';
import { Calculator, Zap, Plane, Beef, DollarSign, TreePine, Cloud, ShoppingCart, ExternalLink } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

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

// Based on research data: weighted average of 50% efficient + 50% heavy models
// Efficient: GPT-4o ~0.35 Wh/query at $0.03/query = 11.7 Wh/$
// Heavy: o3 ~33 Wh/query at $1-2/query = 16-33 Wh/$
// Real usage likely involves both types
const WH_PER_DOLLAR: Record<string, number> = {
  openai: 45,      // Mix of GPT-4o (cheap) and o3/GPT-4-turbo (expensive)
  anthropic: 35,   // Mix of Claude Sonnet and Opus
  google: 30,      // Mix of Gemini Flash and Pro
  other: 40        // Average estimate
};

// Grid carbon intensity: global average ~0.475 kg CO2/kWh
const CO2_PER_KWH = 0.475;

const STEAK_CO2_KG = 27;
const FLIGHT_LONDON_NY_CO2_KG = 986;
const OFFSET_COST_PER_TONNE = 15;
const CAR_CO2_PER_MILE_KG = 0.404;
const TREE_CO2_PER_YEAR_KG = 21.77;

export function HomePageV2() {
  const navigate = useNavigate();
  const [spending, setSpending] = useState<ProviderSpending>({
    openai: 0,
    anthropic: 0,
    google: 0,
    other: 0
  });

  const [results, setResults] = useState<CarbonResults | null>(null);
  const [userGuess, setUserGuess] = useState<string>('');

  const calculateCarbon = () => {
    // Calculate total energy consumption in Wh
    const totalWh = Object.entries(spending).reduce((total, [provider, amount]) => {
      return total + (amount * WH_PER_DOLLAR[provider]);
    }, 0);
    
    // Convert to kWh and then to CO2
    const totalKWh = totalWh / 1000;
    const totalCO2Kg = totalKWh * CO2_PER_KWH;
    const totalCO2Tonnes = totalCO2Kg / 1000;

    setResults({
      totalCO2Tonnes,
      steakEquivalent: Math.round(totalCO2Kg / STEAK_CO2_KG),
      flightsLondonNY: Math.round((totalCO2Kg / FLIGHT_LONDON_NY_CO2_KG) * 10) / 10,
      offsetCost: Math.round(totalCO2Tonnes * OFFSET_COST_PER_TONNE * 100) / 100,
      drivingMiles: Math.round(totalCO2Kg / CAR_CO2_PER_MILE_KG),
      treeYears: Math.round((totalCO2Kg / TREE_CO2_PER_YEAR_KG) * 10) / 10
    });
  };

  const handleInputChange = (provider: keyof ProviderSpending, value: string) => {
    // Remove commas and $ before parsing
    const cleanValue = value.replace(/[$,]/g, '');
    const numValue = parseFloat(cleanValue) || 0;
    setSpending(prev => ({ ...prev, [provider]: numValue }));
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  const formatCurrency = (num: number): string => {
    return num.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
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

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Calculator className="h-6 w-6 text-green-600" />
              Enter Your Monthly AI Spending ($)
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  onChange={(e) => setUserGuess(e.target.value.replace(/[$,]/g, ''))}
                  className="w-full pl-8 pr-4 py-3 text-lg border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center font-semibold"
                  placeholder="Take a guess..."
                />
              </div>
              <p className="text-sm text-gray-600 mt-3 text-center">
                We'll show you how your guess compares to the actual cost
              </p>
            </div>

            <button
              onClick={calculateCarbon}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mt-6"
            >
              <Zap className="h-5 w-5" />
              Calculate My AI Carbon Impact
            </button>
          </div>

          {results && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Cloud className="h-6 w-6 text-blue-600" />
                Your AI Carbon Impact
              </h2>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6 text-sm">
                <p className="text-blue-800">
                  <strong>Calculation based on:</strong> Energy consumption data from latest AI models (GPT-4o, Claude 4, Gemini 2.5) 
                  with global average grid carbon intensity of 0.475 kg CO₂/kWh
                </p>
              </div>

              {userGuess && (
                <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800 font-medium">
                    Your guess: ${userGuess} | Actual cost: ${results.offsetCost.toFixed(2)}
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    {parseFloat(userGuess) > results.offsetCost 
                      ? `You overestimated by ${((parseFloat(userGuess) / results.offsetCost - 1) * 100).toFixed(0)}%`
                      : `You underestimated by ${((results.offsetCost / parseFloat(userGuess) - 1) * 100).toFixed(0)}%`
                    }
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {results.totalCO2Tonnes.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Tonnes of CO₂</div>
                </div>

                <div className="bg-red-50 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Beef className="h-5 w-5 text-red-600" />
                    <div className="text-3xl font-bold text-gray-900">
                      {formatNumber(results.steakEquivalent)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">Steak dinners</div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Plane className="h-5 w-5 text-blue-600" />
                    <div className="text-3xl font-bold text-gray-900">
                      {results.flightsLondonNY}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">Flights London → NYC</div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div className="text-3xl font-bold text-gray-900">
                      ${results.offsetCost}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">Carbon offset cost</div>
                </div>

                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatNumber(results.drivingMiles)}
                  </div>
                  <div className="text-sm text-gray-600">Miles driven</div>
                </div>

                <div className="bg-emerald-50 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TreePine className="h-5 w-5 text-emerald-600" />
                    <div className="text-3xl font-bold text-gray-900">
                      {results.treeYears}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">Tree-years to offset</div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">What can you do?</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Consider purchasing carbon offsets for ${results.offsetCost}</li>
                  <li>• Optimize your AI usage by choosing efficient models</li>
                  <li>• Support AI providers committed to renewable energy</li>
                  <li>• Track and reduce your usage over time</li>
                </ul>
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
                        offsetCost: results.offsetCost 
                      } 
                    })}
                    className="bg-green-600 text-white py-4 px-8 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-2 text-lg"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    Offset My Carbon Impact for ${results.offsetCost}
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
                        You guessed ${parseFloat(userGuess).toFixed(2)} - why not go above and beyond?
                      </p>
                      <p className="text-sm text-gray-600 mb-6">
                        Your over-contribution will be highlighted on your certificate as a 
                        <span className="font-semibold text-yellow-700"> Climate Champion</span> who gave 
                        {' '}{((parseFloat(userGuess) / results.offsetCost) * 100).toFixed(0)}% 
                        more than required!
                      </p>
                      <button
                        onClick={() => navigate('/offset-order', { 
                          state: { 
                            offsetAmount: results.totalCO2Tonnes, 
                            offsetCost: parseFloat(userGuess),
                            heroAmount: parseFloat(userGuess),
                            standardCost: results.offsetCost
                          } 
                        })}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-4 px-8 rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all inline-flex items-center gap-2 text-lg shadow-lg transform hover:scale-105"
                      >
                        <span className="text-xl">⚡</span>
                        Offset for ${parseFloat(userGuess).toFixed(2)} (Hero Mode)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}