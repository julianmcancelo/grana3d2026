$ErrorActionPreference = "Stop"
$HOST_IP = "179.43.120.168"
$USER = "root"
$PORT = "5169"
$REMOTE_PATH = "/root/grana3d"

# 1. Crear carpeta uploads y asignar permisos
Write-Host "1. Configurando permisos de carpeta uploads..." -ForegroundColor Cyan
ssh -p $PORT $USER@$HOST_IP "mkdir -p $REMOTE_PATH/uploads && chmod 777 $REMOTE_PATH/uploads"

# 2. Subir nueva config de Nginx
Write-Host "2. Actualizando configuración Nginx..."
scp -P $PORT nginx-ssl.conf $USER@$HOST_IP`:$REMOTE_PATH/app.conf
scp -P $PORT docker-compose.yml $USER@$HOST_IP`:$REMOTE_PATH/docker-compose.yml

# 3. Reiniciar contenedores
Write-Host "3. Reiniciando servicios..."
ssh -p $PORT $USER@$HOST_IP "cd $REMOTE_PATH && docker compose up -d"
ssh -p $PORT $USER@$HOST_IP "cd $REMOTE_PATH && docker compose restart nginx"

Write-Host "¡Listo! Prueba subir una imagen ahora." -ForegroundColor Green
