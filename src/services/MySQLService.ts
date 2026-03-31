import mysql from 'mysql2/promise';
import { Equipment, SyncStatus } from '../types/Equipment';
import { MYSQL_CONFIG } from '../config/database';

// Implementação real de sincronização via MySQL.
// Mantém exatamente os nomes de tabela/colunas do seu script SQL Server:
//   Equipment (Id, Nome, EnderecoIP, Localizacao, TipoEquipamento, Status, CreatedAt, UpdatedAt, SyncStatus)
class MySQLService {
  private pool: mysql.Pool | null = null;

  private getPool(): mysql.Pool {
    if (!this.pool) throw new Error('MySQL pool not initialized. Call connect() first.');
    return this.pool;
  }

  async connect(): Promise<void> {
    if (this.pool) return;

    this.pool = mysql.createPool({
      host: MYSQL_CONFIG.host,
      database: MYSQL_CONFIG.database,
      user: MYSQL_CONFIG.user,
      password: MYSQL_CONFIG.password,
      port: MYSQL_CONFIG.port,
      connectTimeout: MYSQL_CONFIG.connectTimeout,
      connectionLimit: MYSQL_CONFIG.connectionLimit,
      // ssl: MYSQL_CONFIG.ssl, // se você habilitar ssl no MYSQL_CONFIG
    });
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  private toDateOrNow(value: unknown): Date {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    const d = new Date(String(value));
    return Number.isNaN(d.getTime()) ? new Date() : d;
  }

  async createEquipment(equipment: Equipment): Promise<void> {
    await this.connect();

    const now = this.toDateOrNow(equipment.createdAt ?? new Date());
    const createdAt = this.toDateOrNow((equipment as any).createdAt);
    const updatedAt = this.toDateOrNow((equipment as any).updatedAt);

    const syncStatus = SyncStatus.SYNCED; // após sincronizar com sucesso, marque como synced

    const query = `
      INSERT INTO \`Equipment\`
        (\`Nome\`, \`EnderecoIP\`, \`Localizacao\`, \`TipoEquipamento\`, \`Status\`, \`CreatedAt\`, \`UpdatedAt\`, \`SyncStatus\`)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.getPool().execute(query, [
      equipment.nome,
      equipment.enderecoIP,
      equipment.localizacao,
      equipment.tipoEquipamento,
      equipment.status,
      createdAt ?? now,
      updatedAt ?? now,
      syncStatus,
    ]);
  }

  async updateEquipment(equipment: Equipment): Promise<void> {
    await this.connect();

    if (!equipment.id) throw new Error('updateEquipment: equipment.id is required');

    const now = new Date();
    const updatedAt = this.toDateOrNow(equipment.updatedAt ?? now);
    const syncStatus = SyncStatus.SYNCED;

    const query = `
      UPDATE \`Equipment\`
      SET \`Nome\` = ?, \`EnderecoIP\` = ?, \`Localizacao\` = ?, \`TipoEquipamento\` = ?, \`Status\` = ?,
          \`UpdatedAt\` = ?, \`SyncStatus\` = ?
      WHERE \`Id\` = ?
    `;

    await this.getPool().execute(query, [
      equipment.nome,
      equipment.enderecoIP,
      equipment.localizacao,
      equipment.tipoEquipamento,
      equipment.status,
      updatedAt,
      syncStatus,
      equipment.id,
    ]);
  }

  async deleteEquipment(id: number): Promise<void> {
    await this.connect();

    const query = `DELETE FROM \`Equipment\` WHERE \`Id\` = ?`;
    await this.getPool().execute(query, [id]);
  }
}

export default new MySQLService();

