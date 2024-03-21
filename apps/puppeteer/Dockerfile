FROM ghcr.io/puppeteer/puppeteer:22.4.1

ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    PORT=3333 \
    NODE_ENV=production

WORKDIR /usr/src/app

RUN apt-get update && \
    apt-get install -y curl && \
    curl sL https://deb.nodesource.com/setup_14.x | bash - && \
    apt-get install -y nodejs

COPY package*.json ./
RUN npm ci
COPY apps/puppeteer/ .

# Create the puppeteer user
RUN useradd -m puppeteer

USER puppeteer
EXPOSE ${PORT}

CMD ["npm", "run" "start:prod"]