#!/bin/sh
set -e

echo "🚀 Iniciando contenedor..."

# Sincronizar base de datos (DB Push)
if [ -n "$DATABASE_URL" ]; then
    echo "🗃️ Sincronizando esquema de base de datos..."
    # Usamos npx porque prisma no está en el PATH global necesariamente,
    # pero sí en node_modules si lo instalamos en el runner.
    # O si copiamos el binario.
    
    # Intento 1: npx prisma db push
    npx prisma db push --accept-data-loss
else
    echo "⚠️ DATABASE_URL no definida. Saltando db push."
fi

echo "🟢 Iniciando aplicación..."
exec node server.js
