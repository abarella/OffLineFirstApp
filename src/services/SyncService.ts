import { Equipment, SyncStatus } from '../types/Equipment';
import DatabaseService from './DatabaseService';
import ApiService from './ApiService';

const isApiNotFoundError = (message: string): boolean =>
  /\b404\b|nao encontrado|não encontrado|not found/i.test(message);

class SyncService {
  private isOnline: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;

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
    if (!this.isOnline) {
      console.log('Cannot sync: offline');
      return;
    }

    try {
      const pendingOperations = await DatabaseService.getPendingSyncOperations();
      
      if (pendingOperations.length === 0) {
        console.log('No pending operations to sync');
      } else {
        console.log(`Syncing ${pendingOperations.length} pending operations`);
      }

      let processedCount = 0;
      let failedCount = 0;
      const failedMessages: string[] = [];

      for (const operation of pendingOperations) {
        try {
          await this.processSyncOperation(operation);
          await DatabaseService.clearSyncOperation(operation.id);
          processedCount += 1;
        } catch (error) {
          failedCount += 1;
          const message = error instanceof Error ? error.message : String(error);
          failedMessages.push(`${operation.id}: ${message}`);
          console.error(`Error processing sync operation ${operation.id}:`, error);
        }
      }

      try {
        await this.pullServerEquipmentToLocal();
      } catch (error) {
        failedCount += 1;
        const message = error instanceof Error ? error.message : String(error);
        failedMessages.push(`PULL: ${message}`);
        console.error('Error pulling server equipment:', error);
      }

      if (failedCount > 0) {
        const summary = `Sync finished with errors (${processedCount} ok, ${failedCount} failed): ${failedMessages.join(' | ')}`;
        console.error(summary);
        throw new Error(summary);
      }

      if (pendingOperations.length === 0) {
        console.log('Sync completed successfully (pull only)');
      } else {
        console.log(`Sync completed successfully (${processedCount} operations + pull)`);
      }
    } catch (error) {
      console.error('Error during sync:', error);
      throw error;
    }
  }

  private async pullServerEquipmentToLocal(): Promise<void> {
    const serverEquipment = await ApiService.getEquipmentList();
    let upserted = 0;

    for (const equipment of serverEquipment) {
      await DatabaseService.upsertEquipmentFromServer({
        ...equipment,
        createdAt: equipment.createdAt ? new Date(equipment.createdAt) : undefined,
        updatedAt: equipment.updatedAt ? new Date(equipment.updatedAt) : undefined,
        syncStatus: SyncStatus.SYNCED,
      });
      upserted += 1;
    }

    console.log(`Pulled ${upserted} equipment records from API`);
  }

  private async processSyncOperation(operation: any): Promise<void> {
    const { operation: opType, equipmentId, data } = operation;

    switch (opType) {
      case 'CREATE':
        await this.createEquipmentOnServer({
          ...(data || {}),
          id: equipmentId,
        });
        await DatabaseService.markEquipmentAsSynced(equipmentId);
        break;
      
      case 'UPDATE':
        await this.updateEquipmentOnServer({
          ...(data || {}),
          id: equipmentId,
        });
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
      await ApiService.createEquipment(equipment);
      console.log('Equipment created successfully on API');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const isDuplicateIdError =
        /duplicate|duplicado|already exists|primary|unique/i.test(message);

      if (isDuplicateIdError && equipment.id != null) {
        console.warn(
          `Create failed for equipment ${equipment.id} due to duplicate key. Falling back to update.`
        );
        await ApiService.updateEquipment(equipment);
        console.log('Equipment updated successfully on API (fallback from create)');
        return;
      }

      console.error('Error creating equipment on API:', error);
      throw error;
    }
  }

  private async updateEquipmentOnServer(equipment: Equipment): Promise<void> {
    try {
      await ApiService.updateEquipment(equipment);
      console.log('Equipment updated successfully on API');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (isApiNotFoundError(message)) {
        console.warn(
          `Update failed for equipment ${equipment.id} (missing on server, e.g. empty DB). Falling back to create.`
        );
        await this.createEquipmentOnServer(equipment);
        return;
      }
      console.error('Error updating equipment on API:', error);
      throw error;
    }
  }

  private async deleteEquipmentOnServer(equipmentId: number): Promise<void> {
    try {
      await ApiService.deleteEquipment(equipmentId);
      console.log('Equipment deleted successfully on API');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (isApiNotFoundError(message)) {
        console.warn(
          `Delete for equipment ${equipmentId} skipped (already absent on server).`
        );
        return;
      }
      console.error('Error deleting equipment on API:', error);
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
