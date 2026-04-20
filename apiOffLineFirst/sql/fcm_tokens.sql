-- Execute no MySQL do servidor (mesmo banco da API `offline_first_db` ou o configurado em DB_NAME).
CREATE TABLE IF NOT EXISTS fcm_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(512) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_fcm_tokens_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
