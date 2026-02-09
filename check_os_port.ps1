$ErrorActionPreference = "Stop"
$HOST_IP = "179.43.120.168"
$USER = "root"
$PORT = "5169"

Write-Host "1. Identificando Sistema Operativo..." -ForegroundColor Cyan
ssh -p $PORT $USER@$HOST_IP "cat /etc/os-release"

Write-Host "`n2. Verificando si el puerto 80 está ocupado..." -ForegroundColor Cyan
ssh -p $PORT $USER@$HOST_IP "netstat -tulpn | grep :80 || echo 'PUERTO 80 LIBRE'"
