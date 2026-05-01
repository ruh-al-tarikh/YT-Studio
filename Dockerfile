FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY pnpm-lock.yaml package.json ./
RUN pnpm install
COPY . .
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --prod
COPY --from=builder /app/dist ./dist
COPY server.js ./
EXPOSE 3000
CMD ["node", "server.js"]
