# Base stage for shared environment setup
FROM node:lts-alpine AS base

# Install libc6-compat due to potential native dependencies such as sharp
RUN apk add libc6-compat --no-cache

WORKDIR /app

# Dependencies stage to install all required packages
FROM base AS deps

COPY package*json nx.json tsconfig.base.json ./
COPY prisma ./prisma
# Install root dependencies
RUN npm ci && npx prisma generate

# Copying specific Next.js app dependencies and configurations
COPY apps/portal/project.json apps/portal/next.config.js apps/portal/

# Builder stage to compile the Next.js application using Nx
FROM deps AS builder

COPY . .
# Build the Next.js application
RUN npx nx run portal:build:production

# Production stage for running the Next.js app
FROM base AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Add non-root user for security purposes
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy necessary files to install production dependencies
# COPY --from=builder /app/package*.json ./
# # Install only production dependencies
# RUN npm ci --only=production

# Copy built artifacts from the builder stage 
COPY --from=builder --chown=nextjs:nodejs /app/apps/portal/.next/ ./.next/
COPY --from=builder --chown=nextjs:nodejs /app/apps/portal/public ./public

# Adjust the COPY command for server.js to match its actual location
COPY --from=builder --chown=nextjs:nodejs /app/apps/portal/.next/standalone/apps/portal/server.js ./server.js 
# Correct permission setup for .next/cache
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next/cache

USER nextjs

EXPOSE 4000

ENV PORT 4000
ENV HOSTNAME 0.0.0.0

CMD ["node", "server.js"]
