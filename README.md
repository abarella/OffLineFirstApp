# Offline First App - Gestão de Equipamentos

Uma aplicação React Native que implementa o conceito **Offline First** para gestão de equipamentos, utilizando SQLite para armazenamento local e SQL Server para persistência definitiva.

## 🚀 Características

- **Offline First**: Funciona completamente offline com sincronização automática quando online
- **SQLite Local**: Armazenamento local robusto para operações offline
- **Sincronização Inteligente**: Sincroniza automaticamente com SQL Server quando há conexão
- **Interface Moderna**: UI intuitiva e responsiva
- **Gestão Completa**: CRUD completo para equipamentos
- **Filtros e Busca**: Filtros por status e busca por texto
- **Validação**: Validação de formulários em tempo real

## 📱 Campos do Equipamento

- **Nome do Equipamento**: Nome identificador do equipamento
- **Endereço IP**: Endereço IP do equipamento (com validação)
- **Localização**: Localização física do equipamento
- **Tipo de Equipamento**: Categoria/classificação do equipamento
- **Status**: 
  - 🟢 Ativo
  - 🔴 Inativo
  - 🟠 Em Manutenção

## 🏗️ Arquitetura

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Header.tsx      # Cabeçalho com status de sincronização
│   ├── EquipmentList.tsx # Lista de equipamentos
│   └── EquipmentForm.tsx # Formulário de equipamento
├── hooks/              # Hooks personalizados
│   └── useEquipment.ts # Hook principal para gestão de equipamentos
├── services/           # Serviços de dados
│   ├── DatabaseService.ts # Serviço SQLite local
│   └── SyncService.ts  # Serviço de sincronização
├── types/              # Definições de tipos TypeScript
│   └── Equipment.ts    # Interfaces e enums
├── config/             # Configurações
│   └── database.ts     # Configurações de banco e API
└── screens/            # Telas da aplicação
    └── EquipmentScreen.tsx # Tela principal
```

## 🛠️ Tecnologias Utilizadas

- **React Native 0.81.1**
- **TypeScript**
- **SQLite** (react-native-sqlite-storage)
- **AsyncStorage** para configurações
- **React Hooks** para gerenciamento de estado

## 📦 Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd OfflineFirstApp
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Instale as dependências específicas**
   ```bash
   npm install react-native-sqlite-storage @react-native-async-storage/async-storage
   ```

4. **Configuração do SQLite (Android)**
   
   Adicione ao `android/app/build.gradle`:
   ```gradle
   android {
       defaultConfig {
           ndk {
               abiFilters "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
           }
       }
   }
   ```

5. **Configuração do SQLite (iOS)**
   
   Execute no diretório `ios/`:
   ```bash
   cd ios && pod install
   ```

## ⚙️ Configuração

### 1. Configuração do SQL Server

Edite `src/config/database.ts`:

```typescript
export const SQL_SERVER_CONFIG = {
  server: 'seu-servidor-sql.database.windows.net',
  database: 'OfflineFirstDB',
  user: 'seu-usuario',
  password: 'sua-senha',
  options: {
    encrypt: true, // false para SQL Server local
    trustServerCertificate: false,
  },
};
```

### 2. Script SQL para SQL Server

```sql
CREATE TABLE Equipment (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nome NVARCHAR(255) NOT NULL,
    EnderecoIP NVARCHAR(45) NOT NULL,
    Localizacao NVARCHAR(255) NOT NULL,
    TipoEquipamento NVARCHAR(255) NOT NULL,
    Status NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    SyncStatus NVARCHAR(50) NOT NULL DEFAULT 'synced'
);

CREATE INDEX IX_Equipment_SyncStatus ON Equipment(SyncStatus);
CREATE INDEX IX_Equipment_Status ON Equipment(Status);
```

## 🚀 Executando a Aplicação

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```
## 📦 Gerar e Instalar APK (Release) — instalação definitiva no dispositivo

Siga estes passos para gerar um APK de *release* (sem depender do Metro) e instalar diretamente no seu dispositivo Android (ex.: `motorola_edge_30`). Os comandos abaixo são para PowerShell no Windows.

1) Verifique se o dispositivo está conectado e com USB debugging ativo:

```powershell
Set-Location 'C:\PROJETOS\OFFLINEFIRST\OfflineFirstApp\android'
adb devices
```

2) Gerar o APK de release (gera o bundle JS automaticamente):

