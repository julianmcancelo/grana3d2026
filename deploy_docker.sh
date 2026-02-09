#!/bin/bash
set -e

APP_NAME="grana3d-app"
PROJECT_DIR="/var/www/grana3d-next"

echo "🚀 Docker Rebuild (Direct Mode)..."

cd "$PROJECT_DIR"

# 1. Check Env
if [ ! -f ".env" ]; then
    echo "⚠️ .env file missing! Copying example..."
    cp .env.example .env
fi

# 2. Stop Services
if command -v pm2 &> /dev/null; then
    pm2 stop all || true
fi

# 3. Docker Compose
echo "🐳 Rebuilding..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo "✅ Deployment Complete."
echo "📜 Logs: docker logs -f $APP_NAME"
