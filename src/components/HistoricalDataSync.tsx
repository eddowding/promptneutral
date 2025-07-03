import React, { useState, useEffect } from 'react';
import { Cloud, Check, Loader2 } from 'lucide-react';

interface HistoricalDataSyncProps {
  isActive: boolean;
  onComplete?: () => void;
}

export const HistoricalDataSync: React.FC<HistoricalDataSyncProps> = ({ 
  isActive, 
  onComplete 
}) => {
  const [progress, setProgress] = useState({ fetched: 0, total: 0 });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    // Listen for progress updates from background sync
    const handleProgress = (event: CustomEvent) => {
      const { found, total } = event.detail;
      setProgress({ fetched: found, total });
    };

    window.addEventListener('historicalDataProgress' as any, handleProgress as any);

    return () => {
      window.removeEventListener('historicalDataProgress' as any, handleProgress as any);
    };
  }, [isActive]);

  useEffect(() => {
    if (progress.total > 0 && progress.fetched === progress.total) {
      setIsComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [progress, onComplete]);

  if (!isActive && !isComplete) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
      <div className="flex items-center space-x-3">
        {isComplete ? (
          <>
            <Check className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Historical data synced</p>
              <p className="text-xs text-gray-500">
                {progress.total} days of data available
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="relative">
              <Cloud className="w-5 h-5 text-blue-600" />
              <Loader2 className="w-5 h-5 text-blue-600 absolute inset-0 animate-spin" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Syncing historical data...</p>
              <p className="text-xs text-gray-500">
                {progress.fetched > 0 
                  ? `Found ${progress.fetched} days so far`
                  : 'Searching for available data'
                }
              </p>
            </div>
          </>
        )}
      </div>
      
      {!isComplete && progress.total > 0 && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(progress.fetched / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};