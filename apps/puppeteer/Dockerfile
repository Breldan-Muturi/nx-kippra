FROM ghcr.io/puppeteer/puppeteer:22.4.1

ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    PORT=3333 \
    NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY apps/puppeteer/ .

RUN npm run build

EXPOSE ${PORT}

USER node

CMD ["npm", "run" "start:prod"]