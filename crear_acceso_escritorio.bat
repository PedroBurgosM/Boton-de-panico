@echo off
chcp 65001 >nul
title Creador de Accesos Directos - Botón de Pánico

echo ========================================================
echo    CREADOR DE ACCESO DIRECTO EN EL ESCRITORIO
echo ========================================================
echo Este asistente creará un acceso directo en el escritorio
echo que abrirá el botón de pánico en modo ventana de aplicación
echo (sin barras de navegador ni pestañas).
echo ========================================================
echo.

echo Selecciona el tipo de acceso directo que deseas crear:
echo [1] Acceso directo para SALA DE CLASES (Profesor)
echo [2] Acceso directo para RECEPTOR (Inspectoría / Enfermería / Convivencia)
echo.
set /p opcion="Ingresa tu opción (1 o 2): "

if "%opcion%"=="1" goto sala
if "%opcion%"=="2" goto receptor
echo Opción inválida.
pause
exit /b 1

:sala
echo.
echo Ingresa la IP o dirección del servidor (Ejemplo: 192.168.1.50:3000 o localhost:3000):
set /p servidor="Dirección del servidor: "
echo.
echo Ingresa el nombre o número de la sala (Ejemplo: Sala-101 o Lab-Computacion):
set /p nomsala="Identificador de la sala: "

set "TARGET_URL=http://%servidor%/sala.html?sala=%nomsala%"
set "LNK_NAME=🚨 ALERTA - %nomsala%.lnk"
goto crear

:receptor
echo.
echo Ingresa la IP o dirección del servidor (Ejemplo: 192.168.1.50:3000 o localhost:3000):
set /p servidor="Dirección del servidor: "
echo.
echo Selecciona el perfil del receptor:
echo [1] Inspectoría General (Recibe todo)
echo [2] Enfermería
echo [3] Convivencia Escolar
set /p rolopcion="Perfil (1, 2 o 3): "

if "%rolopcion%"=="1" (
    set "TARGET_URL=http://%servidor%/receptor.html?rol=todos"
    set "LNK_NAME=🏢 Central de Alertas - Inspectoría.lnk"
) else if "%rolopcion%"=="2" (
    set "TARGET_URL=http://%servidor%/receptor.html?rol=enfermeria"
    set "LNK_NAME=🩺 Central de Alertas - Enfermería.lnk"
) else (
    set "TARGET_URL=http://%servidor%/receptor.html?rol=convivencia"
    set "LNK_NAME=🤝 Central de Alertas - Convivencia.lnk"
)
goto crear

:crear
echo.
echo Creando acceso directo en el Escritorio...

:: Buscar navegador disponible (Chrome o Edge)
set "BROWSER_EXE="
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_EXE=C:\Program Files\Google\Chrome\Application\chrome.exe"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_EXE=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
) else if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_EXE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
) else if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_EXE=C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)

if "%BROWSER_EXE%"=="" (
    set "BROWSER_EXE=msedge.exe"
)

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $desktop = [System.Environment]::GetFolderPath('Desktop'); $s = $ws.CreateShortcut(\"$desktop\%LNK_NAME%\"); $s.TargetPath = '%BROWSER_EXE%'; $s.Arguments = '--app=\"%TARGET_URL%\"'; $s.Save()"

echo.
echo [OK] ¡Acceso directo creado exitosamente en tu Escritorio!
echo Archivo: %LNK_NAME%
echo Destino: %TARGET_URL%
echo.
pause
