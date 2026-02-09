#!/bin/sh
set -e

echo "🚀 Iniciando contenedor..."

# Sincronizar base de datos (DB Push)
if [ -n "$DATABASE_URL" ]; then
    echo "🔍 Verificando configuración de base de datos..."
    
    if echo "$DATABASE_URL" | grep -q "localhost" || echo "$DATABASE_URL" | grep -q "127.0.0.1"; then
        echo "⚠️  ADVERTENCIA: DATABASE_URL contiene 'localhost' o '127.0.0.1'."
        echo "    En Docker, esto se refiere al PROPIO CONTENEDOR, no al VPS."
        echo "    Si tu base de datos está en el VPS, usá la IP interna de Docker (ej. 172.17.0.1) o la IP pública."
    fi

    echo "🗃️ Sincronizando esquema de base de datos..."
    # Intenta usar npx prisma, si falla, busca el binario local
    if npx prisma db push --accept-data-loss; then
        echo "✅ Sincronización exitosa."
    else
        echo "❌ ERROR: Falló 'prisma db push'."
        echo "   Intentando fallback a binario local..."
        ./node_modules/.bin/prisma db push --accept-data-loss || echo "❌ Fallback también falló. Continuando..."
    fi
else
    echo "⚠️ DATABASE_URL no definida. Saltando db push."
fi

echo "🔄 Generando Prisma Client (Runtime)..."
npx prisma generate || ./node_modules/.bin/prisma generate

echo "🟢 Iniciando aplicación..."
exec node server.js
