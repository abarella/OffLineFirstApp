# Configuração do SQLite para Offline First App

## 📱 Android

### 1. Configuração do build.gradle

O arquivo `android/app/build.gradle` já foi configurado com:

```gradle
android {
    defaultConfig {
        ndk {
            abiFilters "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
        }
    }
}
```

### 2. Permissões no AndroidManifest.xml

Verifique se o arquivo `android/app/src/main/AndroidManifest.xml` contém:

```xml
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### 3. Configuração do ProGuard (Release)

Se estiver usando ProGuard, adicione ao `android/app/proguard-rules.pro`:

```proguard
-keep class org.sqlite.** { *; }
-keep class org.sqlite.database.** { *; }
```

## 🍎 iOS

### 1. Instalação dos Pods

Execute no diretório `ios/`:

```bash
cd ios
pod install
```

### 2. Configuração do Info.plist

Adicione ao `ios/OfflineFirstApp/Info.plist`:

```xml
<key>UIFileSharingEnabled</key>
<true/>
<key>LSSupportsOpeningDocumentsInPlace</key>
<true/>
```

## 🔧 Solução de Problemas Comuns

### Erro: "SQLite not found" ou "Native module not found"

1. **Limpe o cache:**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Reinstale as dependências:**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Para Android, limpe o build:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

4. **Para iOS, limpe os Pods:**
   ```bash
   cd ios
   pod deintegrate
   pod install
   cd ..
   ```

### Erro: "Database locked" no Android

Este erro pode ocorrer se múltiplas instâncias tentarem acessar o banco simultaneamente. A aplicação já está configurada para lidar com isso, mas se persistir:

1. Feche a aplicação completamente
2. Limpe os dados da aplicação nas configurações do Android
3. Reinstale a aplicação

### Erro: "Permission denied" no iOS

1. Verifique se as permissões estão configuradas no Info.plist
2. Certifique-se de que o app tem permissão para acessar o sistema de arquivos
3. Teste em um dispositivo físico (o simulador pode ter limitações)

## 🧪 Testando a Instalação

### 1. Verifique se o SQLite está funcionando

Execute a aplicação e verifique no console se aparece:
```
Database initialized successfully
Tables created successfully
```

### 2. Teste a funcionalidade offline

1. Desative a conexão de internet
2. Tente adicionar um equipamento
3. Verifique se é salvo localmente
4. Reative a internet e observe a sincronização

### 3. Verifique os logs

No console da aplicação, você deve ver:
- Inicialização do banco
- Criação das tabelas
- Operações de CRUD
- Status de sincronização

## 📊 Estrutura do Banco Local

O SQLite criará automaticamente as seguintes tabelas:

### Tabela `equipment`
- `id`: Chave primária auto-incremento
- `nome`: Nome do equipamento
- `enderecoIP`: Endereço IP
- `localizacao`: Localização física
- `tipoEquipamento`: Tipo/categoria
- `status`: Status atual
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização
- `syncStatus`: Status de sincronização

### Tabela `sync_operations`
- `id`: Identificador único da operação
- `operation`: Tipo (CREATE, UPDATE, DELETE)
- `equipmentId`: ID do equipamento
- `data`: Dados do equipamento (JSON)
- `timestamp`: Timestamp da operação

## 🔄 Sincronização

### Estados de Sincronização
- `synced`: ✅ Sincronizado com o servidor
- `pending_sync`: ⏳ Aguardando primeira sincronização
- `pending_update`: 🔄 Aguardando atualização
- `pending_delete`: 🗑️ Aguardando exclusão

### Processo de Sincronização
1. **Offline**: Operações são salvas localmente com status pendente
2. **Online**: Sincronização automática a cada 5 minutos
3. **Processamento**: Operações pendentes são enviadas ao SQL Server
4. **Confirmação**: Status é atualizado para "synced"

## 📱 Compatibilidade

- **Android**: API 21+ (Android 5.0+)
- **iOS**: iOS 12.0+
- **SQLite**: Versão 3.x (incluída no React Native)

## 🚀 Próximos Passos

Após a configuração bem-sucedida do SQLite:

1. **Configure o SQL Server** (edite `src/config/database.ts`)
2. **Teste a sincronização** com um servidor real
3. **Implemente autenticação** se necessário
4. **Configure backup automático** dos dados locais
5. **Implemente logs detalhados** para produção

---

**Nota**: Esta configuração é para desenvolvimento. Para produção, considere:
- Criptografia dos dados locais
- Backup automático
- Logs de auditoria
- Tratamento de conflitos de sincronização
