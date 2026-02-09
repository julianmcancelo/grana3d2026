#!/bin/bash
echo "🔌 Estableciendo túnel SSH a la base de datos remota..."
echo "Podrás acceder a la base de datos en: localhost:5433 (para no chocar con tu Postgres local)"

# Mapea el puerto remoto 5432 al local 5433
# Usa la IP interna de Docker si la DB está en un contenedor, o localhost si está en el host
ssh -L 5433:10.0.1.75:5432 -p 5169 root@179.43.120.168 -N

if [ $? -eq 0 ]; then
    echo "✅ Túnel establecido."
else
    echo "❌ Error al conectar. Verifica tu clave SSH o contraseña."
fi
