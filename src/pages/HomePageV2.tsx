import React, { useState } from 'react';
import { Calculator, Zap, Plane, Beef, DollarSign, TreePine, Cloud, ChevronDown, ChevronUp, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const CO2_PER_DOLLAR: Record<string, number> = {
  openai: 0.00042,
  anthropic: 0.00038,
  google: 0.00035,
  other: 0.0004
};

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
  const [showAssumptions, setShowAssumptions] = useState(false);

  const calculateCarbon = () => {
    const totalCO2Tonnes = Object.entries(spending).reduce((total, [provider, amount]) => {
      return total + (amount * CO2_PER_DOLLAR[provider]);
    }, 0);

    const totalCO2Kg = totalCO2Tonnes * 1000;

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
    const numValue = parseFloat(value) || 0;
    setSpending(prev => ({ ...prev, [provider]: numValue }));
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
                <input
                  type="number"
                  value={spending.openai || ''}
                  onChange={(e) => handleInputChange('openai', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anthropic (Claude)
                </label>
                <input
                  type="number"
                  value={spending.anthropic || ''}
                  onChange={(e) => handleInputChange('anthropic', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google (Gemini, Bard)
                </label>
                <input
                  type="number"
                  value={spending.google || ''}
                  onChange={(e) => handleInputChange('google', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other AI Services
                </label>
                <input
                  type="number"
                  value={spending.other || ''}
                  onChange={(e) => handleInputChange('other', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            <button
              onClick={calculateCarbon}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
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
                      {results.steakEquivalent}
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
                    {results.drivingMiles.toLocaleString()}
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
                <button
                  onClick={() => setShowAssumptions(!showAssumptions)}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                  {showAssumptions ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  Show assumptions
                </button>
                
                {showAssumptions && (
                  <div className="mt-4 p-6 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-3">Calculation Assumptions:</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div>
                        <strong>CO₂ emissions per dollar spent:</strong>
                        <ul className="ml-4 mt-1">
                          <li>• OpenAI: 0.42 kg CO₂/$</li>
                          <li>• Anthropic: 0.38 kg CO₂/$</li>
                          <li>• Google: 0.35 kg CO₂/$</li>
                          <li>• Other providers: 0.40 kg CO₂/$</li>
                        </ul>
                      </div>
                      <div className="mt-3">
                        <strong>Equivalency factors:</strong>
                        <ul className="ml-4 mt-1">
                          <li>• 1 steak dinner = 27 kg CO₂</li>
                          <li>• 1 flight London → NYC = 986 kg CO₂</li>
                          <li>• 1 mile driven = 0.404 kg CO₂</li>
                          <li>• 1 tree absorbs 21.77 kg CO₂/year</li>
                          <li>• Carbon offset cost = $15/tonne CO₂</li>
                        </ul>
                      </div>
                      <p className="mt-3 text-xs italic">
                        Note: These are estimates based on industry averages. Actual emissions may vary based on data center efficiency, renewable energy usage, and model complexity.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 text-center">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}