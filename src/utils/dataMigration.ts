import { DatabaseService } from '../services/databaseService';
import { OpenAIApiService } from '../services/openaiApi';
import { SyncService } from '../services/syncService';
import { UsageReport } from '../types/usage';

export interface MigrationStatus {
  step: 'starting' | 'migrating_sample' | 'syncing_real' | 'completing' | 'completed' | 'error';
  progress: number;
  message: string;
  error?: string;
  details?: any;
}

export class DataMigrationService {
  private static instance: DataMigrationService;
  private databaseService: DatabaseService;
  private apiService: OpenAIApiService;
  private syncService: SyncService;

  private constructor() {
    this.databaseService = DatabaseService.getInstance();
    this.apiService = OpenAIApiService.getInstance();
    this.syncService = SyncService.getInstance();
  }

  static getInstance(): DataMigrationService {
    if (!DataMigrationService.instance) {
      DataMigrationService.instance = new DataMigrationService();
    }
    return DataMigrationService.instance;
  }

  /**
   * Migrate user from sample data to real data
   */
  async migrateUserData(
    userId: string,
    progressCallback?: (status: MigrationStatus) => void
  ): Promise<void> {
    const updateProgress = (status: MigrationStatus) => {
      console.log(`Migration Progress: ${status.step} - ${status.message} (${status.progress}%)`);
      progressCallback?.(status);
    };

    try {
      updateProgress({
        step: 'starting',
        progress: 0,
        message: 'Starting data migration process...'
      });

      // Step 1: Check if user already has real data
      const hasExistingData = await this.checkExistingData(userId);
      
      if (hasExistingData) {
        updateProgress({
          step: 'completed',
          progress: 100,
          message: 'User already has real data, migration not needed'
        });
        return;
      }

      // Skip sample data migration - go directly to real data sync

      // Step 3: Attempt to sync real data from OpenAI API
      updateProgress({
        step: 'syncing_real',
        progress: 40,
        message: 'Attempting to sync real data from OpenAI API...'
      });

      try {
        await this.syncRealData(userId);
        
        updateProgress({
          step: 'completing',
          progress: 90,
          message: 'Finalizing migration and setting up auto-sync...'
        });

        // Step 4: Set up automatic synchronization
        await this.setupAutoSync(userId);

        updateProgress({
          step: 'completed',
          progress: 100,
          message: 'Migration completed successfully! Your dashboard now uses real data.'
        });

      } catch (syncError) {
        // If real data sync fails, inform the user
        console.warn('Real data sync failed during migration:', syncError);
        
        updateProgress({
          step: 'error',
          progress: 0,
          message: 'Failed to sync data. Please connect your OpenAI API key to enable data sync.',
          error: syncError instanceof Error ? syncError.message : 'Unknown sync error'
        });
        throw syncError;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown migration error';
      console.error('Migration failed:', error);
      
      updateProgress({
        step: 'error',
        progress: 0,
        message: 'Migration failed',
        error: errorMessage
      });
      
      throw error;
    }
  }

  /**
   * Check if user already has data in the database
   */
  async checkExistingData(userId: string): Promise<boolean> {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      return await this.databaseService.hasDataForRange(userId, startDate, endDate);
    } catch (error) {
      console.error('Error checking existing data:', error);
      return false;
    }
  }


  /**
   * Sync real data from OpenAI API
   */
  async syncRealData(userId: string): Promise<void> {
    try {
      console.log('🔄 Syncing real data from OpenAI API...');
      
      // Test API connection first
      const isConnected = await this.apiService.testConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to OpenAI API. Please check your API key configuration.');
      }

      // Sync 30 days of data
      await this.apiService.syncDataToDatabase(userId, 30);
      
      console.log('✅ Real data sync completed');
    } catch (error) {
      console.error('Error syncing real data:', error);
      throw error;
    }
  }

  /**
   * Set up automatic synchronization for the user
   */
  async setupAutoSync(userId: string): Promise<void> {
    try {
      console.log('⚙️ Setting up automatic data synchronization...');
      
      // Start auto-sync with 1-hour intervals
      await this.syncService.startAutoSync(userId, 60);
      
      console.log('✅ Auto-sync setup completed');
    } catch (error) {
      console.error('Error setting up auto-sync:', error);
      // Don't throw here - auto-sync setup failure shouldn't fail the entire migration
    }
  }


  /**
   * Check migration status for a user
   */
  async getMigrationStatus(userId: string): Promise<{
    hasMigrated: boolean;
    hasRealData: boolean;
    hasSampleData: boolean;
    autoSyncEnabled: boolean;
    lastSyncTime: Date | null;
  }> {
    try {
      const [hasData, lastSyncTime, syncStatus] = await Promise.all([
        this.checkExistingData(userId),
        this.databaseService.getLastSyncTime(userId),
        this.syncService.getSyncStatus(userId),
      ]);

      return {
        hasMigrated: hasData,
        hasRealData: lastSyncTime !== null,
        hasSampleData: false,
        autoSyncEnabled: syncStatus.nextScheduledSync !== null,
        lastSyncTime,
      };
    } catch (error) {
      console.error('Error getting migration status:', error);
      return {
        hasMigrated: false,
        hasRealData: false,
        hasSampleData: false,
        autoSyncEnabled: false,
        lastSyncTime: null,
      };
    }
  }

  /**
   * Reset user data (for testing or re-migration)
   */
  async resetUserData(userId: string): Promise<void> {
    try {
      console.log('🗑️ Resetting user data...');
      
      // Stop auto-sync
      this.syncService.stopAutoSync(userId);
      
      // Clean up all data for user (effectively deletes everything)
      await this.databaseService.cleanupOldData(userId, 0);
      
      console.log('✅ User data reset completed');
    } catch (error) {
      console.error('Error resetting user data:', error);
      throw new Error(`Failed to reset user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export user data for backup
   */
  async exportUserData(userId: string): Promise<{
    usageData: UsageReport;
    metadata: {
      exportDate: string;
      userId: string;
      totalDays: number;
      dateRange: { start: string; end: string };
    };
  }> {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      const usageData = await this.databaseService.fetchUsageData(userId, startDate, endDate);
      const dates = Object.keys(usageData).sort();

      return {
        usageData,
        metadata: {
          exportDate: new Date().toISOString(),
          userId,
          totalDays: dates.length,
          dateRange: {
            start: dates[0] || startDate,
            end: dates[dates.length - 1] || endDate,
          },
        },
      };
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw new Error(`Failed to export user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Import user data from backup
   */
  async importUserData(
    userId: string, 
    exportData: { usageData: UsageReport; metadata: any },
    progressCallback?: (progress: number) => void
  ): Promise<void> {
    try {
      console.log('📥 Importing user data...');
      
      const { usageData } = exportData;
      const dates = Object.keys(usageData);
      let completed = 0;

      for (const [date, dayData] of Object.entries(usageData)) {
        if ('error' in dayData) continue;
        
        await this.databaseService.storeUsageData(userId, date, dayData);
        completed++;
        
        const progress = Math.round((completed / dates.length) * 100);
        progressCallback?.(progress);
      }

      console.log('✅ User data import completed');
    } catch (error) {
      console.error('Error importing user data:', error);
      throw new Error(`Failed to import user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}