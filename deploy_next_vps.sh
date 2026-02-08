#!/bin/bash
set -e

# ==========================================
# CONFIGURACIÓN DEPLOY NEXT.JS
# ==========================================
# Cambiar estos valores según tu entorno
APP_NAME="grana3d-next"
DOMAIN="grana3d.com.ar"
PORT=3000
REPO_URL="https://github.com/julianmcancelo/grana3d2026.git" # AJUSTAR URL
INSTALL_DIR="/var/www/grana3d-next"
DB_PASS="admin123" # Debería coincidir con tu DB real

echo "🚀 INICIANDO DESPLIEGUE DE GRANA3D (NEXT.JS)..."

# 1. Prerequisitos (Node 20+, PM2, Nginx, Git)
echo "📦 Verificando dependencias del sistema..."
export DEBIAN_FRONTEND=noninteractive

if ! command -v node &> /dev/null; then
    echo "🟢 Instalando Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y -qq nodejs npm
fi

if ! command -v pm2 &> /dev/null; then
    echo "🟢 Instalando PM2..."
    npm install -g pm2
fi

# 2. Configurar Directorio y Código
echo "📂 Preparando directorio..."
mkdir -p $INSTALL_DIR

if [ -d "$INSTALL_DIR/.git" ]; then
    echo "🔄 Actualizando código (git pull)..."
    cd $INSTALL_DIR
    git pull
else
    echo "⬇️ Clonando repositorio..."
    # Si la carpeta existe pero vacía o sin git, limpiar
    rm -rf $INSTALL_DIR
    git clone $REPO_URL $INSTALL_DIR
    cd $INSTALL_DIR
fi

# 3. Dependencias y Build
echo "📚 Instalando dependencias NPM..."
npm install

echo "🗄️ Generando Cliente Prisma..."
npx prisma generate

# IMPORTANTE: Asegurarse que existe .env en el servidor
if [ ! -f ".env" ]; then
    echo "⚠️ ADVERTENCIA: No se encontró archivo .env."
    echo "Creando .env de ejemplo. POR FAVOR EDITALO CON TUS DATOS REALES."
    cat > .env <<EOL
DATABASE_URL="postgresql://grana3d:$DB_PASS@localhost:5432/grana3d?schema=public"
# Generar uno nuevo con: openssl rand -base64 32
JWT_SECRET="cambiar_esto_por_secreto_seguro"
NEXTAUTH_SECRET="cambiar_esto_por_secreto_seguro"
NEXTAUTH_URL="https://$DOMAIN"
# Cloudinary
CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"
EOL
    echo "⏸️  Script pausado. Edita el .env en $INSTALL_DIR y vuelve a correr el script."
    exit 1
fi

echo "🗃️ Sincronizando base de datos (db push)..."
npx prisma db push

echo "🏗️ Construyendo aplicación Next.js..."
npm run build

# 4. Gestión de Procesos (PM2)
echo "🚀 Reiniciando PM2..."
pm2 describe $APP_NAME > /dev/null
RUNNING=$?

if [ $RUNNING -ne 0 ]; then
    pm2 start npm --name "$APP_NAME" -- start -- -p $PORT
else
    pm2 reload $APP_NAME
fi
pm2 save

# 5. Configuración Nginx
echo "🌐 Verificando configuración Nginx..."
NGINX_CONF="/etc/nginx/sites-available/$APP_NAME"

if [ ! -f "$NGINX_CONF" ]; then
    echo "Creando configuración Nginx..."
    cat > $NGINX_CONF <<EOL
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOL
    # Activar sitio
    ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
    nginx -t && systemctl restart nginx
    
    echo "🔒 Obteniendo certificado SSL (Certbot)..."
    # Requiere certbot instalado
    if command -v certbot &> /dev/null; then
        certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN --redirect
    else
        echo "⚠️ Certbot no instalado. Instálalo para tener HTTPS."
    fi
fi

echo "✅ DESPLIEGUE FINALIZADO EXITOSAMENTE!"
echo "🌍 App corriendo en: http://$DOMAIN"
