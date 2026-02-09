$ErrorActionPreference = "Stop"
$HOST_IP = "179.43.120.168"
$USER = "root"
$PORT = "5169"

Write-Host "1. Verificando conexión local en el VPS (curl localhost:3000)..." -ForegroundColor Cyan
ssh -p $PORT $USER@$HOST_IP "curl -v http://localhost:3000 || echo 'FALLO LOCAL'"

Write-Host "`n2. Verificando logs de arranque (buscando 'Ready on')..." -ForegroundColor Cyan
ssh -p $PORT $USER@$HOST_IP "docker logs grana3d-app 2>&1 | grep 'Ready on' || echo 'No se encontró mensaje de inicio'"

Write-Host "`n3. Verificando si el puerto está escuchando (netstat)..." -ForegroundColor Cyan
ssh -p $PORT $USER@$HOST_IP "netstat -tulpn | grep 3000 || echo 'Puerto 3000 no detectado con netstat'"
