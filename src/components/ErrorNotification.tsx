import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

interface ErrorNotificationProps {
  error: string;
  onDismiss: () => void;
  onRetry?: () => void;
  type?: 'error' | 'warning';
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  onDismiss,
  onRetry,
  type = 'error',
}) => {
  const bgColor = type === 'error' ? 'bg-red-50' : 'bg-yellow-50';
  const borderColor = type === 'error' ? 'border-red-200' : 'border-yellow-200';
  const textColor = type === 'error' ? 'text-red-700' : 'text-yellow-700';
  const iconColor = type === 'error' ? 'text-red-600' : 'text-yellow-600';

  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-4 mb-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <AlertCircle className={`w-5 h-5 ${iconColor} mt-0.5 flex-shrink-0`} />
          <div className="flex-1">
            <h3 className={`text-sm font-medium ${textColor}`}>
              {type === 'error' ? 'Error' : 'Warning'}
            </h3>
            <p className={`text-sm ${textColor} mt-1`}>
              {error}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className={`mt-3 inline-flex items-center space-x-2 text-sm ${textColor} hover:${textColor.replace('700', '800')} font-medium`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            )}
          </div>
        </div>
        <button
          onClick={onDismiss}
          className={`${textColor} hover:${textColor.replace('700', '800')} ml-4`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};