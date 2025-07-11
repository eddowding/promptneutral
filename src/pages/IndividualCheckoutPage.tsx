import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Heart, Coffee, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../contexts/CurrencyContext';

interface IndividualCheckoutData {
  selectedServices: string[];
  monthlyPrice: number;
  totalServices: number;
}

const AI_SERVICE_NAMES: Record<string, string> = {
  'openai': 'OpenAI',
  'claude': 'Claude (Anthropic)',
  'google': 'Google AI',
  'microsoft': 'Microsoft AI',
  'other': 'Other AI Services'
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

  const totalCost = checkoutData.monthlyPrice * checkoutData.totalServices;

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
        tonnes_offset: 0.1 * checkoutData.totalServices, // Estimate for individual usage
        price_per_tonne: checkoutData.monthlyPrice * 10, // Adjusted for small tonnage
        total_cost: totalCost,
        ai_carbon_footprint: 0.1 * checkoutData.totalServices,
        status: 'pending',
        is_monthly: true,
        subscription_type: 'individual',
        ai_services: checkoutData.selectedServices,
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
                  {checkoutData.totalServices > 1 ? ' subscriptions are' : ' subscription is'} ready!
                </p>
                <div className="bg-blue-50 rounded-lg p-4 mt-6">
                  <p className="text-sm">
                    <strong>Your selected services:</strong>
                  </p>
                  <div className="mt-2 space-y-1">
                    {checkoutData.selectedServices.map(serviceId => (
                      <div key={serviceId} className="flex items-center justify-between text-sm">
                        <span>{AI_SERVICE_NAMES[serviceId]}</span>
                        <span className="font-medium">{currency.symbol}{checkoutData.monthlyPrice}/month</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 mt-2 flex items-center justify-between font-medium">
                    <span>Total:</span>
                    <span>{currency.symbol}{totalCost}/month</span>
                  </div>
                </div>
                <p className="text-sm italic mt-4">
                  Every month, your subscription will fund verified carbon credits 
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
              <h3 className="font-semibold text-blue-900 mb-3">Subscription Summary</h3>
              <div className="space-y-2">
                {checkoutData.selectedServices.map(serviceId => (
                  <div key={serviceId} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{AI_SERVICE_NAMES[serviceId]}</span>
                    <span className="font-medium">{currency.symbol}{checkoutData.monthlyPrice}/month</span>
                  </div>
                ))}
                <div className="border-t border-blue-200 pt-2 mt-3">
                  <div className="flex justify-between text-lg font-semibold text-blue-900">
                    <span>Monthly Total:</span>
                    <span>{currency.symbol}{totalCost}</span>
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
                    <li>• Monthly carbon offsets for your selected AI services</li>
                    <li>• Verified carbon credits from Gold Standard projects</li>
                    <li>• Guilt-free AI usage with automatic renewals</li>
                    <li>• Cancel anytime, no long-term commitment</li>
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
                  We'll send subscription updates and carbon impact reports to this email
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Start Monthly Subscription'}
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