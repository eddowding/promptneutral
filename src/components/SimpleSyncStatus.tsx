import React from 'react';
import { RefreshCw } from 'lucide-react';

interface SimpleSyncStatusProps {
  lastSyncTime: Date | null;
  onSync: () => Promise<void>;
  isLoading?: boolean;
}

export const SimpleSyncStatus: React.FC<SimpleSyncStatusProps> = ({ 
  lastSyncTime, 
  onSync,
  isLoading = false
}) => {
  const formatLastSync = (date: Date | null): string => {
    if (!date) return 'Never synced';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Updated just now';
    if (diffMinutes < 60) return `Updated ${diffMinutes}m ago`;
    if (diffHours < 24) return `Updated ${diffHours}h ago`;
    return `Updated ${diffDays}d ago`;
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500">{formatLastSync(lastSyncTime)}</span>
      <button
        onClick={onSync}
        disabled={isLoading}
        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
        Sync
      </button>
    </div>
  );
};