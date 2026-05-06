FROM node:20-alpine
WORKDIR /app

# Install global dependencies only
RUN npm install -g @google/generative-ai dotenv

# Copy only what's needed for the script
COPY scripts/ ./scripts/
COPY package.json ./

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "scripts/auto-enhance.js"]
