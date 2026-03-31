import { Equipment, SyncStatus } from '../types/Equipment';
import DatabaseService from './DatabaseService';
import MySQLService from './MySQLService';

interface SyncConfig {
  serverUrl: string;
  database: string;
  username: string;
  password: string;
}

class SyncService {
  private config: SyncConfig | null = null;
  private isOnline: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;

  setConfig(config: SyncConfig): void {
    this.config = config;
  }

  setOnlineStatus(online: boolean): void {
    this.isOnline = online;
    if (online) {
      this.startAutoSync();
      this.syncPendingOperations();
    } else {
      this.stopAutoSync();
    }
  }

  private startAutoSync(): void {
    if (this.syncInterval) return;
    
    // Sync every 5 minutes when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncPendingOperations();
      }
    }, 5 * 60 * 1000);
  }

  private stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncPendingOperations(): Promise<void> {
    if (!this.isOnline || !this.config) {
      console.log('Cannot sync: offline or no config');
      return;
    }

    try {
      const pendingOperations = await DatabaseService.getPendingSyncOperations();
      
      if (pendingOperations.length === 0) {
        console.log('No pending operations to sync');
        return;
      }

      console.log(`Syncing ${pendingOperations.length} pending operations`);

      for (const operation of pendingOperations) {
        try {
          await this.processSyncOperation(operation);
          await DatabaseService.clearSyncOperation(operation.id);
        } catch (error) {
          console.error(`Error processing sync operation ${operation.id}:`, error);
        }
      }

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Error during sync:', error);
    }
  }

  private async processSyncOperation(operation: any): Promise<void> {
    if (!this.config) throw new Error('No sync config');

    const { operation: opType, equipmentId, data } = operation;

    switch (opType) {
      case 'CREATE':
        await this.createEquipmentOnServer(data);
        await DatabaseService.markEquipmentAsSynced(equipmentId);
        break;
      
      case 'UPDATE':
        await this.updateEquipmentOnServer(data);
        await DatabaseService.markEquipmentAsSynced(equipmentId);
        break;
      
      case 'DELETE':
        await this.deleteEquipmentOnServer(equipmentId);
        break;
      
      default:
        throw new Error(`Unknown operation type: ${opType}`);
    }
  }

  private async createEquipmentOnServer(equipment: Equipment): Promise<void> {
    try {
      await MySQLService.createEquipment(equipment);
      console.log('Equipment created successfully on MySQL');
    } catch (error) {
      console.error('Error creating equipment on MySQL:', error);
      throw error;
    }
  }

  private async updateEquipmentOnServer(equipment: Equipment): Promise<void> {
    try {
      await MySQLService.updateEquipment(equipment);
      console.log('Equipment updated successfully on MySQL');
    } catch (error) {
      console.error('Error updating equipment on MySQL:', error);
      throw error;
    }
  }

  private async deleteEquipmentOnServer(equipmentId: number): Promise<void> {
    try {
      await MySQLService.deleteEquipment(equipmentId);
      console.log('Equipment deleted successfully on MySQL');
    } catch (error) {
      console.error('Error deleting equipment on MySQL:', error);
      throw error;
    }
  }

  // Method to manually trigger sync
  async manualSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }
    
    await this.syncPendingOperations();
  }

  // Method to check sync status
  async getSyncStatus(): Promise<{
    pendingOperations: number;
    lastSync: Date | null;
    isOnline: boolean;
  }> {
    const pendingOperations = await DatabaseService.getPendingSyncOperations();
    
    return {
      pendingOperations: pendingOperations.length,
      lastSync: pendingOperations.length > 0 ? 
        new Date(Math.max(...pendingOperations.map(op => op.timestamp.getTime()))) : 
        null,
      isOnline: this.isOnline
    };
  }

  // Cleanup method
  cleanup(): void {
    this.stopAutoSync();
  }
}

export default new SyncService();
