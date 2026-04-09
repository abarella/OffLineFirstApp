@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo ========================================
echo OfflineFirstApp - Build + Install Release
echo ========================================
echo.

where adb >nul 2>&1
if errorlevel 1 (
  echo ERRO: adb nao encontrado no PATH. Instale Android SDK Platform-Tools.
  exit /b 1
)

adb devices
echo.

if /i "%~1"=="/u" (
  echo Desinstalando pacote anterior ^(apaga dados locais do app^)...
  adb uninstall com.offlinefirstapp
  echo.
)

echo [1/2] Gerando APK release ^(pode levar alguns minutos^)...
call "%~dp0android\gradlew.bat" -p "%~dp0android" assembleRelease
if errorlevel 1 (
  echo ERRO: Gradle falhou.
  exit /b 1
)

set "APK=%~dp0android\app\build\outputs\apk\release\app-release.apk"
if not exist "%APK%" (
  echo ERRO: APK nao encontrado: %APK%
  exit /b 1
)

echo.
echo [2/2] Instalando no dispositivo conectado...
adb install -r "%APK%"
if errorlevel 1 (
  echo.
  echo Instalacao falhou. Se a mensagem for assinatura incompativel, rode:
  echo   install-release.bat /u
  echo ^(isso desinstala o app atual e apaga dados locais^)
  exit /b 1
)

echo.
echo Concluido. Pode desconectar o USB - o app release nao precisa do Metro.
exit /b 0
