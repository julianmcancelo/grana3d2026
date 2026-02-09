@echo off
echo ===================================================
echo  RECONSTRUYENDO IMAGEN DOCKER (FIX ERROR 500)
echo ===================================================

echo 1. Construyendo imagen (esto puede tardar unos minutos)...
docker build -t jotacancelo/grana3d:latest .
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Falló la construcción de la imagen.
    pause
    exit /b
)

echo.
echo 2. Subiendo imagen a Docker Hub...
docker push jotacancelo/grana3d:latest
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Falló al subir la imagen. Asegúrate de estar logueado (docker login).
    pause
    exit /b
)

echo.
echo ===================================================
echo  ¡LISTO! AHORA EJECUTA .\deploy_to_vps.ps1
echo ===================================================
pause
