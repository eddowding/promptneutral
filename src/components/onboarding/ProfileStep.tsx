import React from 'react';
import { User, Building, Briefcase, Users } from 'lucide-react';
import { OnboardingData } from './OnboardingWizard';

interface ProfileStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const industries = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Media & Entertainment',
  'Non-profit',
  'Government',
  'Other',
];

const teamSizes = [
  { value: 'individual', label: 'Just me', description: 'Individual developer or researcher' },
  { value: 'small', label: '2-10 people', description: 'Small team or startup' },
  { value: 'medium', label: '11-50 people', description: 'Growing company' },
  { value: 'large', label: '51-200 people', description: 'Established company' },
  { value: 'enterprise', label: '200+ people', description: 'Large enterprise' },
];

export const ProfileStep: React.FC<ProfileStepProps> = ({
  data,
  updateData,
  onNext,
}) => {
  const updateProfile = (profile: Partial<OnboardingData['profile']>) => {
    updateData({
      profile: { ...data.profile, ...profile },
    });
  };

  const canContinue = data.profile.fullName && data.profile.company;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Tell us about yourself
        </h1>
        <p className="text-lg text-gray-600">
          Help us personalize your carbon tracking experience and provide relevant insights.
        </p>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={data.profile.fullName}
                onChange={(e) => updateProfile({ fullName: e.target.value })}
                placeholder="Enter your full name"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company *
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={data.profile.company}
                onChange={(e) => updateProfile({ company: e.target.value })}
                placeholder="Enter your company name"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={data.profile.role}
              onChange={(e) => updateProfile({ role: e.target.value })}
              placeholder="e.g., Software Engineer, Data Scientist, Product Manager"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry
          </label>
          <select
            value={data.profile.industry}
            onChange={(e) => updateProfile({ industry: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select your industry</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        {/* Team Size */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">
              Team Size
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamSizes.map((size) => (
              <button
                key={size.value}
                onClick={() => updateProfile({ teamSize: size.value as OnboardingData['profile']['teamSize'] })}
                className={`p-4 border rounded-xl text-left transition-colors ${
                  data.profile.teamSize === size.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-gray-900">{size.label}</div>
                <div className="text-sm text-gray-600 mt-1">{size.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Data Usage Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">How we use this information</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Customize carbon impact calculations for your industry</li>
            <li>• Provide relevant benchmarks and insights</li>
            <li>• Suggest appropriate carbon offset projects</li>
            <li>• Generate industry-specific reports</li>
          </ul>
          <p className="text-xs text-gray-500 mt-3">
            Your data is stored securely and never shared with third parties.
          </p>
        </div>

        {/* Continue Button */}
        <div className="text-center pt-4">
          <button
            onClick={onNext}
            disabled={!canContinue}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
              canContinue
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continue to Services
          </button>
          {!canContinue && (
            <p className="text-sm text-gray-500 mt-2">
              Please fill in the required fields to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};