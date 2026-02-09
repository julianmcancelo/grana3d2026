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

    if [ -x "./node_modules/.bin/prisma" ]; then
        echo "🔎 Prisma Version:"
        ./node_modules/.bin/prisma -v

        if ./node_modules/.bin/prisma db push --accept-data-loss; then
            echo "✅ Sincronización exitosa."
        else
            echo "❌ ERROR: Falló 'prisma db push'. Verifica 'DATABASE_URL'."
            echo "   Continuando inicio de aplicación (puede fallar si la BD no está lista)..."
        fi
    else
        echo "⚠️ Prisma CLI no está disponible en runtime. Saltando db push."
    fi
else
    echo "⚠️ DATABASE_URL no definida. Saltando db push."
fi
 
if [ -x "./node_modules/.bin/prisma" ]; then
    echo "🔄 Generando Prisma Client (Runtime)..."
    ./node_modules/.bin/prisma generate
else
    echo "ℹ️ Prisma Client ya debe venir generado desde build (standalone)."
fi

echo "🟢 Iniciando aplicación..."
exec node server.js
