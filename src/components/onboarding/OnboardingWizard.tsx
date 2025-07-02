import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { WelcomeStep } from './WelcomeStep';
import { ConnectServicesStep } from './ConnectServicesStep';
import { GoalsStep } from './GoalsStep';
import { ProjectsStep } from './ProjectsStep';
import { TourStep } from './TourStep';

export interface OnboardingData {
  services: {
    openai?: { apiKey: string; enabled: boolean };
    anthropic?: { apiKey: string; enabled: boolean };
    google?: { apiKey: string; enabled: boolean };
  };
  goals: {
    monthlyBudget: number;
    neutralityTarget: 'immediate' | 'weekly' | 'monthly';
    notifications: boolean;
  };
  project: {
    type: 'forest' | 'renewable' | 'direct-capture';
    projectId: string;
    name: string;
  };
}

const steps = [
  { id: 'welcome', title: 'Welcome', component: WelcomeStep },
  { id: 'services', title: 'Connect Services', component: ConnectServicesStep },
  { id: 'goals', title: 'Set Goals', component: GoalsStep },
  { id: 'projects', title: 'Choose Project', component: ProjectsStep },
  { id: 'tour', title: 'Dashboard Tour', component: TourStep },
];

export const OnboardingWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    services: {},
    goals: {
      monthlyBudget: 100,
      neutralityTarget: 'immediate',
      notifications: true,
    },
    project: {
      type: 'forest',
      projectId: '',
      name: '',
    },
  });

  const updateData = (stepData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...stepData }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const StepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Setup PromptNeutral
            </h2>
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      index < currentStep
                        ? 'bg-green-600 text-white'
                        : index === currentStep
                        ? 'bg-green-100 text-green-600 border-2 border-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {index < currentStep ? (
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
            onClick={nextStep}
            disabled={isLastStep}
            className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
              isLastStep
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isLastStep ? 'Complete Setup' : 'Next'}
            {!isLastStep && <ChevronRight className="w-4 h-4 ml-2" />}
          </button>
        </div>
      </div>
    </div>
  );
};