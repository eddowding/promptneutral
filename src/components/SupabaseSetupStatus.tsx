import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Settings, Copy, RefreshCw } from 'lucide-react';
import { 
  checkSupabaseConfig, 
  testSupabaseConnection, 
  getSupabaseSetupGuidance 
} from '../lib/supabase';

interface SupabaseSetupStatusProps {
  className?: string;
}

export const SupabaseSetupStatus: React.FC<SupabaseSetupStatusProps> = ({ 
  className = '' 
}) => {
  const [config, setConfig] = useState(checkSupabaseConfig());
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTest, setConnectionTest] = useState<{
    success: boolean;
    error?: string;
    tested: boolean;
  }>({ success: false, tested: false });
  const [showDetails, setShowDetails] = useState(!config.isConfigured);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const guidance = getSupabaseSetupGuidance();

  useEffect(() => {
    // Auto-test connection if configured
    if (config.isConfigured && !connectionTest.tested) {
      handleTestConnection();
    }
  }, [config.isConfigured]);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await testSupabaseConnection();
      setConnectionTest({
        success: result.success,
        error: result.error,
        tested: true
      });
    } catch (error) {
      setConnectionTest({
        success: false,
        error: 'Failed to test connection',
        tested: true
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleRefreshConfig = () => {
    setConfig(checkSupabaseConfig());
    setConnectionTest({ success: false, tested: false });
  };

  const handleCopyEnv = async () => {
    try {
      await navigator.clipboard.writeText(guidance.envExample);
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getStatusIcon = () => {
    if (!config.isConfigured) {
      return <AlertCircle className="w-5 h-5 text-orange-500" />;
    }
    
    if (!connectionTest.tested) {
      return <Settings className="w-5 h-5 text-blue-500" />;
    }
    
    if (connectionTest.success) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusText = () => {
    if (!config.isConfigured) {
      return 'Supabase not configured';
    }
    
    if (!connectionTest.tested) {
      return 'Supabase configured (testing connection...)';
    }
    
    if (connectionTest.success) {
      return 'Supabase connected successfully';
    }
    
    return 'Supabase connection failed';
  };

  const getStatusColor = () => {
    if (!config.isConfigured) {
      return 'border-l-orange-500 bg-orange-50';
    }
    
    if (!connectionTest.tested || isTestingConnection) {
      return 'border-l-blue-500 bg-blue-50';
    }
    
    if (connectionTest.success) {
      return 'border-l-green-500 bg-green-50';
    }
    
    return 'border-l-red-500 bg-red-50';
  };

  return (
    <div className={`border-l-4 p-4 ${getStatusColor()} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-800">
              {getStatusText()}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={handleRefreshConfig}
                className="text-gray-500 hover:text-gray-700 p-1"
                title="Refresh configuration"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showDetails ? 'Hide' : 'Show'} Details
              </button>
            </div>
          </div>

          {showDetails && (
            <div className="mt-4 space-y-4">
              {/* Configuration Status */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Configuration Status
                </h4>
                <div className="text-sm text-gray-600">
                  Status: <span className="font-medium">{config.status}</span>
                </div>
                {config.missingVars.length > 0 && (
                  <div className="text-sm text-red-600 mt-1">
                    Missing: {config.missingVars.join(', ')}
                  </div>
                )}
                {config.errors.length > 0 && (
                  <div className="text-sm text-red-600 mt-1">
                    Errors: {config.errors.join(', ')}
                  </div>
                )}
              </div>

              {/* Connection Test */}
              {config.isConfigured && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Connection Test
                    </h4>
                    <button
                      onClick={handleTestConnection}
                      disabled={isTestingConnection}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isTestingConnection ? 'Testing...' : 'Test Connection'}
                    </button>
                  </div>
                  {connectionTest.tested && (
                    <div className="text-sm">
                      {connectionTest.success ? (
                        <span className="text-green-600">✓ Connection successful</span>
                      ) : (
                        <span className="text-red-600">
                          ✗ Connection failed: {connectionTest.error}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Setup Instructions */}
              {!config.isConfigured && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Setup Instructions
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {guidance.steps.map((step, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-gray-400 mr-2">•</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Environment Variables Example */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Environment Variables (.env)
                      </span>
                      <button
                        onClick={handleCopyEnv}
                        className="flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        {copiedEnv ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <pre className="bg-gray-100 p-3 rounded text-xs text-gray-800 overflow-x-auto">
                      {guidance.envExample}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupabaseSetupStatus;