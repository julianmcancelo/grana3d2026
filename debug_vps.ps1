$ErrorActionPreference = "Stop"
$HOST_IP = "179.43.120.168"
$USER = "root"
$PORT = "5169"

Write-Host "1. Verificando TABLAS en la Base de Datos..." -ForegroundColor Cyan
ssh -p $PORT $USER@$HOST_IP "docker exec grana3d-db psql -U postgres -d grana3d -c '\dt'"

Write-Host "`n2. Verificando Variables de Entorno en el contenedor (filtrado)..." -ForegroundColor Cyan
ssh -p $PORT $USER@$HOST_IP "docker exec grana3d-app env | grep DATABASE_URL"

Write-Host "`n3. Obteniendo últimos logs de ERROR..." -ForegroundColor Cyan
ssh -p $PORT $USER@$HOST_IP "docker logs grana3d-app --tail 100"
