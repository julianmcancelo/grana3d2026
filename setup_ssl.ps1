$ErrorActionPreference = "Stop"
$HOST_IP = "179.43.120.168"
$USER = "root"
$PORT = "5169"
$REMOTE_PATH = "/root/grana3d"

# 1. Copiar Nginx Config Inicial (HTTP)
Write-Host "1. Subiendo configuración inicial Nginx (HTTP)..." -ForegroundColor Cyan
scp -P $PORT nginx-init.conf $USER@$HOST_IP`:$REMOTE_PATH/app.conf
# También necesitamos docker-compose actualizado
scp -P $PORT docker-compose.yml $USER@$HOST_IP`:$REMOTE_PATH/docker-compose.yml

# 2. Iniciar Nginx
Write-Host "2. Iniciando Nginx para validación..." -ForegroundColor Cyan
ssh -p $PORT $USER@$HOST_IP "cd $REMOTE_PATH && docker compose up -d nginx"

# 3. Solicitar Certificado
Write-Host "3. Solicitando certificado SSL (esto puede tardar)..." -ForegroundColor Yellow
$DOMAIN_ARGS = "-d grana3d.com.ar -d www.grana3d.com.ar -d tienda.grana3d.com.ar"
$EMAIL = "admin@grana3d.com.ar" # Ajustar si tienes uno real
ssh -p $PORT $USER@$HOST_IP "cd $REMOTE_PATH && docker compose run --rm certbot certonly --webroot --webroot-path /var/www/certbot --email $EMAIL --agree-tos --no-eff-email $DOMAIN_ARGS"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Fallo al obtener certificado. Verifica que los dominios apunten a $HOST_IP"
    exit 1
}

# 4. Copiar Nginx Config Final (HTTPS)
Write-Host "4. Certificado obtenido! Subiendo configuración final (HTTPS)..." -ForegroundColor Green
scp -P $PORT nginx-ssl.conf $USER@$HOST_IP`:$REMOTE_PATH/app.conf

# 5. Reiniciar Nginx para aplicar cambios
Write-Host "5. Reiniciando Nginx con SSL..."
ssh -p $PORT $USER@$HOST_IP "cd $REMOTE_PATH && docker compose restart nginx"

Write-Host "¡LISTO! Tu sitio debería estar seguro en https://grana3d.com.ar" -ForegroundColor Green
Write-Host "No olvides actualizar .env.production en el VPS con la nueva URL (https)" -ForegroundColor Yellow
