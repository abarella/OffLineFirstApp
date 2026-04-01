import SQLite from 'react-native-sqlite-storage';
import { Equipment, SyncStatus } from '../types/Equipment';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

class DatabaseService {
  private database: SQLite.SQLiteDatabase | null = null;

  async initDatabase(): Promise<void> {
    try {
      this.database = await SQLite.openDatabase({
        name: 'OfflineFirstDB',
        location: 'default',
      });

      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const createEquipmentTable = `
      CREATE TABLE IF NOT EXISTS equipment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        enderecoIP TEXT NOT NULL,
        localizacao TEXT NOT NULL,
        tipoEquipamento TEXT NOT NULL,
        status TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        syncStatus TEXT NOT NULL DEFAULT 'pending_sync'
      );
    `;

    const createSyncOperationsTable = `
      CREATE TABLE IF NOT EXISTS sync_operations (
        id TEXT PRIMARY KEY,
        operation TEXT NOT NULL,
        equipmentId INTEGER NOT NULL,
        data TEXT,
        timestamp TEXT NOT NULL
      );
    `;

    try {
      await this.database.executeSql(createEquipmentTable);
      await this.database.executeSql(createSyncOperationsTable);
      console.log('Tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  async insertEquipment(equipment: Equipment): Promise<number> {
    if (!this.database) throw new Error('Database not initialized');

    const { nome, enderecoIP, localizacao, tipoEquipamento, status } = equipment;
    const now = new Date().toISOString();

    const query = `
      INSERT INTO equipment (nome, enderecoIP, localizacao, tipoEquipamento, status, createdAt, updatedAt, syncStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      const [result] = await this.database.executeSql(query, [
        nome,
        enderecoIP,
        localizacao,
        tipoEquipamento,
        status,
        now,
        now,
        SyncStatus.PENDING_SYNC
      ]);

      const equipmentId = result.insertId;
      
      // Add to sync operations
      await this.addSyncOperation('CREATE', equipmentId, equipment);
      
      return equipmentId;
    } catch (error) {
      console.error('Error inserting equipment:', error);
      throw error;
    }
  }

  async updateEquipment(equipment: Equipment): Promise<void> {
    if (!this.database || !equipment.id) throw new Error('Database not initialized or equipment ID missing');

    const { id, nome, enderecoIP, localizacao, tipoEquipamento, status } = equipment;
    const now = new Date().toISOString();

    const query = `
      UPDATE equipment 
      SET nome = ?, enderecoIP = ?, localizacao = ?, tipoEquipamento = ?, status = ?, updatedAt = ?, syncStatus = ?
      WHERE id = ?
    `;

    try {
      await this.database.executeSql(query, [
        nome,
        enderecoIP,
        localizacao,
        tipoEquipamento,
        status,
        now,
        SyncStatus.PENDING_UPDATE,
        id
      ]);

      // Add to sync operations
      await this.addSyncOperation('UPDATE', id, equipment);
    } catch (error) {
      console.error('Error updating equipment:', error);
      throw error;
    }
  }

  async deleteEquipment(id: number): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const query = 'DELETE FROM equipment WHERE id = ?';

    try {
      await this.database.executeSql(query, [id]);
      
      // Add to sync operations
      await this.addSyncOperation('DELETE', id);
    } catch (error) {
      console.error('Error deleting equipment:', error);
      throw error;
    }
  }

  async getAllEquipment(): Promise<Equipment[]> {
    if (!this.database) throw new Error('Database not initialized');

    const query = 'SELECT * FROM equipment ORDER BY createdAt DESC';

    try {
      const [results] = await this.database.executeSql(query);
      const equipment: Equipment[] = [];

      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        equipment.push({
          id: row.id,
          nome: row.nome,
          enderecoIP: row.enderecoIP,
          localizacao: row.localizacao,
          tipoEquipamento: row.tipoEquipamento,
          status: row.status,
          createdAt: new Date(row.createdAt),
          updatedAt: new Date(row.updatedAt),
          syncStatus: row.syncStatus
        });
      }

      return equipment;
    } catch (error) {
      console.error('Error getting all equipment:', error);
      throw error;
    }
  }

  async getEquipmentById(id: number): Promise<Equipment | null> {
    if (!this.database) throw new Error('Database not initialized');

    const query = 'SELECT * FROM equipment WHERE id = ?';

    try {
      const [results] = await this.database.executeSql(query, [id]);
      
      if (results.rows.length === 0) return null;

      const row = results.rows.item(0);
      return {
        id: row.id,
        nome: row.nome,
        enderecoIP: row.enderecoIP,
        localizacao: row.localizacao,
        tipoEquipamento: row.tipoEquipamento,
        status: row.status,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        syncStatus: row.syncStatus
      };
    } catch (error) {
      console.error('Error getting equipment by ID:', error);
      throw error;
    }
  }

  private async addSyncOperation(operation: 'CREATE' | 'UPDATE' | 'DELETE', equipmentId: number, data?: Equipment): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const query = `
      INSERT OR REPLACE INTO sync_operations (id, operation, equipmentId, data, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `;

    const operationId = `${operation}_${equipmentId}_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const dataJson = data ? JSON.stringify(data) : null;

    try {
      await this.database.executeSql(query, [operationId, operation, equipmentId, dataJson, timestamp]);
    } catch (error) {
      console.error('Error adding sync operation:', error);
      throw error;
    }
  }

  async getPendingSyncOperations(): Promise<any[]> {
    if (!this.database) throw new Error('Database not initialized');

    const query = 'SELECT * FROM sync_operations ORDER BY timestamp ASC';

    try {
      const [results] = await this.database.executeSql(query);
      const operations: any[] = [];

      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        operations.push({
          id: row.id,
          operation: row.operation,
          equipmentId: row.equipmentId,
          data: row.data ? JSON.parse(row.data) : null,
          timestamp: new Date(row.timestamp)
        });
      }

      return operations;
    } catch (error) {
      console.error('Error getting pending sync operations:', error);
      throw error;
    }
  }

  async markEquipmentAsSynced(id: number): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const query = 'UPDATE equipment SET syncStatus = ? WHERE id = ?';

    try {
      await this.database.executeSql(query, [SyncStatus.SYNCED, id]);
    } catch (error) {
      console.error('Error marking equipment as synced:', error);
      throw error;
    }
  }

  async clearSyncOperation(operationId: string): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const query = 'DELETE FROM sync_operations WHERE id = ?';

    try {
      await this.database.executeSql(query, [operationId]);
    } catch (error) {
      console.error('Error clearing sync operation:', error);
      throw error;
    }
  }

  async upsertEquipmentFromServer(equipment: Equipment): Promise<void> {
    if (!this.database || !equipment.id) throw new Error('Database not initialized or equipment ID missing');

    const createdAt = equipment.createdAt
      ? new Date(equipment.createdAt).toISOString()
      : new Date().toISOString();
    const updatedAt = equipment.updatedAt
      ? new Date(equipment.updatedAt).toISOString()
      : new Date().toISOString();

    const query = `
      INSERT INTO equipment (id, nome, enderecoIP, localizacao, tipoEquipamento, status, createdAt, updatedAt, syncStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        nome = excluded.nome,
        enderecoIP = excluded.enderecoIP,
        localizacao = excluded.localizacao,
        tipoEquipamento = excluded.tipoEquipamento,
        status = excluded.status,
        createdAt = excluded.createdAt,
        updatedAt = excluded.updatedAt,
        syncStatus = excluded.syncStatus
    `;

    await this.database.executeSql(query, [
      equipment.id,
      equipment.nome,
      equipment.enderecoIP,
      equipment.localizacao,
      equipment.tipoEquipamento,
      equipment.status,
      createdAt,
      updatedAt,
      SyncStatus.SYNCED,
    ]);
  }

  async closeDatabase(): Promise<void> {
    if (this.database) {
      await this.database.close();
      this.database = null;
    }
  }
}

export default new DatabaseService();
