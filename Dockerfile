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
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
# Crear usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios para standalone
# Copiar archivos necesarios para standalone
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Asegurar que el directorio de uploads exista y tenga permisos correctos
RUN mkdir -p ./public/uploads && chown nextjs:nodejs ./public/uploads
RUN chown nextjs:nodejs /app

# Install Prisma CLI explicitly to avoid npx fetching incompatible latest versions
RUN npm install -g prisma@6.19.2

# Install dos2unix to fix Windows line endings
RUN apk add --no-cache dos2unix

COPY start.sh ./
RUN dos2unix start.sh && chmod +x start.sh && chown nextjs:nodejs start.sh

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["/bin/sh", "start.sh"]
