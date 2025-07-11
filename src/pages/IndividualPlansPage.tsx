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
  Video,
  Star,
  Zap
} from 'lucide-react';

interface ServiceTier {
  id: string;
  name: string;
  yearlyPrice: number;
  description: string;
  popular?: boolean;
}

interface ServiceConfig {
  id: string;
  name: string;
  icon: string;
  tiers: ServiceTier[];
  hasVideoAddon?: boolean;
}

interface ServiceSelection {
  serviceId: string;
  tierId: string;
  yearlyPrice: number;
  hasVideoAddon?: boolean;
}

const AI_SERVICES: ServiceConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '🤖',
    hasVideoAddon: true,
    tiers: [
      {
        id: 'free',
        name: 'Free',
        yearlyPrice: 12,
        description: 'Using ChatGPT free tier'
      },
      {
        id: 'plus',
        name: 'Plus',
        yearlyPrice: 25,
        description: 'ChatGPT Plus ($20/month)',
        popular: true
      },
      {
        id: 'pro',
        name: 'Pro',
        yearlyPrice: 60,
        description: 'ChatGPT Pro & API usage'
      }
    ]
  },
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    icon: '🧠',
    tiers: [
      {
        id: 'free',
        name: 'Free',
        yearlyPrice: 12,
        description: 'Using Claude free tier'
      },
      {
        id: 'pro',
        name: 'Pro',
        yearlyPrice: 25,
        description: 'Claude Pro subscription',
        popular: true
      },
      {
        id: 'max',
        name: 'Max',
        yearlyPrice: 60,
        description: 'Heavy Claude usage & API'
      }
    ]
  },
  {
    id: 'google',
    name: 'Google AI',
    icon: '🔍',
    tiers: [
      {
        id: 'free',
        name: 'Free',
        yearlyPrice: 12,
        description: 'Gemini free tier'
      },
      {
        id: 'plus',
        name: 'Advanced',
        yearlyPrice: 25,
        description: 'Gemini Advanced'
      }
    ]
  },
  {
    id: 'microsoft',
    name: 'Microsoft AI',
    icon: '💼',
    tiers: [
      {
        id: 'free',
        name: 'Free',
        yearlyPrice: 12,
        description: 'Copilot free tier'
      },
      {
        id: 'plus',
        name: 'Pro',
        yearlyPrice: 25,
        description: 'Copilot Pro subscription'
      }
    ]
  }
];

