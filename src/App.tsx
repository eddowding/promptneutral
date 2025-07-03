import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { PricingPage } from './pages/PricingPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { SettingsPage } from './pages/SettingsPage';
import { EmailVerification } from './components/EmailVerification';
import { PasswordReset } from './components/PasswordReset';
import FeedbackTab from './components/FeedbackTab';
import FeedbackPage from './pages/admin/FeedbackPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <FeedbackTab />
          <Routes>
            <Route path="/" element={
              <>
                <Navigation />
                <HomePage />
              </>
            } />
            <Route path="/auth" element={
              <>
                <Navigation />
                <AuthPage />
              </>
            } />
            <Route path="/pricing" element={
              <>
                <Navigation />
                <PricingPage />
              </>
            } />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/reset-password" element={<PasswordReset />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Navigation />
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Navigation />
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/feedback" 
              element={
                <ProtectedRoute>
                  <FeedbackPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;