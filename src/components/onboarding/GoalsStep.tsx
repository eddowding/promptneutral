import React from 'react';
import { Target, DollarSign, Zap, Bell, Clock, Calendar, Gauge } from 'lucide-react';
import { OnboardingData } from './OnboardingWizard';

interface GoalsStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const GoalsStep: React.FC<GoalsStepProps> = ({
  data,
  updateData,
  onNext,
}) => {
  const updateGoals = (goals: Partial<OnboardingData['goals']>) => {
    updateData({
      goals: { ...data.goals, ...goals },
    });
  };

  const budgetOptions = [
    { value: 25, label: '$25/month', description: 'Small team or personal use' },
    { value: 100, label: '$100/month', description: 'Growing startup' },
    { value: 500, label: '$500/month', description: 'Established company' },
    { value: 1000, label: '$1,000/month', description: 'Enterprise usage' },
    { value: 0, label: 'Custom', description: 'Set your own budget' },
  ];

  const neutralityOptions = [
    {
      value: 'immediate' as const,
      label: 'Immediate',
      description: 'Offset carbon emissions in real-time',
      icon: <Zap className="w-5 h-5" />,
      recommended: true,
    },
    {
      value: 'weekly' as const,
      label: 'Weekly',
      description: 'Batch offset emissions weekly',
      icon: <Calendar className="w-5 h-5" />,
      recommended: false,
    },
    {
      value: 'monthly' as const,
      label: 'Monthly',
      description: 'Offset at month end for cost efficiency',
      icon: <Clock className="w-5 h-5" />,
      recommended: false,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Set Your Carbon Goals
        </h1>
        <p className="text-lg text-gray-600">
          Configure your neutrality targets and budget preferences. You can adjust these anytime.
        </p>
      </div>

      {/* Monthly Budget */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Monthly Carbon Budget</h2>
        </div>
        <p className="text-gray-600 mb-6">
          Set a monthly budget for carbon credits. We'll notify you when you approach your limit.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {budgetOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateGoals({ monthlyBudget: option.value })}
              className={`p-4 border rounded-xl text-left transition-colors ${
                data.goals.monthlyBudget === option.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-900">{option.label}</div>
              <div className="text-sm text-gray-600 mt-1">{option.description}</div>
            </button>
          ))}
        </div>

        {data.goals.monthlyBudget === 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Budget
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                min="1"
                placeholder="Enter amount"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                onChange={(e) => updateGoals({ monthlyBudget: Number(e.target.value) })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Neutrality Target */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Gauge className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Neutrality Timeline</h2>
        </div>
        <p className="text-gray-600 mb-6">
          Choose how quickly you want to offset your carbon emissions. Immediate offsetting provides 
          the best environmental impact but may cost slightly more.
        </p>
        
        <div className="space-y-4">
          {neutralityOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateGoals({ neutralityTarget: option.value })}
              className={`w-full p-4 border rounded-xl text-left transition-colors ${
                data.goals.neutralityTarget === option.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    data.goals.neutralityTarget === option.value
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {option.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{option.label}</span>
                      {option.recommended && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Bell className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.goals.notifications}
              onChange={(e) => updateGoals({ notifications: e.target.checked })}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div>
              <div className="font-medium text-gray-900">Enable notifications</div>
              <div className="text-sm text-gray-600">
                Get alerts about budget limits, carbon goals, and monthly reports
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-green-900 mb-3">Your Settings</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-green-700">Monthly Budget:</span>
            <span className="font-medium text-green-900">
              {data.goals.monthlyBudget === 0 ? 'Custom' : `$${data.goals.monthlyBudget}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">Neutrality Timeline:</span>
            <span className="font-medium text-green-900 capitalize">
              {data.goals.neutralityTarget}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">Notifications:</span>
            <span className="font-medium text-green-900">
              {data.goals.notifications ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="text-center">
        <button
          onClick={onNext}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
        >
          Continue to Projects
        </button>
      </div>
    </div>
  );
};