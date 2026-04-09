# Offline First App - Gestão de Equipamentos ABJ

Uma aplicação React Native que implementa o conceito **Offline First** para gestão de equipamentos, utilizando SQLite para armazenamento local e SQL Server para persistência definitiva.

## 🚀 Características

- **Offline First**: Funciona completamente offline com sincronização automática quando online
- **SQLite Local**: Armazenamento local robusto para operações offline
- **Sincronização Inteligente**: Sincroniza automaticamente com SQL Server quando há conexão
- **Interface Moderna**: UI intuitiva e responsiva
- **Gestão Completa**: CRUD completo para equipamentos
- **Filtros e Busca**: Filtros por status e busca por texto
- **Validação**: Validação de formulários em tempo real

## ✅ Funcionalidades do Projeto

### Gestão de Equipamentos
- Cadastro de equipamento com os campos: nome, IP, localização, tipo e status
- Edição de equipamentos existentes
- Remoção de equipamentos
- Listagem completa de equipamentos cadastrados
- Busca textual por equipamentos
- Filtro por status (Ativo, Inativo, Em Manutenção)

### Fluxo Offline First
- Persistência local com SQLite para funcionar sem internet
- Operações locais marcadas para sincronização posterior
- Fila de sincronização para create/update/delete
- Continuidade de uso mesmo sem conexão com o servidor

### Sincronização com Servidor
- Sincronização automática quando o app está online
- Sincronização manual pelo usuário
- Processamento em lote de alterações pendentes
- Controle de estados de sincronização por registro:
  - `synced`
  - `pending_sync`
  - `pending_update`
  - `pending_delete`
- Indicador visual de online/offline e de pendências
- Registro de última sincronização

### Interface e Experiência
- Tela principal com listagem e ações de CRUD
- Modal/formulário com validação em tempo real
- Pull-to-refresh para atualizar os dados
- Feedback visual para operações e estados de sincronização

## 📐 Análise de Ponto de Função (estimativa inicial)

Esta análise é uma **estimativa funcional preliminar** baseada no escopo atual do app de gestão de equipamentos com operação offline e sincronização.

### Fronteira da aplicação
- Aplicação móvel React Native para cadastro e gestão de equipamentos
- Persistência local com SQLite e integração com SQL Server para sincronização

### Funções de Dados

| Tipo | Descrição | Qtd | Complexidade | Peso | Total PF |
|------|-----------|-----|--------------|------|----------|
| ALI | Equipamentos locais (SQLite) | 1 | Baixa | 7 | 7 |
| ALI | Fila/controle de sincronização local | 1 | Baixa | 7 | 7 |
| AIE | Estrutura externa no SQL Server | 1 | Baixa | 5 | 5 |

Subtotal Funções de Dados: **19 PF**

### Funções Transacionais

| Tipo | Descrição | Qtd | Complexidade | Peso | Total PF |
|------|-----------|-----|--------------|------|----------|
| EE | Incluir equipamento | 1 | Baixa | 3 | 3 |
| EE | Alterar equipamento | 1 | Baixa | 3 | 3 |
| EE | Excluir equipamento | 1 | Baixa | 3 | 3 |
| EE | Acionar sincronização manual | 1 | Baixa | 3 | 3 |
| CE | Consultar/listar equipamentos (com busca/filtro) | 1 | Média | 4 | 4 |
| CE | Consultar pendências/estado de sync | 1 | Baixa | 3 | 3 |
| SE | Exibir status consolidado de sincronização | 1 | Baixa | 4 | 4 |

Subtotal Funções Transacionais: **23 PF**

### Resultado da estimativa

- **PF Não Ajustado (PFNA)**: `19 + 23 = 42 PF`
- Classificação indicativa de porte: **pequeno para médio** (dependendo do critério da organização)

### Observações

- Estimativa inicial, sujeita a revisão após detalhamento técnico e regras de negócio finais.
- A sincronização automática, tratamento de conflitos e cenários de erro podem elevar a complexidade transacional.
- Recomenda-se validar a contagem com método oficial IFPUG/COSMIC adotado pela organização antes de contratação ou baseline formal.

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
## 📦 Gerar e Instalar APK (Release) — instalação direta no dispositivo

### Windows: script `install-release.bat`

Na **raiz do repositório** existe o arquivo `install-release.bat`, que automatiza o fluxo **build release + instalação no dispositivo** em um único passo.

**O que o script faz**

1. Verifica se o `adb` está disponível no PATH (Android SDK Platform Tools).
2. Executa `adb devices` para listar aparelhos conectados.
3. Opcionalmente desinstala o pacote anterior (somente se você usar o parâmetro `/u`).
4. Roda `gradlew assembleRelease` dentro de `android/` (gera o bundle JS e o APK assinado de release).
5. Instala `android/app/build/outputs/apk/release/app-release.apk` com `adb install -r`.

**Pré-requisitos**

