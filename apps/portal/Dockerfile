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
COPY apps/portal/project.json apps/portal/

# Install the root dependencies
COPY prisma ./prisma
RUN npm ci && npx prisma generate


# Copy the app directory into the container
COPY apps/portal/ apps/portal/

# Build the Next.js application
# Use the Nx CLI to do this, which knows how to handle the monorepo structure
RUN npx nx build portal


# # Multi-stage build: Start from a fresh base image for the production environment
# FROM node:lts-alpine AS production

# # Set the working directory
# WORKDIR /app

# #  Copy over the built app and its dependencies from the previous stage
# COPY --from=base /app/apps/portal/.next ./.next
# COPY --from=base /app/node_modules ./node_modules
# COPY --from=base /app/apps/portal/public ./public

# # Change ownership of the /app directory to the node user
# RUN chown -R node:node /app

# # Set the user to non-root for security purposes
# USER node

# # Set environment variables
# ENV NODE_ENV production
# ENV HOSTNAME "0.0.0.0"
# ENV PORT 4000
# EXPOSE ${PORT}


# # Run the Next.js application using the built-in server
# CMD ["node_modules/.bin/next", "start"]
# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=base /app/apps/portal/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=base --chown=nextjs:nodejs /app/apps/portal/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/apps/portal/.next/static ./.next/static

USER nextjs

EXPOSE 4000

ENV PORT 4000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]