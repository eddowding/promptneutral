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
  Shield
} from 'lucide-react';

const AI_SERVICES = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'ChatGPT, GPT-4, DALL-E, and other OpenAI services',
    icon: '🤖',
    popular: true
  },
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    description: 'Claude AI assistant and API usage',
    icon: '🧠',
    popular: true
  },
  {
    id: 'google',
    name: 'Google AI',
    description: 'Gemini, Bard, and Google AI services',
    icon: '🔍',
    popular: false
  },
  {
    id: 'microsoft',
    name: 'Microsoft AI',
    description: 'Copilot, Azure AI, and Microsoft services',
    icon: '💼',
    popular: false
  },
  {
    id: 'other',
    name: 'Other AI Services',
    description: 'Any other AI service not listed above',
    icon: '⚡',
    popular: false
  }
];

export const IndividualPlansPage: React.FC = () => {
  const { formatCurrencyFromEUR } = useCurrency();
  const navigate = useNavigate();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  const monthlyPrice = formatCurrencyFromEUR(4.99);
  
  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubscribe = () => {
    if (selectedServices.length === 0) return;
    
    // Navigate to individual checkout with selected services
    navigate('/individual-checkout', {
      state: {
        selectedServices,
        monthlyPrice: 4.99,
        totalServices: selectedServices.length
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
            Simple monthly subscriptions to offset your personal AI usage. 
            Choose which services you use and we'll handle the rest.
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

      {/* Service Selection */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your AI Services</h2>
            <p className="text-xl text-gray-600">
              Select the AI services you use. Each subscription is {monthlyPrice}/month.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {AI_SERVICES.map((service) => (
              <div
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  selectedServices.includes(service.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-4 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                    Popular
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{service.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                      <div className={`w-5 h-5 border-2 rounded ${
                        selectedServices.includes(service.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedServices.includes(service.id) && (
                          <Check className="w-3 h-3 text-white m-0.5" />
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-lg font-bold text-gray-900">{monthlyPrice}</span>
                      <span className="text-sm text-gray-500">/month</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary and Subscribe */}
          {selectedServices.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedServices.length} Service{selectedServices.length > 1 ? 's' : ''} Selected
                </h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatCurrencyFromEUR(4.99 * selectedServices.length)}/month
                </div>
                <p className="text-gray-600">
                  Total for all your selected AI services
                </p>
              </div>
              
              <div className="space-y-3 mb-8">
                {selectedServices.map(serviceId => {
                  const service = AI_SERVICES.find(s => s.id === serviceId);
                  return (
                    <div key={serviceId} className="flex items-center justify-between bg-white rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{service?.icon}</span>
                        <span className="font-medium">{service?.name}</span>
                      </div>
                      <span className="text-gray-600">{monthlyPrice}/month</span>
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
              <p className="text-gray-500">Select the AI services you use to get started</p>
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
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Simple & Easy</h3>
              <p className="text-gray-600">
                No complex tracking or setup. Just choose your services and we handle everything.
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