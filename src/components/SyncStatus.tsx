import React, { useState, useEffect } from 'react';
import { RefreshCw, Database, Clock, AlertCircle, CheckCircle, Wifi, WifiOff, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SyncService } from '../services/syncService';
import { DataMigrationService } from '../utils/dataMigration';

interface SyncStatusProps {
  lastSyncTime: Date | null;
  onSync: () => Promise<void>;
  className?: string;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ 
  lastSyncTime, 
  onSync, 
  className = '' 
}) => {
  const { user } = useAuth();
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    isRunning: false,
    error: null as string | null,
    nextScheduledSync: null as Date | null,
  });
  const [migrationStatus, setMigrationStatus] = useState({
    hasMigrated: false,
    hasRealData: false,
    autoSyncEnabled: false,
  });

  const syncService = SyncService.getInstance();
  const migrationService = DataMigrationService.getInstance();

  // Update sync status periodically
  useEffect(() => {
    if (!user) return;

    const updateStatus = async () => {
      const status = syncService.getSyncStatus(user.id);
      setSyncStatus({
        isRunning: status.isRunning,
        error: status.error,
        nextScheduledSync: status.nextScheduledSync,
      });

      const migration = await migrationService.getMigrationStatus(user.id);
      setMigrationStatus(migration);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [user?.id]);

  const handleManualSync = async () => {
    if (!user || isManualSyncing) return;

    try {
      setIsManualSyncing(true);
      await onSync();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsManualSyncing(false);
    }
  };

  const handleMigration = async () => {
    if (!user) return;

    try {
      await migrationService.migrateUserData(user.id, (status) => {
        console.log('Migration progress:', status);
      });
      
      // Refresh status after migration
      setTimeout(async () => {
        const migration = await migrationService.getMigrationStatus(user.id);
        setMigrationStatus(migration);
      }, 1000);
    } catch (error) {
      console.error('Migration failed:', error);
    }
  };

  const formatLastSync = (date: Date | null): string => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatNextSync = (date: Date | null): string => {
    if (!date) return 'Not scheduled';
    
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Any moment';
    if (diffMinutes < 60) return `In ${diffMinutes}m`;
    return `In ${Math.floor(diffMinutes / 60)}h`;
  };

  const getSyncIcon = () => {
    if (syncStatus.isRunning || isManualSyncing) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (syncStatus.error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (migrationStatus.hasRealData) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Database className="h-4 w-4 text-gray-500" />;
  };

  const getConnectionIcon = () => {
    if (migrationStatus.autoSyncEnabled) {
      return <Wifi className="h-4 w-4 text-green-500" />;
    }
    return <WifiOff className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getSyncIcon()}
          <h3 className="text-sm font-medium text-gray-900">Data Sync Status</h3>
          {getConnectionIcon()}
        </div>
        
        <button
          onClick={handleManualSync}
          disabled={syncStatus.isRunning || isManualSyncing}
          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${(syncStatus.isRunning || isManualSyncing) ? 'animate-spin' : ''}`} />
          Sync Now
        </button>
      </div>

      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Last sync:</span>
          <span className={lastSyncTime ? 'text-gray-900' : 'text-gray-400'}>
            {formatLastSync(lastSyncTime)}
          </span>
        </div>

        {migrationStatus.autoSyncEnabled && (
          <div className="flex justify-between">
            <span>Next sync:</span>
            <span className="text-gray-900">
              {formatNextSync(syncStatus.nextScheduledSync)}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Data source:</span>
          <span className={migrationStatus.hasRealData ? 'text-green-600' : 'text-orange-600'}>
            {migrationStatus.hasRealData ? 'Real data' : 'Sample data'}
          </span>
        </div>

        {syncStatus.error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-3 w-3 text-red-500 mr-1" />
              <span className="text-red-700 text-xs">Sync error:</span>
            </div>
            <p className="text-red-600 text-xs mt-1">{syncStatus.error}</p>
          </div>
        )}
      </div>

      {!migrationStatus.hasMigrated && user && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={handleMigration}
            className="w-full inline-flex items-center justify-center px-3 py-2 border border-blue-300 shadow-sm text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Database className="h-3 w-3 mr-1" />
            Set up real-time data
          </button>
        </div>
      )}
    </div>
  );
};