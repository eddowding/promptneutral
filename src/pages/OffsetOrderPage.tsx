import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TreePine, Wind, Waves, Sun, ShoppingCart, ArrowLeft, Check, Zap, Factory, Leaf, Globe } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  pricePerTonne: number;
  icon: React.ReactNode;
  type: string;
  category: 'nature-based' | 'engineered';
  tags: string[];
}

const projects: Project[] = [
  // Nature-based solutions
  {
    id: 'indus-delta',
    name: 'Indus Delta Blue Carbon',
    description: 'Afforestation, Reforestation Revegetation (ARR)',
    location: 'Pakistan',
    pricePerTonne: 40,
    icon: <TreePine className="h-6 w-6 text-green-600" />,
    type: 'Afforestation',
    category: 'nature-based',
    tags: ['High Co-benefits', 'Long Permanence', 'Biodiversity']
  },
  // Renewable Energy
  {
    id: 'genneia-wind',
    name: 'Genneia Wind Projects in Argentina',
    description: 'Wind Onshore renewable energy generation',
    location: 'Argentina',
    pricePerTonne: 14,
    icon: <Wind className="h-6 w-6 text-blue-600" />,
    type: 'Wind Energy',
    category: 'engineered',
    tags: ['Renewable Energy', 'Grid Stability']
  },
  {
    id: 'genneia-solar',
    name: 'Genneia Solar',
    description: 'Grid Connected Solar power generation',
    location: 'Argentina',
    pricePerTonne: 9.60,
    icon: <Sun className="h-6 w-6 text-yellow-600" />,
    type: 'Solar Energy',
    category: 'engineered',
    tags: ['Renewable Energy', 'Clean Grid']
  },
  // Agriculture & Waste
  {
    id: 'mooh-cooperative',
    name: 'Mooh Cooperative Group',
    description: 'Feed Additives in cattle to reduce methane emissions',
    location: 'Switzerland',
    pricePerTonne: 130,
    icon: <Leaf className="h-6 w-6 text-green-500" />,
    type: 'Agriculture',
    category: 'nature-based',
    tags: ['High Impact', 'Innovation', 'Sustainable Farming']
  },
  {
    id: 'rural-farms',
    name: 'Rural Farms, Renewable Energy',
    description: 'Manure management improvement',
    location: 'India',
    pricePerTonne: 8,
    icon: <Factory className="h-6 w-6 text-amber-600" />,
    type: 'Waste Management',
    category: 'engineered',
    tags: ['Rural Development', 'Waste Reduction']
  },
  {
    id: 'monterrey-waste',
    name: 'Monterrey Waste to Energy',
    description: 'Landfill gas (LFG) capture and energy generation',
    location: 'Mexico',
    pricePerTonne: 5,
    icon: <Factory className="h-6 w-6 text-amber-600" />,
    type: 'Waste to Energy',
    category: 'engineered',
    tags: ['Waste Reduction', 'Energy Recovery']
  },
  // DAC
  {
    id: 'climeworks-dac',
    name: 'Climeworks Direct Air Capture',
    description: 'Permanent CO₂ removal through direct air capture and geological storage',
    location: 'Iceland',
    pricePerTonne: 950,
    icon: <Zap className="h-6 w-6 text-purple-600" />,
    type: 'Direct Air Capture',
    category: 'engineered',
    tags: ['Permanent Removal', 'Cutting Edge', 'Verified Storage']
  }
];

