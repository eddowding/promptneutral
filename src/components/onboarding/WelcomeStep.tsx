import React from 'react';
import { Leaf, Zap, Shield, BarChart3, Award, Globe } from 'lucide-react';
import { OnboardingData } from './OnboardingWizard';

interface WelcomeStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="text-center max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-green-100 rounded-2xl">
            <Leaf className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to 430xAI
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          AI savings → Climate impact. Turn your AI cost savings into planetary-scale 
          restoration projects with real-time monitoring and verified carbon credits.
        </p>
      </div>

      {/* Key Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-green-50 rounded-xl border border-green-200">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Instant Setup
          </h3>
          <p className="text-gray-600 text-sm">
            Connect your AI services and start monitoring carbon impact in under 30 seconds.
          </p>
        </div>

        <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Real-Time Tracking
          </h3>
          <p className="text-gray-600 text-sm">
            Monitor carbon emissions for every prompt with millisecond precision.
          </p>
        </div>

        <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Compliance Ready
          </h3>
          <p className="text-gray-600 text-sm">
            EU Green Claims Directive compliant with audit-ready documentation.
          </p>
        </div>
      </div>

      {/* What We'll Set Up */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          What we'll set up today:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-gray-900">AI Service Connections</h4>
              <p className="text-sm text-gray-600">OpenAI, Anthropic, Google, and more</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-gray-900">Carbon Goals</h4>
              <p className="text-sm text-gray-600">Monthly budgets and neutrality targets</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-gray-900">Offset Projects</h4>
              <p className="text-sm text-gray-600">Choose verified forest, renewable, or direct capture</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-gray-900">Dashboard Tour</h4>
              <p className="text-sm text-gray-600">Learn to use your carbon monitoring tools</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="flex items-center justify-center space-x-8 mb-8 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-green-600" />
          <span>Gold Standard Certified</span>
        </div>
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-blue-600" />
          <span>EU GDPR Compliant</span>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-purple-600" />
          <span>SOC 2 Type II</span>
        </div>
      </div>

      {/* CTA */}
      <div>
        <button
          onClick={onNext}
          className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
        >
          Get Started
        </button>
        <p className="text-sm text-gray-500 mt-3">
          Takes less than 5 minutes • No credit card required
        </p>
      </div>
    </div>
  );
};