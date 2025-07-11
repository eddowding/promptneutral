import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, User, LogOut, Settings, MessageSquare, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ADMIN_EMAILS } from '../services/config';
import { CurrencySelector } from './CurrencySelector';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/430xlogo.png" 
              alt="430xAI Logo" 
              className="w-12 h-12"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary">430xAI</span>
              <span className="text-xs text-neutral">AI savings → Climate impact</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                    location.pathname === '/dashboard' 
                      ? 'text-forest' 
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/settings" 
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                    location.pathname === '/settings' 
                      ? 'text-forest' 
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
              </>
            )}
            {isAuthenticated && isAdmin && (
              <Link 
                to="/admin/feedback" 
                className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                  location.pathname === '/admin/feedback' 
                    ? 'text-forest' 
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Feedback</span>
              </Link>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <CurrencySelector />
            {isAuthenticated ? (
              <>
                {/* User Menu - Desktop */}
                <div className="hidden md:flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user?.name}</span>
                  </div>
                  <button 
                    onClick={() => logout().catch(console.error)}
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/auth"
                  className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/auth"
                  className="hidden md:inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Get Started
                </Link>
              </>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-4 py-3 space-y-2">
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === '/dashboard'
                        ? 'bg-gray-100 text-forest'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === '/settings'
                        ? 'bg-gray-100 text-forest'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin/feedback"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === '/admin/feedback'
                          ? 'bg-gray-100 text-forest'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Feedback</span>
                    </Link>
                  )}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{user?.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        logout().catch(console.error);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
              {!isAuthenticated && (
                <Link
                  to="/auth"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2 bg-primary-600 text-white text-center rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};