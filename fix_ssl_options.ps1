$ErrorActionPreference = "Stop"
$HOST_IP = "179.43.120.168"
$USER = "root"
$PORT = "5169"
$REMOTE_PATH = "/root/grana3d"

# 1. Descargar options-ssl-nginx.conf y ssl-dhparams.pem de Let's Encrypt
Write-Host "1. Descargando archivos SSL faltantes..." -ForegroundColor Cyan
curl.exe -o options-ssl-nginx.conf https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf
curl.exe -o ssl-dhparams.pem https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem

# 2. Subir archivos al VPS
Write-Host "2. Subiendo archivos al VPS..." -ForegroundColor Cyan
ssh -p $PORT $USER@$HOST_IP "mkdir -p $REMOTE_PATH/certbot/conf"
scp -P $PORT options-ssl-nginx.conf $USER@$HOST_IP`:$REMOTE_PATH/certbot/conf/
scp -P $PORT ssl-dhparams.pem $USER@$HOST_IP`:$REMOTE_PATH/certbot/conf/

# 3. Reiniciar Nginx
Write-Host "3. Reiniciando Nginx..." -ForegroundColor Green
ssh -p $PORT $USER@$HOST_IP "cd $REMOTE_PATH && docker compose restart nginx"

Write-Host "¡Listo! Prueba entrar a https://grana3d.com.ar" -ForegroundColor Green
