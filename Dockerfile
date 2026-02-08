# Base
FROM node:20-alpine AS base

# Deps
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Instalar dependencias (incluyendo devDeps para build)
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generar Prisma Client
RUN npx prisma generate
# Build Next.js
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
# Crear usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios para standalone
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar schema prisma y script de inicio
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --chown=nextjs:nodejs start.sh ./start.sh
RUN chmod +x ./start.sh

# Asegurar que el usuario nextjs sea dueño de todo /app para poder instalar paquetes y escribir
RUN chown -R nextjs:nodejs /app

USER nextjs
# Instalar Prisma CLI localmente como usuario nextjs
RUN npm install prisma@7.3.0 --no-save

# Prisma CLI se usa con npx prisma en start.sh
# (ahora instalado localmente)

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["./start.sh"]
