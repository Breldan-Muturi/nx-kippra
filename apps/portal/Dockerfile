FROM node:lts-alpine AS base

RUN apk add libc6-compat --no-cache

WORKDIR /app

# Copy the main workspace package.json, package-lock.json, and Nx configuration files
COPY ../../package.json . \
    ../../nx.json ./ \
    ../../package-lock.json ./ \
    project.json ./

# Install the root dependencies
RUN npm ci

# Copy the rest of the application files into the container
COPY apps/portal/ .

# Build the Next.js application
# Use the Nx CLI to do this, which knows how to handle the monorepo structure
RUN npx nx build portal


# Multi-stage build: Start from a fresh base image for the production environment
FROM node:lts-alpine AS production

# Set the working directory
WORKDIR /app

#  Copy over the built app and its dependencies from the previous stage
COPY --from=base /app/apps/portal/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/portal/public ./public

# Set environment variables
ENV NODE_ENV production
ENV HOSTNAME "0.0.0.0"
ENV PORT 4000
EXPOSE ${PORT}

# Set the user to non-root for security purposes
USER node

# Run the Next.js application using the built-in server
CMD ["node_modules/.bin/next", "start"]
