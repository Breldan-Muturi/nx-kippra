# Use an official Node runtime as a parent image
FROM node:lts-alpine

# Set Puppeteer-related environment variables
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production

# Install necessary dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set working directory
WORKDIR /usr/src/app

# Copy only package.json and package-lock.json (or npm-shrinkwrap.json) initially
# This is done to leverage Docker cache to speed up build times
COPY package*.json nx.json ./

# Install dependencies
RUN npm install

# Assuming your Nx workspace configuration and necessary scripts are in the root,
# you need to copy the whole workspace into the Docker image
# This includes the apps and libs directories of your Nx workspace
COPY . .

# Build your NestJS application using Nx CLI
# Replace 'puppeteer-app' with the actual name of your NestJS app within the Nx workspace
RUN npx nx build puppeteer

# Change the working directory to the distribution directory of your NestJS app
# This path needs to be adjusted based on your Nx workspace configuration
WORKDIR /usr/src/app/dist/apps/puppeteer

# Start your NestJS application
CMD ["node", "main.js"]
