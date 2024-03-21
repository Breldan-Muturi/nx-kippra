# Start with a Node.js base image
FROM node:lts-alpine as builder

# Set up environment variables for Puppeteer to skip its download as we'll install dependencies manually
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    # Temporarily set NODE_ENV to development to ensure dev dependencies are installed
    NODE_ENV=development

# Install necessary dependencies for running Puppeteer under Alpine
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker caching
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy the rest of your Nx workspace into the container
COPY . .

# Build your NestJS application. Replace 'puppeteer' with your actual app name.
RUN npx nx build puppeteer

# Stage 2: Setup the runtime environment
FROM node:lts-alpine

ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production

WORKDIR /usr/src/app/

# Copy the built app from the builder stage to the current stage
COPY --from=builder /usr/src/app/package*.json ./

RUN npm ci --only=production

# Copy over the necessary runtime dependencies for Puppeteer from the builder stage
COPY --from=builder /usr/lib/chromium/ /usr/lib/chromium/
COPY --from=builder /usr/lib/chromium-browser/ /usr/lib/chromium-browser/
COPY --from=builder /usr/src/app/dist/apps/puppeteer ./dist/apps/puppeteer

WORKDIR /usr/src/app/dist/apps/puppeteer

# Start the application
CMD ["node", "main.js"]