- Projeto já com `npm install` executado (o Gradle usa o ambiente do projeto).
- **Platform Tools** instalados e `adb` no PATH.
- Celular com **depuração USB** ativa, cabo USB conectado.
- Assinatura de release configurada (`android/gradle.properties` + `signingConfigs.release` em `android/app/build.gradle`), como descrito na seção **Geração de `.aab` para Google Play (Teste Interno)** mais abaixo neste README.

**Uso**

Na raiz do projeto (mesma pasta onde está o `.bat`):

```bat
install-release.bat
```

Se a instalação falhar com **assinatura incompatível** (por exemplo, versão *debug* já instalada), rode **uma vez** com `/u` para desinstalar o app atual e instalar o release. **Atenção:** isso **apaga os dados locais** do app no aparelho (SQLite, fila de sync, etc.).

```bat
install-release.bat /u
```

Após instalar o **release**, você pode **desligar o USB**: o app **não depende** do Metro nem do PC (diferente do `npm run android` em modo debug).

---

### Passo a passo manual (PowerShell)

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
```

## 📦 Geração de `.aab` para Google Play (Teste Interno)

Esta seção é o fluxo recomendado para publicar no track **Teste Interno** da Play Console.

### 1) Criar keystore de upload (uma vez)

No diretório `android/app`:

```powershell
Set-Location 'C:\PROJETOS\OfflineFirstApp\android\app'
keytool -genkeypair -v -storetype PKCS12 -keystore upload-key.keystore -alias upload-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 2) Configurar assinatura de release

No arquivo `android/gradle.properties`, configure:

```properties
MYAPP_UPLOAD_STORE_FILE=upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=upload-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=<SUA_SENHA>
MYAPP_UPLOAD_KEY_PASSWORD=<SUA_SENHA>
```

No arquivo `android/app/build.gradle`, o `buildTypes.release` deve usar `signingConfigs.release`.

### 3) Gerar o bundle Android (`.aab`)

No diretório `android`:

```powershell
Set-Location 'C:\PROJETOS\OfflineFirstApp\android'
.\gradlew.bat bundleRelease
```

Arquivo gerado:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

### 4) Publicar no Teste Interno (Play Console)

1. Acesse sua app na Play Console
2. Vá em **Testes > Teste interno**
3. Clique em **Criar versão**
4. Faça upload do `app-release.aab`
5. Preencha notas da versão
6. **Salvar** > **Revisar versão** > **Publicar no teste interno**

### 5) Adicionar testadores

- Crie/atualize a lista de e-mails no track de teste interno
- Compartilhe o link de convite (opt-in)
- Após aceitar, os testadores instalam pela Play Store

### Observações importantes

- O `applicationId` atual é `com.offlinefirstapp`; ele identifica a app na Play.
- Para novas versões, incremente o `versionCode` e atualize `versionName` em `android/app/build.gradle`.
- Nunca perca a keystore e senhas, ou você não conseguirá atualizar a app futuramente.

## ✅ Checklist pré-publicação (Play Console)

Antes de enviar uma versão para **Teste Interno** (ou produção), valide:

### App e Build
- [ ] `versionCode` incrementado em relação à versão anterior
- [ ] `versionName` atualizado (ex.: `1.0.1`)
- [ ] `applicationId` correto e definitivo
- [ ] `.aab` gerado com assinatura de release (sem debug keystore)
- [ ] Teste básico realizado no dispositivo real (abertura, navegação e sync)

### Qualidade mínima
- [ ] App abre sem tela vermelha (`Unable to load script`)
- [ ] Sem crash nas telas principais (lista, cadastro, edição, exclusão)
- [ ] Fluxo offline/online validado com sincronização
- [ ] Permissões solicitadas apenas quando necessárias

### Play Console (dados obrigatórios)
- [ ] Nome do app, descrição curta e descrição completa preenchidos
- [ ] Ícone de alta resolução enviado (512x512)
- [ ] Feature graphic enviada (1024x500), se aplicável ao layout atual da Play
- [ ] Capturas de tela do app enviadas (telefone obrigatório)
- [ ] E-mail de contato e política de privacidade informados

### Formulários de conformidade
- [ ] Classificação de conteúdo concluída
- [ ] Questionário de segurança de dados preenchido (Data Safety)
- [ ] Público-alvo e conteúdo definidos corretamente
- [ ] Declaração de anúncios marcada corretamente (se houver Ads)

### Teste Interno
- [ ] Track **Teste interno** criado/configurado
- [ ] Lista de testadores adicionada (e-mails ou grupo)
- [ ] Notas da versão preenchidas
- [ ] Versão publicada no track de teste
- [ ] Link de opt-in compartilhado com testadores

### Pós-publicação do teste
- [ ] Confirmar que testadores conseguem instalar pela Play Store
- [ ] Coletar feedback de funcionamento (offline, sync, UX, desempenho)
- [ ] Corrigir pendências e subir nova build incrementando `versionCode`

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
