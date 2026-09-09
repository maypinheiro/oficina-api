FROM node:22-alpine AS base
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY jest.config.js ./
COPY eslint.config.js ./
COPY prisma ./prisma
COPY scripts ./scripts
COPY src ./src

RUN npm run prisma:generate
RUN npm run build

RUN chown -R node:node /app
USER node

EXPOSE 3000
CMD ["npm", "run", "start"]
