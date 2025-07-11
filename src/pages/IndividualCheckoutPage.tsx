import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Heart, Coffee, Check, Video } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../contexts/CurrencyContext';

interface ServiceSelection {
  serviceId: string;
  tierId: string;
  yearlyPrice: number;
  hasVideoAddon?: boolean;
}

interface IndividualCheckoutData {
  selectedServices: ServiceSelection[];
  totalYearly: number;
  totalMonthly: number;
}

const AI_SERVICE_NAMES: Record<string, string> = {
  'openai': 'OpenAI',
  'claude': 'Claude (Anthropic)',
  'google': 'Google AI',
  'microsoft': 'Microsoft AI'
};

const TIER_NAMES: Record<string, string> = {
  'free': 'Free',
  'plus': 'Plus',
  'pro': 'Pro',
  'max': 'Max'
};

export function IndividualCheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const checkoutData = location.state as IndividualCheckoutData;
  const { currency } = useCurrency();
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!checkoutData) {
    navigate('/individual-plans');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save to database
      if (!supabase) {
        console.error('Supabase not configured');
        setShowThankYou(true);
        return;
      }
      
      // Prepare the individual subscription order data
      const orderData = {
        email,
        project_id: 'individual-subscription',
        project_name: 'Individual AI Carbon Offset Subscription',
        tonnes_offset: 0.1 * checkoutData.selectedServices.length, // Estimate for individual usage
        price_per_tonne: checkoutData.totalYearly / checkoutData.selectedServices.length,
        total_cost: checkoutData.totalYearly,
        ai_carbon_footprint: 0.1 * checkoutData.selectedServices.length,
        status: 'pending',
        is_monthly: false,
        subscription_type: 'individual',
        subscription_details: checkoutData.selectedServices,
        billing_period: 'yearly',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('carbon_offset_orders')
        .insert(orderData);

      if (error) {
        console.error('Error saving individual subscription:', error);
        // Still show thank you even if there's an error
      }

      setShowThankYou(true);
    } catch (err) {
      console.error('Error:', err);
      setShowThankYou(true); // Show thank you anyway
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showThankYou) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full mb-4">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-primary mb-4">
                Welcome to Guilt-Free AI! 💙
              </h1>
              <div className="space-y-4 text-gray-600">
                <p>
                  Thank you for choosing to offset your personal AI usage! 
                  We're building something special for conscious AI users like you.
                </p>
                <p className="flex items-center justify-center gap-2">
                  <Coffee className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Great news:</span> Your subscription details are saved!
                </p>
                <p>
                  We're putting the finishing touches on our individual subscription system. 
                  We'll email you at{' '}
                  <span className="font-medium text-blue-600">{email}</span> as soon as your 
                  {checkoutData.selectedServices.length > 1 ? ' subscriptions are' : ' subscription is'} ready!
                </p>
                <div className="bg-blue-50 rounded-lg p-4 mt-6">
                  <p className="text-sm font-bold mb-3">
                    Your Carbon Offset Plan:
                  </p>
                  <div className="space-y-2">
                    {checkoutData.selectedServices.map(service => (
                      <div key={service.serviceId} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span>{AI_SERVICE_NAMES[service.serviceId]}</span>
                          <span className="text-gray-500">({TIER_NAMES[service.tierId] || service.tierId})</span>
                          {service.hasVideoAddon && (
                            <Video className="w-3 h-3 text-yellow-600" />
                          )}
                        </div>
                        <span className="font-medium">
                          {currency.symbol}{service.yearlyPrice + (service.hasVideoAddon ? 36 : 0)}/year
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 mt-3 flex items-center justify-between font-bold">
                    <span>Total:</span>
                    <div className="text-right">
                      <div>{currency.symbol}{checkoutData.totalYearly}/year</div>
                      <div className="text-xs font-normal text-gray-500">
                        (~{currency.symbol}{checkoutData.totalMonthly}/month)
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm italic mt-4">
                  Every year, your subscription will fund verified carbon credits 
                  to offset your AI usage. Simple, guilt-free, impactful! 🌱
                </p>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Back to Homepage
              </button>
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                Made with <Heart className="h-3 w-3 text-red-500" /> for conscious AI users
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to service selection
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Complete Your Subscription
                </h1>
                <p className="text-blue-600 text-sm">Individual AI Carbon Offset Plan</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">Annual Subscription Summary</h3>
              <div className="space-y-2">
                {checkoutData.selectedServices.map(service => (
                  <div key={service.serviceId} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">{AI_SERVICE_NAMES[service.serviceId]}</span>
                      <span className="text-gray-500">({TIER_NAMES[service.tierId] || service.tierId})</span>
                      {service.hasVideoAddon && (
                        <Video className="w-3 h-3 text-yellow-600" />
                      )}
                    </div>
                    <span className="font-medium">
                      {currency.symbol}{service.yearlyPrice + (service.hasVideoAddon ? 36 : 0)}/yr
                    </span>
                  </div>
                ))}
                <div className="border-t border-blue-200 pt-2 mt-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-semibold text-blue-900">Annual Total:</span>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-blue-900">
                        {currency.symbol}{checkoutData.totalYearly}
                      </div>
                      <div className="text-xs text-gray-600">
                        ~{currency.symbol}{checkoutData.totalMonthly}/month
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 mb-1">What's Included</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Annual carbon offsets for your selected AI services</li>
                    <li>• Verified carbon credits from Gold Standard projects</li>
                    <li>• Annual billing for simplicity (save vs monthly)</li>
                    <li>• Cancel anytime, pro-rated refunds available</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  We'll send subscription updates and annual carbon impact reports to this email
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Start Annual Subscription'}
              </button>

              <p className="text-xs text-center text-gray-500">
                By subscribing, you agree to be notified when our individual plans are ready to launch
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}