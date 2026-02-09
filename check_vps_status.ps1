$ErrorActionPreference = "Stop"
$HOST_IP = "179.43.120.168"
$USER = "root"
$PORT = "5169"

Write-Host "Verificando estado de contenedores en VPS..." -ForegroundColor Cyan
ssh -p $PORT $USER@$HOST_IP "docker ps -a"

Write-Host "`n---------- LOGS DE LA APP (Últimas 50 líneas) ----------" -ForegroundColor Yellow
ssh -p $PORT $USER@$HOST_IP "docker logs --tail 50 grana3d-app"

Write-Host "`n---------- LOGS DE LA BASE DE DATOS (Últimas 20 líneas) ----------" -ForegroundColor Yellow
ssh -p $PORT $USER@$HOST_IP "docker logs --tail 20 grana3d-db"
