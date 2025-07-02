import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { LoginForm } from '../components/LoginForm';
import { SignupForm } from '../components/SignupForm';
import { useAuth } from '../contexts/AuthContext';

type AuthMode = 'login' | 'signup';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<AuthMode>('login');

  // Get the intended destination from location state, default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Handle successful authentication
  const handleAuthSuccess = () => {
    navigate(from, { replace: true });
  };

  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and Brand */}
        <div className="flex items-center justify-center mb-8">
          <div className="p-3 bg-green-100 rounded-xl">
            <Leaf className="w-8 h-8 text-green-600" />
          </div>
          <span className="ml-3 text-2xl font-bold text-gray-900">PromptNeutral</span>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex rounded-t-xl overflow-hidden">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-colors ${
                activeTab === 'login'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-colors ${
                activeTab === 'signup'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="relative">
          {/* Login Form */}
          <div className={`transition-all duration-300 ${
            activeTab === 'login' ? 'opacity-100 visible' : 'opacity-0 invisible absolute inset-0'
          }`}>
            {activeTab === 'login' && (
              <LoginForm onSuccess={handleAuthSuccess} />
            )}
          </div>

          {/* Signup Form */}
          <div className={`transition-all duration-300 ${
            activeTab === 'signup' ? 'opacity-100 visible' : 'opacity-0 invisible absolute inset-0'
          }`}>
            {activeTab === 'signup' && (
              <SignupForm onSuccess={handleAuthSuccess} />
            )}
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Back to Home
            </button>
            <span className="text-gray-300">|</span>
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              Help & Support
            </button>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-200 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
      </div>

      {/* Feature Highlights */}
      <div className="hidden lg:block absolute top-1/2 left-8 transform -translate-y-1/2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Why PromptNeutral?</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              Track your AI usage carbon footprint in real-time
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              Get actionable insights to reduce environmental impact
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              Generate compliance reports for sustainability goals
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              Support carbon-neutral AI initiatives
            </li>
          </ul>
        </div>
      </div>

      <div className="hidden lg:block absolute top-1/2 right-8 transform -translate-y-1/2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security & Privacy</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              End-to-end encryption for all data
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              GDPR compliant data handling
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              No data sharing with third parties
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              SOC 2 Type II certified infrastructure
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};