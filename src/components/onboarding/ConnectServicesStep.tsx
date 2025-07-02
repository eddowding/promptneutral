import React, { useState } from 'react';
import { Eye, EyeOff, ExternalLink, Check, AlertCircle, X, RefreshCw } from 'lucide-react';
import { OnboardingData } from './OnboardingWizard';
import { ApiValidationService, ValidationResult } from '../../services/apiValidation';

interface ConnectServicesStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface ServiceConfig {
  id: keyof OnboardingData['services'];
  name: string;
  description: string;
  logo: string;
  docsUrl: string;
  placeholder: string;
}

const services: ServiceConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5, DALL-E, and other OpenAI models',
    logo: '🤖',
    docsUrl: 'https://platform.openai.com/api-keys',
    placeholder: 'sk-...',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3, Claude 2, and other Anthropic models',
    logo: '🧠',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    placeholder: 'sk-ant-...',
  },
  {
    id: 'google',
    name: 'Google AI',
    description: 'Gemini, PaLM, and other Google AI models',
    logo: '🔍',
    docsUrl: 'https://makersuite.google.com/app/apikey',
    placeholder: 'AIza...',
  },
];

export const ConnectServicesStep: React.FC<ConnectServicesStepProps> = ({
  data,
  updateData,
  onNext,
}) => {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [validating, setValidating] = useState<Record<string, boolean>>({});
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const toggleKeyVisibility = (serviceId: string) => {
    setShowKeys(prev => ({ ...prev, [serviceId]: !prev[serviceId] }));
  };

  const updateServiceKey = (serviceId: keyof OnboardingData['services'], apiKey: string) => {
    // Clear previous validation results when key changes
    setValidationResults(prev => {
      const newResults = { ...prev };
      delete newResults[serviceId];
      return newResults;
    });
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[serviceId];
      return newErrors;
    });

    updateData({
      services: {
        ...data.services,
        [serviceId]: {
          apiKey,
          enabled: apiKey.length > 0,
          validated: false,
        },
      },
    });
  };

  const validateKey = async (serviceId: keyof OnboardingData['services']) => {
    const apiKey = data.services[serviceId]?.apiKey;
    if (!apiKey) return;

    setValidating(prev => ({ ...prev, [serviceId]: true }));
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[serviceId];
      return newErrors;
    });
    
    try {
      const result = await ApiValidationService.validateApiKey(serviceId, apiKey);
      
      setValidationResults(prev => ({ ...prev, [serviceId]: result }));
      
      if (result.isValid) {
        // Update the service data with validation success
        updateData({
          services: {
            ...data.services,
            [serviceId]: {
              ...data.services[serviceId]!,
              validated: true,
            },
          },
        });
      } else {
        setValidationErrors(prev => ({ 
          ...prev, 
          [serviceId]: result.error || 'Validation failed' 
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation failed';
      setValidationErrors(prev => ({ ...prev, [serviceId]: errorMessage }));
      setValidationResults(prev => ({ 
        ...prev, 
        [serviceId]: { isValid: false, error: errorMessage } 
      }));
    } finally {
      setValidating(prev => ({ ...prev, [serviceId]: false }));
    }
  };

  const validateAllKeys = async () => {
    const servicesToValidate = Object.entries(data.services)
      .filter(([_, config]) => config?.apiKey && config.apiKey.length > 0)
      .reduce((acc, [service, config]) => ({ 
        ...acc, 
        [service]: { apiKey: config.apiKey } 
      }), {});

    if (Object.keys(servicesToValidate).length === 0) return;

    // Set all as validating
    setValidating(prev => 
      Object.keys(servicesToValidate).reduce((acc, service) => ({ 
        ...acc, 
        [service]: true 
      }), prev)
    );

    try {
      const results = await ApiValidationService.validateMultiple(servicesToValidate);
      
      setValidationResults(prev => ({ ...prev, ...results }));
      
      // Update service data with validation results
      const updatedServices = { ...data.services };
      Object.entries(results).forEach(([service, result]) => {
        if (updatedServices[service as keyof OnboardingData['services']]) {
          updatedServices[service as keyof OnboardingData['services']] = {
            ...updatedServices[service as keyof OnboardingData['services']]!,
            validated: result.isValid,
          };
        }
      });

      updateData({ services: updatedServices });

      // Set errors for failed validations
      const errors: Record<string, string> = {};
      Object.entries(results).forEach(([service, result]) => {
        if (!result.isValid) {
          errors[service] = result.error || 'Validation failed';
        }
      });
      setValidationErrors(errors);

    } catch (error) {
      console.error('Batch validation failed:', error);
    } finally {
      // Clear validating state
      setValidating(prev => 
        Object.keys(servicesToValidate).reduce((acc, service) => ({ 
          ...acc, 
          [service]: false 
        }), prev)
      );
    }
  };

  const hasConnectedServices = Object.values(data.services).some(service => service?.enabled);
  const canContinue = hasConnectedServices;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Connect Your AI Services
        </h1>
        <p className="text-lg text-gray-600">
          Add your API keys to start monitoring carbon emissions. Your keys are encrypted and stored securely.
        </p>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Your data is secure</h3>
            <p className="text-sm text-blue-700">
              API keys are encrypted with AES-256 and stored in SOC 2 compliant infrastructure. 
              We only use read-only access to monitor usage - never to make API calls.
            </p>
          </div>
        </div>
      </div>

      {/* Service Connections */}
      <div className="space-y-6 mb-8">
        {services.map((service) => {
          const serviceConfig = data.services[service.id];
          const isConnected = serviceConfig?.enabled;
          const apiKey = serviceConfig?.apiKey || '';
          const isValidating = validating[service.id];
          const isValidated = serviceConfig?.validated;
          const validationResult = validationResults[service.id];
          const validationError = validationErrors[service.id];

          return (
            <div
              key={service.id}
              className={`border rounded-xl p-6 transition-colors ${
                isValidated
                  ? 'border-green-200 bg-green-50'
                  : validationError
                  ? 'border-red-200 bg-red-50'
                  : isConnected
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{service.logo}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                </div>
                {isValidated ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-medium">Validated</span>
                  </div>
                ) : validationError ? (
                  <div className="flex items-center space-x-2 text-red-600">
                    <X className="w-5 h-5" />
                    <span className="text-sm font-medium">Invalid</span>
                  </div>
                ) : isConnected ? (
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Needs Validation</span>
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showKeys[service.id] ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => updateServiceKey(service.id, e.target.value)}
                      placeholder={service.placeholder}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-24"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                      {apiKey && (
                        <button
                          onClick={() => validateKey(service.id)}
                          disabled={isValidating}
                          className={`px-3 py-1 text-xs font-medium rounded flex items-center space-x-1 ${
                            isValidated
                              ? 'bg-green-100 text-green-700'
                              : validationError
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          } disabled:opacity-50 transition-colors`}
                        >
                          {isValidating ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Testing...</span>
                            </>
                          ) : isValidated ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Valid</span>
                            </>
                          ) : validationError ? (
                            <>
                              <X className="w-3 h-3" />
                              <span>Retry</span>
                            </>
                          ) : (
                            <span>Test</span>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => toggleKeyVisibility(service.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {showKeys[service.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <a
                    href={service.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                  >
                    <span>Get API key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {apiKey && (
                    <span className="text-gray-500">
                      {apiKey.length} characters
                    </span>
                  )}
                </div>

                {/* Validation Error Display */}
                {validationError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-red-700 font-medium">Validation Failed</p>
                        <p className="text-xs text-red-600 mt-1">{validationError}</p>
                        <p className="text-xs text-red-500 mt-2">
                          {ApiValidationService.getValidationSuggestion(service.id, validationError)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Validation Success Details */}
                {isValidated && validationResult?.details && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-green-700 font-medium">API Key Validated</p>
                        <div className="text-xs text-green-600 mt-1">
                          {service.id === 'openai' && validationResult.details.modelCount && (
                            <p>Access to {validationResult.details.modelCount} models{
                              validationResult.details.hasGPT4 ? ' (including GPT-4)' : ''
                            }</p>
                          )}
                          {service.id === 'google' && validationResult.details.modelCount && (
                            <p>Access to {validationResult.details.modelCount} models{
                              validationResult.details.hasGemini ? ' (including Gemini)' : ''
                            }</p>
                          )}
                          {service.id === 'anthropic' && validationResult.details.hasAccess && (
                            <p>API access confirmed</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Validate All Button */}
      {hasConnectedServices && (
        <div className="mb-6">
          <button
            onClick={validateAllKeys}
            disabled={Object.values(validating).some(v => v)}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {Object.values(validating).some(v => v) ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Validating API Keys...</span>
              </>
            ) : (
              <span>Validate All API Keys</span>
            )}
          </button>
        </div>
      )}

      {/* Skip Option */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-600 text-center">
          You can skip this step and add services later from your dashboard settings.
        </p>
      </div>

      {/* Continue Button */}
      <div className="text-center">
        <button
          onClick={onNext}
          disabled={!canContinue}
          className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
            canContinue
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {hasConnectedServices ? 'Continue' : 'Skip for Now'}
        </button>
        {hasConnectedServices && (
          <p className="text-sm text-gray-500 mt-2">
            {Object.values(data.services).filter(s => s?.enabled).length} service(s) connected
          </p>
        )}
      </div>
    </div>
  );
};