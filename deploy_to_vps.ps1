$ErrorActionPreference = "Stop"

$HOST_IP = "179.43.120.168"
$USER = "root"
$PORT = "5169"
$REMOTE_PATH = "/root/grana3d"

Write-Host "Iniciando despliegue en VPS $HOST_IP..." -ForegroundColor Cyan

# Check if scp is available
if (-not (Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Error "El comando 'scp' no está disponible. Por favor instala OpenSSH Client en Windows."
    exit 1
}

Write-Host "Creando directorio remoto..."
ssh -p $PORT $USER@$HOST_IP "mkdir -p $REMOTE_PATH"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Fallo al crear directorio remoto. Verifica tu contraseña."
    exit 1
}

Write-Host "Copiando docker-compose.yml..."
$destination = "$USER@$HOST_IP`:$REMOTE_PATH/docker-compose.yml"
scp -P $PORT docker-compose.yml $destination

Write-Host "Copiando app.conf (Nginx)..."
$destConf = "$USER@$HOST_IP`:$REMOTE_PATH/app.conf"
scp -P $PORT app.conf $destConf

Write-Host "Copiando configuración de entorno..."
if (Test-Path ".env.production") {
    Write-Host "Usando .env.production para el VPS..." -ForegroundColor Green
    $destEnv = "$USER@$HOST_IP`:$REMOTE_PATH/.env"
    scp -P $PORT .env.production $destEnv
} elseif (Test-Path ".env") {
    Write-Warning "Usando .env local. Asegúrate de que DATABASE_URL apunte al contenedor 'db' (ej: postgresql://...@db:5432...)"
    $destEnv = "$USER@$HOST_IP`:$REMOTE_PATH/.env"
    scp -P $PORT .env $destEnv
} else {
    Write-Warning "No se encontró archivo config local. Se usará .env.production.example como base."
    $destEnv = "$USER@$HOST_IP`:$REMOTE_PATH/.env"
    scp -P $PORT .env.production.example $destEnv
}

Write-Host "Desplegando contenedores en el VPS..."
ssh -p $PORT $USER@$HOST_IP "cd $REMOTE_PATH && docker compose down && docker compose pull && docker compose up -d"

if ($LASTEXITCODE -eq 0) {
    Write-Host "¡Despliegue completado exitosamente!" -ForegroundColor Green
    Write-Host "La aplicación debería estar corriendo en http://$HOST_IP (Puerto 80)"
} else {
    Write-Error "Hubo un error al ejecutar docker compose en el servidor. Asegúrate de que Docker está instalado."
}
