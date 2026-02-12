# Base
FROM public.ecr.aws/docker/library/node:22-alpine AS base

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
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Crear usuario
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar build artifacts (Standalone Mode)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Instalar Prisma CLI para migraciones (única dependencia necesaria en runner si usas start.sh para db push)
# Si falla la red, esto podría fallar, pero es menos probable que un npm ci completo.
# Intentamos usar la caché de npm si es posible o instalarlo explícitamente.
RUN npm install prisma@6.19.2

# Scripts y utilidades
RUN apk add --no-cache dos2unix openssl
COPY start.sh ./
RUN dos2unix start.sh && chmod +x start.sh

# Asegurar permisos en uploads y en toda la carpeta app para evitar errores de Prisma
RUN mkdir -p ./public/uploads && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/bin/sh", "start.sh"]
