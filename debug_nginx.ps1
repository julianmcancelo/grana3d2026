$ErrorActionPreference = "Stop"
$HOST_IP = "179.43.120.168"
$USER = "root"
$PORT = "5169"

Write-Host "--- CONTENEDORES ---" -ForegroundColor Cyan
ssh -p $PORT $USER@$HOST_IP "docker ps -a"

Write-Host "--- LOGS NGINX ---" -ForegroundColor Yellow
ssh -p $PORT $USER@$HOST_IP "docker logs grana3d-nginx --tail 20"

Write-Host "--- CERTIFICADOS ---" -ForegroundColor Yellow
ssh -p $PORT $USER@$HOST_IP "ls -la /root/grana3d/certbot/conf/live"

Write-Host "--- PUERTOS ESCUCHANDO ---" -ForegroundColor Green
ssh -p $PORT $USER@$HOST_IP "netstat -tulpn | grep LISTEN"
