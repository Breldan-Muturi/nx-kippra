FROM node:lts-alpine AS base

RUN apk add libc6-compat --no-cache

WORKDIR /app

# Copy the main workspace package.json, package-lock.json, and Nx configuration files
COPY package.json .
COPY nx.json .
COPY package-lock.json .
COPY tsconfig.base.json .

# Create the directory to add the code for the portal
RUN mkdir -p apps/portal 
COPY apps/portal/project.json apps/portal/next.config.js apps/portal/

# Install the root dependencies
COPY prisma ./prisma
RUN npm ci && npx prisma generate


# Copy the app directory into the container
COPY apps/portal/ apps/portal/

# Build the Next.js application
# Use the Nx CLI to do this, which knows how to handle the monorepo structure
RUN npx nx build portal


FROM node:lts-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir -p .next/cache/fetch-cache
RUN chown -R nextjs:nodejs /app

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=base --chown=nextjs:nodejs /app/apps/portal/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/portal/public ./public

USER nextjs

EXPOSE 4000

ENV PORT 4000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node_modules/.bin/next", "start"]