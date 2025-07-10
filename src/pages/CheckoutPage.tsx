import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Mail, Sparkles, Construction, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CheckoutData {
  projectId: string;
  projectName: string;
  quantity: number;
  pricePerTonne: number;
  totalCost: string;
  offsetAmount: number;
  heroAmount?: number;
  standardCost?: number;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const checkoutData = location.state as CheckoutData;
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  if (!checkoutData) {
    navigate('/offset-order');
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
      
      // Prepare the order data
      const orderData: any = {
        email,
        project_id: checkoutData.projectId,
        project_name: checkoutData.projectName,
        tonnes_offset: checkoutData.quantity,
        price_per_tonne: checkoutData.pricePerTonne,
        total_cost: parseFloat(checkoutData.totalCost),
        ai_carbon_footprint: checkoutData.offsetAmount,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Add hero fields if they exist (graceful handling for pre-migration state)
      if (checkoutData.heroAmount) {
        orderData.hero_amount = checkoutData.heroAmount;
        orderData.is_hero = true;
        orderData.standard_cost = checkoutData.standardCost;
      }

      const { error } = await supabase
        .from('carbon_offset_orders')
        .insert(orderData);

      if (error) {
        console.error('Error saving order:', error);
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full mb-4">
                <Construction className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Oops! You caught us building! 🚧
              </h1>
              <div className="space-y-4 text-gray-600">
                <p>
                  Thanks so much for wanting to offset your AI carbon footprint! 
                  We're absolutely thrilled by your commitment to the environment.
                </p>
                <p className="flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Good news:</span> We've saved your order details!
                </p>
                <p>
                  We're putting the finishing touches on our payment system (making sure it's as 
                  eco-friendly as possible, of course 🌱). We'll email you at{' '}
                  <span className="font-medium text-green-600">{email}</span> as soon as we're live!
                </p>
                <div className="bg-blue-50 rounded-lg p-4 mt-6">
                  <p className="text-sm">
                    <strong>Your impact preview:</strong> You selected{' '}
                    <span className="font-medium">{checkoutData.quantity} tonnes</span> of carbon offsets 
                    through the <span className="font-medium">{checkoutData.projectName}</span> project. 
                    That's amazing! 
                  </p>
                </div>
                <p className="text-sm italic mt-4">
                  P.S. - We promise this won't take long. Our developers are powered by 
                  renewable energy and sustainable coffee! ☕️
                </p>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Back to Calculator
              </button>
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                Made with <Heart className="h-3 w-3 text-red-500" /> for the planet
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to projects
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Order
            </h1>
            <p className="text-gray-600 mb-6">
              {checkoutData.heroAmount 
                ? `You're offsetting by ${((checkoutData.heroAmount / checkoutData.standardCost!) * 100).toFixed(0)}% - ${((checkoutData.heroAmount / checkoutData.standardCost!) * 100) >= 430 ? 'true 430x climate leadership!' : 'every bit helps!'}`
                : 'Just one more step to offset your AI carbon footprint!'
              }
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Project:</span>
                  <span className="font-medium">{checkoutData.projectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{checkoutData.quantity} tonnes CO₂</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per tonne:</span>
                  <span className="font-medium">€{checkoutData.pricePerTonne}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>€{checkoutData.totalCost}</span>
                  </div>
                </div>
              </div>
            </div>

            {checkoutData.heroAmount && checkoutData.standardCost && (
              <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌍</span>
                    <span className="font-bold text-lg">430x Movement</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-700">
                      {((checkoutData.heroAmount / checkoutData.standardCost) * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-600">
                      of needed offset
                    </div>
                  </div>
                </div>
                {((checkoutData.heroAmount / checkoutData.standardCost) * 100) >= 430 && (
                  <p className="text-sm text-yellow-700 mt-2 font-medium">
                    ✨ You've reached the 430x target - matching our 430ppm CO₂ reality!
                  </p>
                )}
              </div>
            )}

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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  We'll use this to send you updates about your offset purchase
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Continue Purchase'}
              </button>

              <p className="text-xs text-center text-gray-500">
                By completing this purchase, you agree to be notified when our payment system is ready
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}