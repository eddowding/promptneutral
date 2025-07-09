import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Key, User, Globe, Bell, Shield, Save, Plus, Edit, Trash2, Eye, EyeOff, Check, X, AlertCircle, Download, RefreshCw } from 'lucide-react';
import { ApiValidationService, ValidationResult } from '../services/apiValidation';
import { settingsService } from '../lib/supabase';
import { fetchAndStoreUsageData } from '../services/adminApiService';

interface ApiKeyData {
  id: string;
  service: string;
  encrypted_key: string;
  enabled: boolean;
  validated: boolean;
  last_validated?: string;
  created_at: string;
}

interface UserProfile {
  full_name: string;
  company: string;
  role: string;
  industry: string;
  team_size: string;
}

interface UserPreferences {
  demo_mode: boolean;
  timezone: string;
  currency: string;
  monthly_budget: number;
  neutrality_target: string;
  notifications: boolean;
  carbon_reduction_goal: number;
  reporting_frequency: string;
}

const services = [
  { id: 'openai_admin', name: 'OpenAI Admin', logo: '🔐', placeholder: 'sk-admin-vfH0WZAvKTfYIOohGUQalbEE... (Admin key with Usage permissions)' },
  { id: 'anthropic', name: 'Anthropic', logo: '🧠', placeholder: 'sk-ant-...' },
  { id: 'google', name: 'Google AI', logo: '🔍', placeholder: 'AIza...' },
];

