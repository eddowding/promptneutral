import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, BarChart3, User, LogOut, Settings, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ADMIN_EMAILS } from '../services/config';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">430xAI</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated && (
              <>
                <Link 
                  to="/settings" 
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                    location.pathname === '/settings' 
                      ? 'text-green-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin/feedback" 
                    className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                      location.pathname === '/admin/feedback' 
                        ? 'text-green-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Feedback</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user?.name}</span>
                  </div>
                  <button 
                    onClick={() => logout().catch(console.error)}
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/auth"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/auth"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};