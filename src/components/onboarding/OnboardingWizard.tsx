import React, { useState, useEffect, useContext } from 'react';
import { ChevronLeft, ChevronRight, Check, Save } from 'lucide-react';
import { WelcomeStep } from './WelcomeStep';
import { ProfileStep } from './ProfileStep';
import { ConnectServicesStep } from './ConnectServicesStep';
import { GoalsStep } from './GoalsStep';
import { ProjectsStep } from './ProjectsStep';
import { TourStep } from './TourStep';
import { AuthContext } from '../../contexts/AuthContext';
import { onboardingService } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '../ErrorBoundary';
import { ErrorNotification } from '../ErrorNotification';

export interface OnboardingData {
  profile: {
    fullName: string;
    company: string;
    role: string;
    industry: string;
    teamSize: 'individual' | 'small' | 'medium' | 'large' | 'enterprise';
  };
  services: {
    openai_admin?: { apiKey: string; enabled: boolean; validated: boolean };
    anthropic?: { apiKey: string; enabled: boolean; validated: boolean };
    google?: { apiKey: string; enabled: boolean; validated: boolean };
  };
  goals: {
    monthlyBudget: number;
    neutralityTarget: 'immediate' | 'weekly' | 'monthly';
    notifications: boolean;
    carbonReductionGoal: number;
    reportingFrequency: 'weekly' | 'monthly' | 'quarterly';
  };
  project: {
    type: 'forest' | 'renewable' | 'direct-capture';
    projectId: string;
    name: string;
  };
  preferences: {
    demoMode: boolean;
    dataSource: 'demo' | 'real';
    timezone: string;
    currency: 'USD' | 'EUR' | 'GBP';
  };
  progress: {
    currentStep: number;
    completedSteps: string[];
    lastSaved: string;
    isComplete: boolean;
  };
}

const steps = [
  { id: 'welcome', title: 'Welcome', component: WelcomeStep },
  { id: 'profile', title: 'Profile', component: ProfileStep },
  { id: 'services', title: 'Connect Services', component: ConnectServicesStep },
  { id: 'goals', title: 'Set Goals', component: GoalsStep },
  { id: 'projects', title: 'Choose Project', component: ProjectsStep },
  { id: 'tour', title: 'Dashboard Tour', component: TourStep },
];

export const OnboardingWizard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [data, setData] = useState<OnboardingData>({
    profile: {
      fullName: '',
      company: '',
      role: '',
      industry: '',
      teamSize: 'small',
    },
    services: {},
    goals: {
      monthlyBudget: 100,
      neutralityTarget: 'immediate',
      notifications: true,
      carbonReductionGoal: 25,
      reportingFrequency: 'monthly',
    },
    project: {
      type: 'forest',
      projectId: '',
      name: '',
    },
    preferences: {
      demoMode: true,
      dataSource: 'demo',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currency: 'USD',
    },
    progress: {
      currentStep: 0,
      completedSteps: [],
      lastSaved: new Date().toISOString(),
      isComplete: false,
    },
  });

  // Load saved progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const savedProgress = await onboardingService.loadProgress(user.id);
        
        if (savedProgress?.onboarding_data) {
          setData(savedProgress.onboarding_data);
          setCurrentStep(savedProgress.current_step || 0);
          setLastSaved(new Date(savedProgress.updated_at));
        }
      } catch (error) {
        console.error('Failed to load onboarding progress:', error);
        setError('Failed to load your progress. You can continue with a fresh start.');
        setAutoSaveEnabled(false); // Disable auto-save if we can't load data
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [user?.id]);

  // Auto-save progress
  useEffect(() => {
    const autoSave = async () => {
      if (!user?.id || loading || !autoSaveEnabled) return;

      // Only auto-save if there's meaningful data
      const hasData = data.profile.fullName || 
                     Object.keys(data.services).length > 0 ||
                     data.goals.monthlyBudget !== 100;

      if (!hasData) return;

      setSaving(true);
      try {
        const updatedData = {
          ...data,
          progress: {
            ...data.progress,
            currentStep,
            lastSaved: new Date().toISOString(),
          },
        };

        await onboardingService.saveProgress(user.id, updatedData);
        setLastSaved(new Date());
        setData(updatedData);
        setError(null); // Clear any previous errors on successful save
      } catch (error) {
        console.error('Failed to auto-save progress:', error);
        setError('Failed to save your progress. Changes will be lost if you leave this page.');
        setAutoSaveEnabled(false); // Disable further auto-saves to avoid spam
      } finally {
        setSaving(false);
      }
    };

    // Debounce auto-save by 2 seconds
    const timeoutId = setTimeout(autoSave, 2000);
    return () => clearTimeout(timeoutId);
  }, [data, currentStep, user?.id, loading]);

  const updateData = (stepData: Partial<OnboardingData>) => {
    setData(prev => ({ 
      ...prev, 
      ...stepData,
      progress: {
        ...prev.progress,
        lastSaved: new Date().toISOString(),
      },
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      
      // Mark current step as completed
      const completedSteps = [...data.progress.completedSteps];
      const stepId = steps[currentStep].id;
      if (!completedSteps.includes(stepId)) {
        completedSteps.push(stepId);
        updateData({
          progress: {
            ...data.progress,
            completedSteps,
            currentStep: newStep,
          },
        });
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const finalData = {
        ...data,
        progress: {
          ...data.progress,
          isComplete: true,
          completedSteps: steps.map(s => s.id),
          currentStep: steps.length - 1,
        },
      };

      await onboardingService.completeOnboarding(user.id, finalData);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setError('Failed to complete onboarding. Please try again or contact support if the issue persists.');
    } finally {
      setSaving(false);
    }
  };

  const retryAutoSave = () => {
    setError(null);
    setAutoSaveEnabled(true);
  };

  const dismissError = () => {
    setError(null);
  };

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const StepComponent = steps[currentStep].component;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Error Notification */}
          {error && (
            <ErrorNotification
              error={error}
              onDismiss={dismissError}
              onRetry={error.includes('save') ? retryAutoSave : undefined}
              type={error.includes('load') ? 'warning' : 'error'}
            />
          )}

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Setup PromptNeutral
              </h2>
              <div className="flex items-center space-x-3">
                {saving && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Save className="w-4 h-4" />
                    <span className="text-sm">Saving...</span>
                  </div>
                )}
                {lastSaved && !saving && (
                  <span className="text-xs text-gray-500">
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                <span className="text-sm text-gray-600">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
            </div>
          
            <div className="flex items-center space-x-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        data.progress.completedSteps.includes(step.id)
                          ? 'bg-green-600 text-white'
                          : index === currentStep
                          ? 'bg-green-100 text-green-600 border-2 border-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {data.progress.completedSteps.includes(step.id) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={`ml-2 text-sm font-medium ${
                        index <= currentStep ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4 rounded ${
                        index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-8 transition-opacity duration-300">
              <StepComponent
                data={data}
                updateData={updateData}
                onNext={nextStep}
                onPrev={prevStep}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={prevStep}
              disabled={isFirstStep}
              className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                isFirstStep
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            <button
              onClick={isLastStep ? completeOnboarding : nextStep}
              disabled={saving}
              className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                saving
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  {isLastStep ? 'Completing...' : 'Saving...'}
                </>
              ) : (
                <>
                  {isLastStep ? 'Complete Setup' : 'Next'}
                  {!isLastStep && <ChevronRight className="w-4 h-4 ml-2" />}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};