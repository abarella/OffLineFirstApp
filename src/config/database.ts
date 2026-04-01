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

// Configuração para conexão com MySQL
// Observação: esta app faz conexão direta a partir do client (React Native).
// Em cenários reais é comum usar um backend/proxy REST.
export const MYSQL_CONFIG = {
  // phpMyAdmin: https://abjinfo.com.br/phpmyadmin/...
  // Para o driver MySQL, use apenas o host (sem scheme/path).
  host: 'abjinfo.com.br',
  database: 'admin_web',
  user: 'admin_user',
  password: 'ABj!010359',
  // Porta padrão do MySQL.
  port: 3306,
  // TLS/SSL (opcional). Para desenvolvimento pode ser necessário ajustar.
  // ssl: { rejectUnauthorized: false },
  connectTimeout: 30000,
  connectionLimit: 10,
};

// API oficial: HTTPS no dominio (Nginx proxy -> Node :3001).
const API_BASE_OFFICIAL = 'https://abjinfo.com.br/api';

// Configuração para API REST (alternativa ao SQL Server direto)
export const API_CONFIG = {
  // Para este projeto, usar sempre a API oficial tambem em debug.
  // O controle de sincronizacao continua sendo feito pelo botao on/off do app.
  baseUrl: API_BASE_OFFICIAL,
  endpoints: {
    equipment: '/equipment',
  },
  headers: {
    'Content-Type': 'application/json',
  },
};

// Configuração de sincronização
export const SYNC_CONFIG = {
  autoSyncInterval: 5 * 60 * 1000, // 5 minutos
  maxRetries: 3,
  retryDelay: 1000, // 1 segundo
  batchSize: 50, // Número máximo de operações por lote
};
