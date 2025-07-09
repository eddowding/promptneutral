import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { HomePageV2 } from './pages/HomePageV2';
import { DashboardPage } from './pages/DashboardPage';
import { OffsetOrderPage } from './pages/OffsetOrderPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PricingPage } from './pages/PricingPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { SettingsPage } from './pages/SettingsPage';
import { EmailVerification } from './components/EmailVerification';
import { PasswordReset } from './components/PasswordReset';
import FeedbackTab from './components/FeedbackTab';
import FeedbackPage from './pages/admin/FeedbackPage';
import SouthPoleTest from './components/SouthPoleTest';

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
                <HomePageV2 />
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
            <Route 
              path="/southpole-test" 
              element={<SouthPoleTest />} 
            />
            <Route path="/offset-order" element={
              <>
                <Navigation />
                <OffsetOrderPage />
              </>
            } />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;