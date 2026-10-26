@echo off
chcp 65001 >nul
title Servidor - Botón de Pánico Escolar

echo ========================================================
echo    SISTEMA DE BOTÓN DE PÁNICO ESCOLAR (COLEGIO)
echo ========================================================
echo.

:: Verificar si node está disponible
where node >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=%PATH%;C:\Program Files\nodejs"
    ) else (
        echo [ERROR] No se encontró Node.js instalado en este equipo.
        echo.
        echo Por favor descarga e instala Node.js (versión LTS) desde:
        echo https://nodejs.org
        echo.
        echo (Nota: Mientras tanto, puedes probar la demostración abriendo
        echo el archivo 'public\demo_sin_servidor.html' con doble clic).
        echo.
        pause
        exit /b 1
    )
)

:: Verificar e instalar dependencias si faltan
if not exist "node_modules\" (
    echo [INFO] Primera ejecución detectada. Instalando librerías necesarias...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Ocurrió un error al instalar librerías.
        pause
        exit /b 1
    )
    echo [OK] Librerías instaladas con éxito.
    echo.
)

echo [INFO] Iniciando el servidor de alertas en tiempo real...
echo.

:: Abrir navegador en el inicio
start "" "http://localhost:3000"

:: Ejecutar servidor Node
node server.js

pause
