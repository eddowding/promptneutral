import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <img 
              src="/430xlogo.png" 
              alt="430xAI Logo" 
              className="w-12 h-12 mr-3"
            />
            <span className="text-2xl font-bold text-gray-900">430xAI</span>
          </div>
          <p className="text-sm text-gray-600">AI savings → Climate impact</p>
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

    </div>
  );
};