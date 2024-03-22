FROM ghcr.io/puppeteer/puppeteer:22.4.1 AS builder

WORKDIR /usr/src/app

ENV NODE_ENV=development

COPY package*.json nx.json ./

RUN npm ci

COPY . .

RUN npx nx run puppeteer:build

# Stage 2 prepare the production build
FROM ghcr.io/puppeteer/puppeteer:22.4.1 AS production

ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production

WORKDIR /app

COPY --from=builder /usr/src/app/dist/apps/puppeteer ./

# Start the application
CMD ["node", "main.js"]