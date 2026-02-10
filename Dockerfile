# Base
FROM public.ecr.aws/docker/library/node:20-alpine AS base

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
# Generar cliente Prisma antes del build para que Next.js lo encuentre
RUN npx prisma generate
RUN npm run build

# Runner
# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# Crear usuario
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Instalar dependencias de producción (Standard Build)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copiar build artifacts
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Asegurar uploads
RUN mkdir -p ./public/uploads && chown -R nextjs:nodejs ./public/uploads

# Instalar Prisma CLI para migraciones
RUN npm install prisma@6.19.2

# Scripts y utilidades
RUN apk add --no-cache dos2unix openssl
COPY start.sh ./
RUN dos2unix start.sh && chmod +x start.sh

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/bin/sh", "start.sh"]
