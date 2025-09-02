// Configuração para conexão com SQL Server
// Em produção, essas informações devem ser armazenadas de forma segura
export const SQL_SERVER_CONFIG = {
  server: 'your-sql-server.database.windows.net', // ou IP local
  database: 'OfflineFirstDB',
  user: 'your-username',
  password: 'your-password',
  options: {
    encrypt: true, // Para Azure, false para SQL Server local
    trustServerCertificate: false, // true para desenvolvimento local
    enableArithAbort: true,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Configuração para API REST (alternativa ao SQL Server direto)
export const API_CONFIG = {
  baseUrl: 'https://your-api-domain.com/api',
  endpoints: {
    equipment: '/equipment',
    sync: '/sync',
  },
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-api-token',
  },
};

// Configuração de sincronização
export const SYNC_CONFIG = {
  autoSyncInterval: 5 * 60 * 1000, // 5 minutos
  maxRetries: 3,
  retryDelay: 1000, // 1 segundo
  batchSize: 50, // Número máximo de operações por lote
};