```powershell
# no diretório android do projeto
.\gradlew assembleRelease
```

3) Localize o APK gerado e instale no dispositivo (substitui a versão instalada):

```powershell
# lista o arquivo gerado
Get-ChildItem .\app\build\outputs\apk\release\ -Filter "*.apk"

# instalar no device padrão (ou use -s <deviceId> para instalar em um device específico)
adb install -r .\app\build\outputs\apk\release\app-release.apk
```

4) (Opcional) Abrir a Activity principal no dispositivo:

```powershell
adb shell am start -n com.offlinefirstapp/.MainActivity
```

Assinatura (signing) e distribuição para Play Store
- Para publicar na Play Store você precisa de um AAB/APK assinado. Crie um keystore (caso não tenha):

```powershell
# exemplo para gerar um keystore (substitua alias e paths)
# keytool faz parte do JDK
keytool -genkey -v -keystore my-release-key.jks -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

- Configure `android/app/build.gradle` com `signingConfigs` (veja comentário padrão do React Native) e gere o AAB com:

```powershell
# gerar AAB para Play Store
.\gradlew bundleRelease
```

Problemas comuns
- APK está ‘unsigned’ quando tentar instalar: verifique se gerou `app-release-unsigned.apk` — assine com `apksigner` ou configure `signingConfigs`.
- Se houver conflito com uma versão já instalada (assinaturas diferentes), remova primeiro:

```powershell
adb uninstall com.offlinefirstapp
adb install -r .\app\build\outputs\apk\release\app-release.apk
```

- Se o aplicativo não conectar ao Metro (esperado no release), verifique logs com `adb logcat`:

```powershell
adb logcat -s ReactNativeJS *:S
```

Dica: você também pode rodar diretamente (modo release) via CLI se preferir:

```powershell
Set-Location 'C:\PROJETOS\OFFLINEFIRST\OfflineFirstApp'
# executa build e instala em um device conectado
npx react-native run-android --variant=release

## 🔄 Como Funciona a Sincronização

### Modo Offline
1. Todas as operações são salvas no SQLite local
2. Cada operação é marcada com status de sincronização pendente
3. As operações são armazenadas em uma fila de sincronização

### Modo Online
1. A aplicação detecta automaticamente quando está online
2. Inicia sincronização automática a cada 5 minutos
3. Processa todas as operações pendentes em lote
4. Atualiza o status de sincronização no banco local

### Estados de Sincronização
- ✅ **synced**: Sincronizado com o servidor
- ⏳ **pending_sync**: Aguardando primeira sincronização
- 🔄 **pending_update**: Aguardando atualização no servidor
- 🗑️ **pending_delete**: Aguardando exclusão no servidor

## 📊 Funcionalidades

### Gestão de Equipamentos
- ✅ Adicionar novo equipamento
- ✅ Editar equipamento existente
- ✅ Excluir equipamento
- ✅ Visualizar lista de equipamentos
- ✅ Buscar equipamentos por texto
- ✅ Filtrar por status

### Sincronização
- ✅ Sincronização automática quando online
- ✅ Sincronização manual
- ✅ Indicador de status online/offline
- ✅ Contador de operações pendentes
- ✅ Histórico de última sincronização

### Interface
- ✅ Design responsivo e moderno
- ✅ Validação de formulários
- ✅ Feedback visual para operações
- ✅ Pull-to-refresh
- ✅ Modal para formulários

## 🧪 Testando a Funcionalidade Offline

1. **Adicione equipamentos** enquanto offline
2. **Verifique o status** de sincronização (⏳)
3. **Ative o modo online** clicando no botão de status
4. **Observe a sincronização** automática
5. **Verifique o status** mudando para ✅

## 🔧 Solução de Problemas

### Erro de SQLite
```bash
# Limpe o cache do Metro
npx react-native start --reset-cache

# Reinstale as dependências
rm -rf node_modules && npm install
```

### Problemas de Sincronização
1. Verifique a configuração do SQL Server
2. Confirme se a aplicação está online
3. Verifique os logs no console
4. Teste a sincronização manual

### Performance
- A aplicação é otimizada para grandes volumes de dados
- As operações são processadas em lotes
- Índices são criados automaticamente no SQLite

## 📱 Compatibilidade

- **Android**: API 21+ (Android 5.0+)
- **iOS**: iOS 12.0+
- **React Native**: 0.81.1+

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido com ❤️ para demonstrar o poder do conceito Offline First**
