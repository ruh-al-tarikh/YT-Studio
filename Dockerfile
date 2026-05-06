FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm @pnpm/core
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --no-optional || pnpm install --no-optional
COPY . .
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "scripts/auto-enhance.js"]
