FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --production
COPY . .
RUN pnpm run build
EXPOSE 3000
CMD ["node", "server.js"]