export function OffsetOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currency, formatCurrencyFromEUR, convertToEUR } = useCurrency();
  const [selectedProject, setSelectedProject] = useState<string>('');
  
  const suggestedOffset = location.state?.offsetAmount || 0.1;
  const suggestedCost = location.state?.offsetCost || 15;
  const heroAmount = location.state?.heroAmount;
  const standardCost = location.state?.standardCost;
  const [quantity, setQuantity] = useState(suggestedOffset);
  const [activeCategory, setActiveCategory] = useState<'all' | 'nature-based' | 'engineered'>('all');

  const selectedProjectData = projects.find(p => p.id === selectedProject);
  const offsetCost = selectedProjectData ? quantity * selectedProjectData.pricePerTonne : 0;
  const processingFee = 0.30;
  const totalCost = selectedProjectData ? (offsetCost + processingFee).toFixed(2) : '0.00';

  const filteredProjects = projects.filter(project => 
    activeCategory === 'all' || project.category === activeCategory
  );

  // Recalculate quantity when project is selected in hero mode
  useEffect(() => {
    if (selectedProjectData && heroAmount) {
      // Convert hero amount from local currency to EUR
      const heroAmountEUR = convertToEUR(heroAmount);
      const processingFee = 0.30;
      const amountForOffset = Math.max(0.01, heroAmountEUR - processingFee);
      const heroQuantity = amountForOffset / selectedProjectData.pricePerTonne;
      setQuantity(Math.floor(heroQuantity * 1000) / 1000); // Floor to 3 decimal places to ensure we don't exceed
    }
  }, [selectedProject, heroAmount, selectedProjectData, convertToEUR]);

  const handlePurchase = () => {
    if (!selectedProject || !selectedProjectData) {
      alert('Please select a carbon offset project');
      return;
    }
    
    navigate('/checkout', {
      state: {
        projectId: selectedProject,
        projectName: selectedProjectData.name,
        quantity,
        pricePerTonne: selectedProjectData.pricePerTonne,
        totalCost,
        offsetAmount: suggestedOffset,
        heroAmount: heroAmount,
        standardCost: standardCost
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to calculator
          </button>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Carbon Offset Project
            </h1>
            <p className="text-xl text-gray-600">
              Support verified projects that make a real environmental impact
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            {heroAmount && (
              <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-300">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <span className="text-xl">🌍</span>
                  430x Mode Activated!
                </h3>
                <p className="text-gray-700">
                  You're contributing <span className="font-bold">{currency.symbol}{heroAmount.toFixed(2)}</span> instead 
                  of the calculated {currency.symbol}{standardCost.toFixed(2)} - that's{' '}
                  <span className="font-bold text-yellow-700">
                    {((heroAmount / standardCost) * 100).toFixed(0)}% of needed offset
                  </span>!
                  {((heroAmount / standardCost) * 100) >= 430 
                    ? <span> You've reached the <span className="font-semibold">430x target</span> - true climate leadership!</span>
                    : <span> Get to 430% to match atmospheric CO₂ levels!</span>}
                </p>
              </div>
            )}
            
            {selectedProject && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tonnes of CO₂ to offset
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {selectedProjectData && (
                  <div className="text-sm text-gray-600 mt-2 space-y-1">
                    <p>{quantity.toFixed(3)} tonnes × €{selectedProjectData.pricePerTonne} = €{offsetCost.toFixed(2)}</p>
                    <p>Processing fee: €{processingFee.toFixed(2)}</p>
                    <p className="font-medium">Total: €{totalCost} ({formatCurrencyFromEUR(parseFloat(totalCost))})</p>
                    {heroAmount && parseFloat(totalCost) > convertToEUR(heroAmount) && (
                      <span className="text-yellow-600 font-medium">
                        (Exceeds your {currency.symbol}{heroAmount.toFixed(2)} commitment)
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Filter by Project Type</h3>
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    activeCategory === 'all'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All Projects
                </button>
                <button
                  onClick={() => setActiveCategory('nature-based')}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    activeCategory === 'nature-based'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Leaf className="inline h-4 w-4 mr-1" />
                  Nature-Based
                </button>
                <button
                  onClick={() => setActiveCategory('engineered')}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    activeCategory === 'engineered'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Zap className="inline h-4 w-4 mr-1" />
                  Engineered
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-4">Select a Project</h3>
            <div className="grid gap-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project.id)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedProject === project.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 pt-1">
                      {project.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold flex items-center gap-2">
                            {project.name}
                            {selectedProject === project.id && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 mt-0.5">{project.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Globe className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-700">{project.location}</span>
                            <span className="text-xs text-gray-500">• {project.type}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {project.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  tag.includes('Permanent') ? 'bg-purple-100 text-purple-700' :
                                  tag.includes('High') ? 'bg-orange-100 text-orange-700' :
                                  tag.includes('Community') || tag.includes('Biodiversity') ? 'bg-green-100 text-green-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <p className="text-xl font-bold text-gray-900">
                            €{project.pricePerTonne}
                          </p>
                          <p className="text-xs text-gray-600">per tonne</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold mb-2">Why these projects?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• All projects are independently verified and certified</li>
              <li>• Direct impact on carbon reduction or capture</li>
              <li>• Support for local communities and biodiversity</li>
              <li>• Regular monitoring and transparent reporting</li>
              <li>• Additionality ensured - your contribution makes a real difference</li>
            </ul>
          </div>
        </div>
        
        {/* Add padding to prevent content from being hidden behind sticky footer */}
        <div className="h-32"></div>
      </div>
      
      {/* Sticky Cart Footer */}
      {selectedProject && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {selectedProjectData?.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedProjectData?.name}</p>
                  <p className="text-sm text-gray-600">
                    {quantity.toFixed(3)} tonne{quantity !== 1 ? 's' : ''} × €{selectedProjectData?.pricePerTonne} + €0.30 fee
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">€{totalCost}</p>
                </div>
                <button
                  onClick={handlePurchase}
                  className="bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}