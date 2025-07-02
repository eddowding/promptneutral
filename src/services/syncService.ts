import { OpenAIApiService } from './openaiApi';
import { DatabaseService } from './databaseService';

export interface SyncStatus {
  lastSyncTime: Date | null;
  isRunning: boolean;
  error: string | null;
  nextScheduledSync: Date | null;
}

export class SyncService {
  private static instance: SyncService;
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();
  private syncStatus: Map<string, SyncStatus> = new Map();
  private apiService: OpenAIApiService;
  private databaseService: DatabaseService;

  private constructor() {
    this.apiService = OpenAIApiService.getInstance();
    this.databaseService = DatabaseService.getInstance();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Start automatic data synchronization for a user
   */
  async startAutoSync(userId: string, intervalMinutes: number = 60): Promise<void> {
    console.log(`🔄 Starting auto-sync for user ${userId} every ${intervalMinutes} minutes`);

    // Clear any existing sync for this user
    this.stopAutoSync(userId);

    // Initialize sync status
    this.syncStatus.set(userId, {
      lastSyncTime: await this.databaseService.getLastSyncTime(userId),
      isRunning: false,
      error: null,
      nextScheduledSync: new Date(Date.now() + intervalMinutes * 60 * 1000),
    });

    // Run initial sync
    await this.performSync(userId);

    // Set up recurring sync
    const intervalId = setInterval(async () => {
      await this.performSync(userId);
    }, intervalMinutes * 60 * 1000);

    this.syncIntervals.set(userId, intervalId);
  }

  /**
   * Stop automatic synchronization for a user
   */
  stopAutoSync(userId: string): void {
    const intervalId = this.syncIntervals.get(userId);
    if (intervalId) {
      clearInterval(intervalId);
      this.syncIntervals.delete(userId);
      console.log(`⏹️ Stopped auto-sync for user ${userId}`);
    }

    // Update status
    const status = this.syncStatus.get(userId);
    if (status) {
      this.syncStatus.set(userId, {
        ...status,
        nextScheduledSync: null,
      });
    }
  }

  /**
   * Perform a manual sync for a user
   */
  async performSync(userId: string): Promise<void> {
    const status = this.syncStatus.get(userId) || {
      lastSyncTime: null,
      isRunning: false,
      error: null,
      nextScheduledSync: null,
    };

    if (status.isRunning) {
      console.log(`⏳ Sync already running for user ${userId}, skipping`);
      return;
    }

    try {
      // Update status to running
      this.syncStatus.set(userId, {
        ...status,
        isRunning: true,
        error: null,
      });

      console.log(`🔄 Starting sync for user ${userId}`);

      // Determine how many days to sync based on last sync time
      const daysSinceLastSync = this.getDaysSinceLastSync(status.lastSyncTime);
      const daysToSync = Math.min(Math.max(daysSinceLastSync, 1), 30); // At least 1 day, max 30 days

      console.log(`📅 Syncing ${daysToSync} days of data`);

      // Perform the sync
      await this.apiService.syncDataToDatabase(userId, daysToSync);

      // Update status with success
      const newLastSyncTime = new Date();
      this.syncStatus.set(userId, {
        lastSyncTime: newLastSyncTime,
        isRunning: false,
        error: null,
        nextScheduledSync: this.getNextSyncTime(userId),
      });

      console.log(`✅ Sync completed successfully for user ${userId}`);

      // Clean up old data (keep only last 90 days)
      await this.databaseService.cleanupOldData(userId, 90);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      console.error(`❌ Sync failed for user ${userId}:`, errorMessage);

      // Update status with error
      this.syncStatus.set(userId, {
        ...status,
        isRunning: false,
        error: errorMessage,
        nextScheduledSync: this.getNextSyncTime(userId),
      });
    }
  }

  /**
   * Get sync status for a user
   */
  getSyncStatus(userId: string): SyncStatus {
    return this.syncStatus.get(userId) || {
      lastSyncTime: null,
      isRunning: false,
      error: null,
      nextScheduledSync: null,
    };
  }

  /**
   * Check if a user should be synced (based on last sync time)
   */
  shouldSync(userId: string, maxHoursSinceLastSync: number = 4): boolean {
    const status = this.getSyncStatus(userId);
    
    if (!status.lastSyncTime) {
      return true; // Never synced before
    }

    const hoursSinceLastSync = (Date.now() - status.lastSyncTime.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastSync >= maxHoursSinceLastSync;
  }

  /**
   * Start sync for all active users
   */
  async startSyncForAllUsers(userIds: string[], intervalMinutes: number = 60): Promise<void> {
    console.log(`🌐 Starting auto-sync for ${userIds.length} users`);
    
    for (const userId of userIds) {
      try {
        await this.startAutoSync(userId, intervalMinutes);
        // Stagger the syncs to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(`Failed to start sync for user ${userId}:`, error);
      }
    }
  }

  /**
   * Stop sync for all users
   */
  stopSyncForAllUsers(): void {
    console.log('🛑 Stopping all auto-sync operations');
    
    for (const userId of this.syncIntervals.keys()) {
      this.stopAutoSync(userId);
    }
  }

  /**
   * Get statistics about sync operations
   */
  getSyncStatistics(): {
    activeUsers: number;
    totalSyncs: number;
    errorCount: number;
    averageLastSyncAge: number;
  } {
    const statuses = Array.from(this.syncStatus.values());
    const activeUsers = this.syncIntervals.size;
    const totalSyncs = statuses.filter(s => s.lastSyncTime).length;
    const errorCount = statuses.filter(s => s.error).length;
    
    const syncAges = statuses
      .filter(s => s.lastSyncTime)
      .map(s => Date.now() - s.lastSyncTime!.getTime());
    
    const averageLastSyncAge = syncAges.length > 0 
      ? syncAges.reduce((sum, age) => sum + age, 0) / syncAges.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    return {
      activeUsers,
      totalSyncs,
      errorCount,
      averageLastSyncAge,
    };
  }

  /**
   * Force sync for a user if they haven't synced recently
   */
  async ensureRecentSync(userId: string, maxHoursSinceLastSync: number = 4): Promise<boolean> {
    if (this.shouldSync(userId, maxHoursSinceLastSync)) {
      console.log(`🔄 User ${userId} needs sync (last sync was > ${maxHoursSinceLastSync}h ago)`);
      await this.performSync(userId);
      return true;
    }
    return false;
  }

  /**
   * Calculate days since last sync
   */
  private getDaysSinceLastSync(lastSyncTime: Date | null): number {
    if (!lastSyncTime) {
      return 7; // Default to 7 days for first sync
    }

    const daysSince = Math.ceil((Date.now() - lastSyncTime.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(daysSince, 1);
  }

  /**
   * Get next scheduled sync time
   */
  private getNextSyncTime(userId: string): Date | null {
    const intervalId = this.syncIntervals.get(userId);
    if (!intervalId) {
      return null;
    }

    // Estimate next sync (this is approximate since we don't have direct access to the interval timing)
    return new Date(Date.now() + 60 * 60 * 1000); // Assume 60 minutes for now
  }
}