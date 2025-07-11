import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { Navigation } from './components/Navigation';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { HomePageV2 } from './pages/HomePageV2';
import { DashboardPage } from './pages/DashboardPage';
import { OffsetOrderPage } from './pages/OffsetOrderPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ResearchPage } from './pages/ResearchPage';
import { PricingPage } from './pages/PricingPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { SettingsPage } from './pages/SettingsPage';
import { EmailVerification } from './components/EmailVerification';
import { PasswordReset } from './components/PasswordReset';
import FeedbackTab from './components/FeedbackTab';
import FeedbackPage from './pages/admin/FeedbackPage';
import SouthPoleTest from './components/SouthPoleTest';
import { Why430xPage } from './pages/Why430xPage';
import { IndividualPlansPage } from './pages/IndividualPlansPage';
import { IndividualCheckoutPage } from './pages/IndividualCheckoutPage';

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
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
            <Route path="/individual-plans" element={
              <>
                <Navigation />
                <IndividualPlansPage />
              </>
            } />
            <Route path="/individual-checkout" element={<IndividualCheckoutPage />} />
            <Route path="/research" element={<ResearchPage />} />
            <Route path="/why-430x" element={<Why430xPage />} />
          </Routes>
        </div>
      </Router>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;