import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { useCurrency } from '../contexts/CurrencyContext';
import { 
  Heart, 
  Coffee, 
  Check, 
  ArrowRight,
  Leaf,
  Sparkles,
  Clock,
  Shield,
  TreePine
} from 'lucide-react';

interface ServiceSelection {
  serviceId: string;
  amount: number;
}

const AI_SERVICES = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'ChatGPT, GPT-4, DALL-E, and other OpenAI services',
    icon: '🤖',
    popular: true,
    basePrice: 3
  },
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    description: 'Claude AI assistant and API usage',
    icon: '🧠',
    popular: true,
    basePrice: 3
  },
  {
    id: 'google',
    name: 'Google AI',
    description: 'Gemini, Bard, and Google AI services',
    icon: '🔍',
    popular: false,
    basePrice: 3  // Google is specifically £3/€3/$3
  },
  {
    id: 'microsoft',
    name: 'Microsoft AI',
    description: 'Copilot, Azure AI, and Microsoft services',
    icon: '💼',
    popular: false,
    basePrice: 3
  },
  {
    id: 'other',
    name: 'Other AI Services',
    description: 'Any other AI service not listed above',
    icon: '⚡',
    popular: false,
    basePrice: 3
  }
];

const PRICE_TIERS = [3, 4, 5, 6, 8];

export const IndividualPlansPage: React.FC = () => {
  const { currency } = useCurrency();
  const navigate = useNavigate();
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>([]);
  
  const toggleService = (serviceId: string, amount: number) => {
    setSelectedServices(prev => {
      const existing = prev.find(s => s.serviceId === serviceId);
      if (existing) {
        if (existing.amount === amount) {
          // Remove if clicking the same amount
          return prev.filter(s => s.serviceId !== serviceId);
        } else {
          // Update amount if different
          return prev.map(s => s.serviceId === serviceId ? { serviceId, amount } : s);
        }
      } else {
        // Add new selection
        return [...prev, { serviceId, amount }];
      }
    });
  };

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(s => s.serviceId === serviceId);
  };

  const getSelectedAmount = (serviceId: string) => {
    const selection = selectedServices.find(s => s.serviceId === serviceId);
    return selection?.amount || 0;
  };

  const getTotalAmount = () => {
    return selectedServices.reduce((total, s) => total + s.amount, 0);
  };

  const handleSubscribe = () => {
    if (selectedServices.length === 0) return;
    
    // Navigate to individual checkout with selected services
    navigate('/individual-checkout', {
      state: {
        selectedServices: selectedServices.map(s => s.serviceId),
        servicePrices: selectedServices,
        totalAmount: getTotalAmount()
      }
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            For Individuals
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Guilt-Free AI for 
            <span className="text-blue-600"> Everyone</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Choose your impact level. Start from just {currency.symbol}3/month per service. 
            Offset more to support additional climate projects.
          </p>
          
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              30-second setup
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Cancel anytime
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-blue-600" />
              Verified offsets
            </div>
          </div>
        </div>
      </section>

      {/* Impact Levels */}
      <section className="py-12 bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose Your Impact Level</h2>
          <div className="grid grid-cols-5 gap-3 max-w-3xl mx-auto">
            {PRICE_TIERS.map((tier, index) => (
              <div key={tier} className="text-center">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-lg font-bold text-gray-900">{currency.symbol}{tier}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {index === 0 && 'Essential'}
                    {index === 1 && 'Standard'}
                    {index === 2 && 'Plus'}
                    {index === 3 && 'Premium'}
                    {index === 4 && 'Hero'}
                  </div>
                  <TreePine className={`w-4 h-4 mx-auto mt-2 ${
                    index === 0 ? 'text-green-400' :
                    index === 1 ? 'text-green-500' :
                    index === 2 ? 'text-green-600' :
                    index === 3 ? 'text-green-700' :
                    'text-green-800'
                  }`} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">
            All tiers offset your AI usage - higher tiers support additional climate projects
          </p>
        </div>
      </section>

      {/* Service Selection */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Select Your AI Services</h2>
            <p className="text-xl text-gray-600">
              Choose the services you use and your preferred impact level for each
            </p>
          </div>
          
          <div className="space-y-6">
            {AI_SERVICES.map((service) => (
              <div
                key={service.id}
                className={`border-2 rounded-xl p-6 transition-all ${
                  isServiceSelected(service.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {service.popular && (
                  <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full mb-3">
                    Popular
                  </div>
                )}
                
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl">{service.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {PRICE_TIERS.map((tier) => (
                    <button
                      key={tier}
                      onClick={() => toggleService(service.id, tier)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        getSelectedAmount(service.id) === tier
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {currency.symbol}{tier}/mo
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary and Subscribe */}
          {selectedServices.length > 0 && (
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedServices.length} Service{selectedServices.length > 1 ? 's' : ''} Selected
                </h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {currency.symbol}{getTotalAmount()}/month
                </div>
                <p className="text-gray-600">
                  Total monthly contribution
                </p>
              </div>
              
              <div className="space-y-3 mb-8 max-w-md mx-auto">
                {selectedServices.map(selection => {
                  const service = AI_SERVICES.find(s => s.id === selection.serviceId);
                  return (
                    <div key={selection.serviceId} className="flex items-center justify-between bg-white rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{service?.icon}</span>
                        <span className="font-medium">{service?.name}</span>
                      </div>
                      <span className="text-gray-600">{currency.symbol}{selection.amount}/month</span>
                    </div>
                  );
                })}
              </div>
              
              <button
                onClick={handleSubscribe}
                className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
              >
                Subscribe Now
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </button>
              
              <p className="text-sm text-gray-600 mt-4">
                Start offsetting your AI carbon footprint today. Cancel anytime.
              </p>
            </div>
          )}
          
          {selectedServices.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select services and impact levels to get started</p>
            </div>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Individual Plans?</h2>
            <p className="text-xl text-gray-600">
              Perfect for personal AI users who want to make a positive impact
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Coffee className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Simple & Flexible</h3>
              <p className="text-gray-600">
                Choose your services and impact level. No complex tracking or setup required.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Real Impact</h3>
              <p className="text-gray-600">
                Every subscription funds verified carbon credits that make a real difference.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Peace of Mind</h3>
              <p className="text-gray-600">
                Use AI guilt-free knowing your carbon footprint is being offset.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready for Guilt-Free AI?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join individuals worldwide making their AI usage carbon neutral.
          </p>
          <Link 
            to="#services"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-colors text-lg font-semibold"
          >
            Select Your Services Above
          </Link>
          <p className="text-blue-100 text-sm mt-6">
            No long-term commitment • Cancel anytime • Immediate impact
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};