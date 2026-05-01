FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production --no-audit --fund=false
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
