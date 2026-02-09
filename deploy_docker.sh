#!/bin/bash
set -e

APP_NAME="grana3d-app"
REPO_DIR="/var/www/grana3d-next"
REPO_URL="https://github.com/julianmcancelo/grana3d2026.git"

echo "🚀 Starting Docker Deployment..."

# 1. Prepare Directory
if [ ! -d "$REPO_DIR" ]; then
    echo "⬇️ Cloning repository..."
    git clone "$REPO_URL" "$REPO_DIR"
else
    echo "🔄 Updating repository..."
    cd "$REPO_DIR"
    git pull
fi

cd "$REPO_DIR"

# 2. Check Env
if [ ! -f ".env" ]; then
    echo "⚠️ .env file missing! Creating example..."
    cp .env.example .env
    echo "❌ Please edit .env with real values (DB password, etc.) and run this script again."
    exit 1
fi

# 3. Stop conflicting services (PM2, Nginx if running outside Docker)
if command -v pm2 &> /dev/null; then
    echo "🛑 Stopping PM2 processes to free ports..."
    pm2 stop all || true
fi

if systemctl is-active --quiet nginx; then
    echo "🛑 Stopping local Nginx to allow Docker Nginx/App binding..."
    systemctl stop nginx || true
fi

# 4. Docker Compose
echo "🐳 Building and Starting Containers..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo "✅ Deployment Complete."
echo "📜 Check logs with: docker logs -f $APP_NAME"