export const SettingsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Debug logging
  React.useEffect(() => {
    console.log('SettingsPage render - user:', user);
    console.log('SettingsPage render - isAuthenticated:', isAuthenticated);
  }, [user, isAuthenticated]);
  const [activeTab, setActiveTab] = useState<'profile' | 'api-keys' | 'preferences' | 'security'>('api-keys');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    company: '',
    role: '',
    industry: '',
    team_size: 'small',
  });
  const [preferences, setPreferences] = useState<UserPreferences>({
    demo_mode: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    currency: 'USD',
    monthly_budget: 100,
    neutrality_target: 'immediate',
    notifications: true,
    carbon_reduction_goal: 25,
    reporting_frequency: 'monthly',
  });

  // API Key management state
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newKeyValues, setNewKeyValues] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [validating, setValidating] = useState<Record<string, boolean>>({});
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id]);

  const loadUserData = async () => {
    if (!user?.id) {
      console.error('No user ID available for loading data');
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      console.log('Loading user data for user ID:', user.id);
      
      const [keysData, profileData, preferencesData] = await Promise.allSettled([
        settingsService.getUserApiKeys(user.id),
        settingsService.getUserProfile(user.id),
        settingsService.getUserPreferences(user.id),
      ]);

      // Handle API keys
      if (keysData.status === 'fulfilled') {
        console.log('API keys loaded successfully:', keysData.value);
        setApiKeys(keysData.value || []);
      } else {
        console.error('Failed to load API keys:', keysData.reason);
      }

      // Handle profile
      if (profileData.status === 'fulfilled') {
        console.log('Profile loaded successfully:', profileData.value);
        if (profileData.value) setProfile(profileData.value);
      } else {
        console.error('Failed to load profile:', profileData.reason);
      }

      // Handle preferences
      if (preferencesData.status === 'fulfilled') {
        console.log('Preferences loaded successfully:', preferencesData.value);
        if (preferencesData.value) setPreferences(preferencesData.value);
      } else {
        console.error('Failed to load preferences:', preferencesData.reason);
      }

      // Show error only if all requests failed
      if (keysData.status === 'rejected' && profileData.status === 'rejected' && preferencesData.status === 'rejected') {
        setError('Failed to load settings');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      await settingsService.updateUserProfile(user.id, profile);
      setSuccess('Profile updated successfully');
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      await settingsService.updateUserPreferences(user.id, preferences);
      setSuccess('Preferences updated successfully');
    } catch (error) {
      setError('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleAddApiKey = async (service: string, apiKey: string) => {
    if (!user?.id) {
      console.error('No user ID available for API key addition');
      setError('User not authenticated');
      return;
    }

    try {
      setSaving(true);
      setValidating(prev => ({ ...prev, [service]: true }));
      console.log(`Adding ${service} API key for user:`, user.id);

      // Validate the key first
      console.log(`Validating ${service} API key...`);
      const result = await ApiValidationService.validateApiKey(service, apiKey);
      console.log(`Validation result for ${service}:`, result);
      
      if (!result.isValid) {
        console.error(`API key validation failed for ${service}:`, result.error);
        setError(result.error || 'API key validation failed');
        return;
      }

      // Save to database
      console.log(`Saving ${service} API key to database...`);
      await settingsService.saveApiKey(user.id, service, apiKey, true);
      console.log(`Successfully saved ${service} API key to database`);
      
      // Clear config cache to force reload
      console.log('Clearing config cache...');
      const { ConfigService } = await import('../services/config');
      ConfigService.getInstance().clearCache();
      
      // Reload API keys
      console.log('Reloading user data...');
      await loadUserData();
      
      setNewKeyValues(prev => ({ ...prev, [service]: '' }));
      setEditingKey(null);
      setSuccess(`${service} API key added successfully`);
    } catch (error) {
      console.error(`Error adding ${service} API key:`, error);
      setError(`Failed to add API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
      setValidating(prev => ({ ...prev, [service]: false }));
    }
  };

  const handleUpdateApiKey = async (keyId: string, service: string, apiKey: string) => {
    if (!user?.id) return;

    try {
      setSaving(true);
      setValidating(prev => ({ ...prev, [service]: true }));

      // Validate the key first
      const result = await ApiValidationService.validateApiKey(service, apiKey);
      
      if (!result.isValid) {
        setError(result.error || 'API key validation failed');
        return;
      }

      // Update in database
      await settingsService.updateApiKey(keyId, apiKey, true);
      
      // Reload API keys
      await loadUserData();
      
      setNewKeyValues(prev => ({ ...prev, [service]: '' }));
      setEditingKey(null);
      setSuccess(`${service} API key updated successfully`);
    } catch (error) {
      setError('Failed to update API key');
    } finally {
      setSaving(false);
      setValidating(prev => ({ ...prev, [service]: false }));
    }
  };

  const handleDeleteApiKey = async (keyId: string, service: string) => {
    if (!user?.id || !confirm(`Delete ${service} API key?`)) return;

    try {
      setSaving(true);
      await settingsService.deleteApiKey(keyId);
      await loadUserData();
      setSuccess(`${service} API key deleted successfully`);
    } catch (error) {
      setError('Failed to delete API key');
    } finally {
      setSaving(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleFetchUsageData = async (forceRefresh: boolean = false) => {
    if (!user?.id) return;

    try {
      setFetchingData(true);
      clearMessages();
      
      const result = await fetchAndStoreUsageData(user.id, forceRefresh);
      
      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to fetch usage data');
    } finally {
      setFetchingData(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and API integrations</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
            <button onClick={clearMessages} className="text-red-600 hover:text-red-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-green-700">{success}</span>
            </div>
            <button onClick={clearMessages} className="text-green-600 hover:text-green-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('api-keys')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'api-keys'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  <span>API Keys</span>
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'preferences'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>Preferences</span>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'security'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Security</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'api-keys' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">API Keys</h2>
                <p className="text-gray-600 mb-6">
                  Manage your AI service API keys. Keys are encrypted and stored securely.
                </p>

                {/* OpenAI Admin Key Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                    <span className="text-xl mr-2">🤖</span>
                    How to get your OpenAI Admin Key for Usage Data
                  </h3>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p className="font-medium">To access your complete usage history, you need an Admin Key with Usage permissions:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>Go to <strong>Settings</strong> → <strong>Organization</strong> → <strong>API Keys</strong></li>
                      <li>Click <strong>Create new secret key</strong></li>
                      <li>Select <strong>Restricted</strong> key type</li>
                      <li>Toggle <strong>everything to None</strong> except <strong>"Usage"</strong></li>
                      <li>Copy the key immediately (you can only see it once)</li>
                      <li>Paste it below and save</li>
                    </ol>
                    <p className="text-xs text-blue-600 mt-3">
                      💡 This key only has Usage permissions and can be revoked anytime from your OpenAI dashboard.
                    </p>
                  </div>
                </div>

                {/* Usage Data Fetching Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Download className="w-5 h-5 mr-2" />
                    Fetch Usage Data
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Use your OpenAI Admin key to fetch complete usage history from all endpoints.
                  </p>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleFetchUsageData(false)}
                      disabled={fetchingData || !apiKeys.find(k => k.service === 'openai_admin')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {fetchingData ? (
                        <>
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          <span>Fetching...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Fetch New Data</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleFetchUsageData(true)}
                      disabled={fetchingData || !apiKeys.find(k => k.service === 'openai_admin')}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Force Refresh</span>
                    </button>
                  </div>
                  {!apiKeys.find(k => k.service === 'openai_admin') && (
                    <p className="text-sm text-amber-600 mt-2">
                      ⚠️ Add an OpenAI Admin key above to fetch usage data
                    </p>
                  )}
                </div>

                <div className="space-y-6">
                  {services.map((service) => {
                    const existingKey = apiKeys.find(k => k.service === service.id);
                    const isEditing = editingKey === service.id;
                    const newValue = newKeyValues[service.id] || '';

                    return (
                      <div key={service.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{service.logo}</span>
                            <div>
                              <h3 className="font-medium text-gray-900">{service.name}</h3>
                              {existingKey && (
                                <p className="text-sm text-gray-500">
                                  Added {new Date(existingKey.created_at).toLocaleDateString()}
                                  {existingKey.validated && (
                                    <span className="ml-2 text-green-600">✓ Validated</span>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {existingKey && !isEditing && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingKey(service.id);
                                    setNewKeyValues(prev => ({ ...prev, [service.id]: '' }));
                                  }}
                                  className="p-2 text-gray-400 hover:text-gray-600"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteApiKey(existingKey.id, service.name)}
                                  className="p-2 text-red-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {(!existingKey || isEditing) && (
                          <div className="space-y-3">
                            <div className="relative">
                              <input
                                type={showKeys[service.id] ? 'text' : 'password'}
                                value={newValue}
                                onChange={(e) => setNewKeyValues(prev => ({ ...prev, [service.id]: e.target.value }))}
                                placeholder={service.placeholder}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-16"
                              />
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                                <button
                                  onClick={() => setShowKeys(prev => ({ ...prev, [service.id]: !prev[service.id] }))}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  {showKeys[service.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => {
                                  if (existingKey) {
                                    handleUpdateApiKey(existingKey.id, service.id, newValue);
                                  } else {
                                    handleAddApiKey(service.id, newValue);
                                  }
                                }}
                                disabled={!newValue || validating[service.id] || saving}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                              >
                                {validating[service.id] ? (
                                  <>
                                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    <span>Validating...</span>
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-4 h-4" />
                                    <span>{existingKey ? 'Update' : 'Add'} Key</span>
                                  </>
                                )}
                              </button>
                              {isEditing && (
                                <button
                                  onClick={() => {
                                    setEditingKey(null);
                                    setNewKeyValues(prev => ({ ...prev, [service.id]: '' }));
                                  }}
                                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {existingKey && !isEditing && (
                          <div className="text-sm text-gray-500">
                            Key ending in ...{existingKey.encrypted_key.slice(-4)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profile.full_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                    <input
                      type="text"
                      value={profile.company}
                      onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <input
                      type="text"
                      value={profile.role}
                      onChange={(e) => setProfile(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                    <input
                      type="text"
                      value={profile.industry}
                      onChange={(e) => setProfile(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Profile</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferences</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <select
                        value={preferences.currency}
                        onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Budget</label>
                      <input
                        type="number"
                        value={preferences.monthly_budget}
                        onChange={(e) => setPreferences(prev => ({ ...prev, monthly_budget: Number(e.target.value) }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={preferences.notifications}
                        onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Enable notifications</span>
                    </label>
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={handleSavePreferences}
                      disabled={saving}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Preferences</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Security</h2>
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-green-600" />
                      <div>
                        <h3 className="font-medium text-green-900">Enhanced Encryption</h3>
                        <p className="text-sm text-green-700 mt-1">
                          Your API keys are now encrypted using AES-256 encryption with user-specific salt keys.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Data Protection</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• API keys encrypted with AES-256</li>
                      <li>• Row-level security on all database tables</li>
                      <li>• Regular security audits and monitoring</li>
                      <li>• SOC 2 Type II compliant infrastructure</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};