export const IndividualPlansPage: React.FC = () => {
  const { currency } = useCurrency();
  const navigate = useNavigate();
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>([]);
  
  const videoAddonMonthlyPrice = 3;
  const videoAddonYearlyPrice = videoAddonMonthlyPrice * 12;
  
  const toggleService = (serviceId: string, tierId: string, yearlyPrice: number) => {
    setSelectedServices(prev => {
      const existing = prev.find(s => s.serviceId === serviceId);
      if (existing && existing.tierId === tierId) {
        // Remove if clicking the same tier
        return prev.filter(s => s.serviceId !== serviceId);
      } else if (existing) {
        // Update tier if different
        return prev.map(s => 
          s.serviceId === serviceId 
            ? { ...s, tierId, yearlyPrice }
            : s
        );
      } else {
        // Add new selection
        return [...prev, { serviceId, tierId, yearlyPrice }];
      }
    });
  };

  const toggleVideoAddon = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.map(s => 
        s.serviceId === serviceId 
          ? { ...s, hasVideoAddon: !s.hasVideoAddon }
          : s
      )
    );
  };

  const getSelectedTier = (serviceId: string) => {
    const selection = selectedServices.find(s => s.serviceId === serviceId);
    return selection?.tierId || null;
  };

  const hasVideoAddon = (serviceId: string) => {
    const selection = selectedServices.find(s => s.serviceId === serviceId);
    return selection?.hasVideoAddon || false;
  };

  const getTotalYearly = () => {
    return selectedServices.reduce((total, s) => {
      const videoAddon = s.hasVideoAddon ? videoAddonYearlyPrice : 0;
      return total + s.yearlyPrice + videoAddon;
    }, 0);
  };

  const getTotalMonthly = () => {
    return Math.round(getTotalYearly() / 12);
  };

  const handleSubscribe = () => {
    if (selectedServices.length === 0) return;
    
    navigate('/individual-checkout', {
      state: {
        selectedServices: selectedServices,
        totalYearly: getTotalYearly(),
        totalMonthly: getTotalMonthly()
      }
    });
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            For Individuals
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Offset Your Personal AI Usage
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            We're pretty confident that given how efficient the models actually are, you'll be doing more than your bit by offsetting. 
            We're hoping that it saves you so much time and effort in the rest of your life that you'll have a little extra to be able to give back.
          </p>
          
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Quick setup
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
          
          <div className="mt-6">
            <Link 
              to="/why-430x" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Learn more about our mission
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Service Selection */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Select Your AI Services & Plans</h2>
            <p className="text-xl text-gray-600">
              Choose the tier that matches your subscription for each service
            </p>
          </div>
          
          <div className="space-y-8">
            {AI_SERVICES.map((service) => (
              <div key={service.id} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{service.icon}</span>
                    <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {service.tiers.map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => toggleService(service.id, tier.id, tier.yearlyPrice)}
                        className={`relative p-4 rounded-lg border-2 transition-all ${
                          getSelectedTier(service.id) === tier.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {tier.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                              <Star className="w-3 h-3" />
                              Popular
                            </span>
                          </div>
                        )}
                        
                        <div className="text-lg font-semibold text-gray-900 mb-1">
                          {tier.name}
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          {currency.symbol}{tier.yearlyPrice}/yr
                        </div>
                        <div className="text-sm text-gray-500 mb-3">
                          ~{currency.symbol}{Math.round(tier.yearlyPrice / 12)}/month
                        </div>
                        <div className="text-xs text-gray-600">
                          {tier.description}
                        </div>
                        
                        {getSelectedTier(service.id) === tier.id && (
                          <div className="absolute top-2 right-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {/* Video Add-on for OpenAI */}
                  {service.hasVideoAddon && getSelectedTier(service.id) && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Video className="w-5 h-5 text-yellow-600" />
                          <div>
                            <div className="font-medium text-gray-900">Video generation</div>
                            <div className="text-sm text-gray-600">
                              Add {currency.symbol}{videoAddonMonthlyPrice}/month ({currency.symbol}{videoAddonYearlyPrice}/year) if you create videos
                            </div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={hasVideoAddon(service.id)}
                          onChange={() => toggleVideoAddon(service.id)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          
          {selectedServices.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select your AI services and subscription tiers to get started</p>
            </div>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent, Impactful</h2>
            <p className="text-xl text-gray-600">
              Your AI subscriptions matched with verified carbon offsets
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Match Your Usage</h3>
              <p className="text-gray-600">
                Pricing tiers that match your actual AI service subscriptions
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Real Impact</h3>
              <p className="text-gray-600">
                100% of your contribution goes to verified carbon offset projects
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Peace of Mind</h3>
              <p className="text-gray-600">
                Use AI guilt-free knowing you're offsetting your carbon footprint
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Offset Your AI Usage?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands making their personal AI usage carbon neutral
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
            Starting from just {currency.symbol}12/year • Cancel anytime
          </p>
        </div>
      </section>

      <Footer />

      {/* Sticky Cart Footer */}
      {selectedServices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-green-50 border-t border-green-200 shadow-lg z-50">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-gray-500">
                    {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {currency.symbol}{getTotalYearly()}/year
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (~{currency.symbol}{getTotalMonthly()}/mo)
                    </span>
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  {selectedServices.map(service => {
                    const config = AI_SERVICES.find(s => s.id === service.serviceId);
                    return (
                      <div key={service.serviceId} className="flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm border border-green-200">
                        <span>{config?.icon}</span>
                        <span>{config?.name}</span>
                        {service.hasVideoAddon && <Video className="w-3 h-3 text-yellow-600 ml-1" />}
                      </div>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={handleSubscribe}
                className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold flex items-center justify-center gap-2 shadow-md"
              >
                Subscribe Now
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};