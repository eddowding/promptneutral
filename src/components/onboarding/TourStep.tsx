import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Leaf, 
  Award, 
  Settings, 
  TrendingUp, 
  Shield, 
  PlayCircle,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { OnboardingData } from './OnboardingWizard';

interface TourStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface TourItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  completed: boolean;
}

export const TourStep: React.FC<TourStepProps> = ({ data }) => {
  const navigate = useNavigate();
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [isCompleting, setIsCompleting] = useState(false);

  const tourItems: TourItem[] = [
    {
      id: 'metrics',
      title: 'Carbon Metrics',
      description: 'Monitor real-time CO₂ emissions from all your AI services',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'blue',
      completed: completedItems.has('metrics'),
    },
    {
      id: 'neutrality',
      title: 'Neutrality Status',
      description: 'Track your carbon neutral status and offset progress',
      icon: <Leaf className="w-6 h-6" />,
      color: 'green',
      completed: completedItems.has('neutrality'),
    },
    {
      id: 'credits',
      title: 'Carbon Credits',
      description: 'View retired credits and offset project details',
      icon: <Award className="w-6 h-6" />,
      color: 'purple',
      completed: completedItems.has('credits'),
    },
    {
      id: 'compliance',
      title: 'Compliance Reports',
      description: 'Generate audit-ready reports for regulations',
      icon: <Shield className="w-6 h-6" />,
      color: 'indigo',
      completed: completedItems.has('compliance'),
    },
    {
      id: 'optimization',
      title: 'Optimization Tips',
      description: 'Get AI-powered recommendations to reduce emissions',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'orange',
      completed: completedItems.has('optimization'),
    },
    {
      id: 'settings',
      title: 'Settings & APIs',
      description: 'Manage integrations, budgets, and preferences',
      icon: <Settings className="w-6 h-6" />,
      color: 'gray',
      completed: completedItems.has('settings'),
    },
  ];

  const markCompleted = (itemId: string) => {
    setCompletedItems(prev => new Set([...prev, itemId]));
  };

  const completeDashboardTour = async () => {
    setIsCompleting(true);
    
    // Simulate saving onboarding data
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Navigate to dashboard
    navigate('/dashboard');
  };

  const allCompleted = tourItems.every(item => item.completed);
  const connectedServices = Object.values(data.services).filter(s => s?.enabled).length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Your Dashboard!
        </h1>
        <p className="text-lg text-gray-600">
          Let's take a quick tour of your carbon monitoring tools. 
          Click on each feature to learn more.
        </p>
      </div>

      {/* Setup Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Setup Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Connected Services:</span>
            <span className="ml-2 font-semibold text-gray-900">{connectedServices}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Monthly Budget:</span>
            <span className="ml-2 font-semibold text-gray-900">${data.goals.monthlyBudget}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Offset Project:</span>
            <span className="ml-2 font-semibold text-gray-900">{data.project.name}</span>
          </div>
        </div>
      </div>

      {/* Interactive Tour Items */}
      <div className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard Features</h2>
        
        {tourItems.map((item) => (
          <div
            key={item.id}
            className={`border rounded-xl p-6 transition-all cursor-pointer ${
              item.completed
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
            onClick={() => !item.completed && markCompleted(item.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`p-3 rounded-lg ${
                    item.completed
                      ? 'bg-green-100 text-green-600'
                      : `bg-${item.color}-100 text-${item.color}-600`
                  }`}
                >
                  {item.completed ? <CheckCircle className="w-6 h-6" /> : item.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
              
              {!item.completed ? (
                <PlayCircle className="w-6 h-6 text-gray-400" />
              ) : (
                <div className="text-green-600 font-medium text-sm">Viewed</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Tour Progress</span>
          <span className="text-sm font-medium text-gray-900">
            {completedItems.size} of {tourItems.length} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedItems.size / tourItems.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Completion Section */}
      {allCompleted ? (
        <div className="text-center">
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 mb-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              Congratulations! 🎉
            </h2>
            <p className="text-green-700 text-lg mb-4">
              You've completed the PromptNeutral setup and tour. 
              You're now ready to make your AI usage carbon neutral!
            </p>
            <div className="bg-white rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-gray-600 space-y-1 text-left max-w-md mx-auto">
                <li>• Your API usage will be monitored in real-time</li>
                <li>• Carbon emissions will be calculated automatically</li>
                <li>• Credits will be retired based on your timeline preference</li>
                <li>• You'll receive monthly impact reports</li>
              </ul>
            </div>
            <button
              onClick={completeDashboardTour}
              disabled={isCompleting}
              className="flex items-center space-x-2 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold mx-auto"
            >
              {isCompleting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Setting up your dashboard...</span>
                </>
              ) : (
                <>
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Click on the features above to learn about your dashboard capabilities.
          </p>
          <button
            onClick={() => {
              // Mark all as completed for demo purposes
              setCompletedItems(new Set(tourItems.map(item => item.id)));
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Skip tour and go to dashboard
          </button>
        </div>
      )}
    </div>
  );
};