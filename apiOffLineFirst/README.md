# API Offline First (Node.js)

API REST em Node.js + Express para cadastrar e sincronizar equipamentos.

## Requisitos

- Node.js 20+
- MySQL 8+

## Instalar

```bash
cd apiOffLineFirst
npm install
```

## Configurar ambiente

1. Copie `.env.example` para `.env`
2. Ajuste os dados do banco

## Criar tabela

```sql
CREATE TABLE IF NOT EXISTS equipment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  endereco_ip VARCHAR(45) NOT NULL,
  localizacao VARCHAR(255) NOT NULL,
  tipo_equipamento VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Rodar API

```bash
npm run dev
```

## Endpoints

- `GET /health`
- `GET /api/equipment`
- `GET /api/equipment/:id`
- `POST /api/equipment`
- `PUT /api/equipment/:id`
- `DELETE /api/equipment/:id`

### Observacao importante para offline-first

No `POST /api/equipment`, o campo `id` pode ser enviado pelo app cliente.
Isso permite manter o mesmo identificador entre SQLite local e servidor, evitando
inconsistencia em operacoes futuras de update/delete sincronizadas.

## Consumo da API (exemplo com seu servidor)

**Base URL** (Node na porta padrao `3001`, conforme `PORT` no `.env`):

```text
http://abjinfo.com.br:3001
```

A porta **3001** precisa estar acessivel no firewall se o consumo for de fora do servidor; alternativa: proxy reverso em **443** sem expor a 3001.

Substitua pela URL real se usar HTTPS ou proxy (ex.: `https://abjinfo.com.br` sem porta).

### `GET /health`

**Requisicao:** `GET http://abjinfo.com.br:3001/health`

**Resposta `200` (exemplo):**

```json
{
  "status": "ok",
  "service": "api-offline-first"
}
```

### `GET /api/equipment`

**Requisicao:** `GET http://abjinfo.com.br:3001/api/equipment`

**Resposta `200` (lista vazia):**

```json
[]
```

**Resposta `200` (com itens):**

```json
[
  {
    "id": 1,
    "nome": "Switch Core",
    "enderecoIP": "192.168.0.10",
    "localizacao": "CPD",
    "tipoEquipamento": "Switch",
    "status": "ativo",
    "createdAt": "2026-03-31T12:00:00.000Z",
    "updatedAt": "2026-03-31T12:00:00.000Z"
  }
]
```

### `GET /api/equipment/:id`

**Requisicao:** `GET http://abjinfo.com.br:3001/api/equipment/1`

**Resposta `200` (exemplo):**

```json
{
  "id": 1,
  "nome": "Switch Core",
  "enderecoIP": "192.168.0.10",
  "localizacao": "CPD",
  "tipoEquipamento": "Switch",
  "status": "ativo",
  "createdAt": "2026-03-31T12:00:00.000Z",
  "updatedAt": "2026-03-31T12:00:00.000Z"
}
```

**Resposta `404`:**

```json
{
  "message": "Equipamento nao encontrado"
}
```

### `POST /api/equipment`

**Headers:** `Content-Type: application/json`

**Body (campos obrigatorios: `nome`, `enderecoIP`, `localizacao`, `tipoEquipamento`, `status`; `id` opcional para sync offline-first):**

```json
{
  "nome": "Switch Core",
  "enderecoIP": "192.168.0.10",
  "localizacao": "CPD",
  "tipoEquipamento": "Switch",
  "status": "ativo"
}
```

**Resposta `201` (exemplo):**

```json
{
  "id": 1,
  "nome": "Switch Core",
  "enderecoIP": "192.168.0.10",
  "localizacao": "CPD",
  "tipoEquipamento": "Switch",
  "status": "ativo"
}
```

**Resposta `400` (campos faltando):**

```json
{
  "message": "Todos os campos sao obrigatorios"
}
```

### `PUT /api/equipment/:id`

**Body (todos os campos no corpo, id na URL):**

```json
{
  "nome": "Switch Core",
  "enderecoIP": "192.168.0.10",
  "localizacao": "CPD - Rack 2",
  "tipoEquipamento": "Switch",
  "status": "inativo"
}
```

**Resposta `200`:**

```json
{
  "message": "Equipamento atualizado com sucesso"
}
```

**Resposta `404`:** igual ao GET por id.

### `DELETE /api/equipment/:id`

**Resposta `204`:** sem corpo.

**Resposta `404`:**

```json
{
  "message": "Equipamento nao encontrado"
}
```

### Exemplo rapido com curl (no servidor ou no seu PC)

```bash
curl -s http://abjinfo.com.br:3001/health
curl -s http://abjinfo.com.br:3001/api/equipment
```

## Nao abre no navegador nem no Postman

Postman e o navegador falham da mesma forma quando **nao ha conexao TCP** (timeout, `ECONNREFUSED`, "Could not get response"). Nao e CORS: CORS so afeta o browser em alguns casos; Postman ignora CORS.

Siga a ordem:

### 1. Testar **dentro do servidor** (SSH/RDP)

```bash
curl -s http://127.0.0.1:3001/health
```

- Se **nao** responder JSON: o Node nao esta escutando nessa porta ou o PM2 aponta para outro script/pasta. Confira `pm2 list`, `pm2 logs` e se o processo usa `src/server.js`.
- Se **responder** `ok`: a API esta viva; o problema e **rede/firewall** entre seu PC e o servidor.

### 2. Porta no firewall

A porta **3001** precisa permitir entrada **de fora** (TCP). Em Ubuntu com UFW, por exemplo:

```bash
sudo ufw allow 3001/tcp
sudo ufw reload
sudo ufw status
```

No painel da VPS (Hetzner, AWS, etc.) verifique **security group** / regra de entrada para a porta 3001.

### 3. URL correta

Use **`http://`** com a porta: `http://abjinfo.com.br:3001/health` (nao `/equipment` sozinho; o correto e `/api/equipment`).

### 4. Escutar em todas as interfaces

O `server.js` usa `HOST=0.0.0.0` por padrao (ou defina `HOST=0.0.0.0` no `.env`). Apos alterar o codigo ou o `.env`, reinicie: `pm2 restart api` (ou o nome do processo).

### 5. Alternativa sem abrir a 3001

Configure **Nginx/Apache** (ou o Hestia) com **proxy reverso** de `https://abjinfo.com.br` para `http://127.0.0.1:3001`. Ai voce testa só `https://abjinfo.com.br/health` na porta **443** (ja liberada).
