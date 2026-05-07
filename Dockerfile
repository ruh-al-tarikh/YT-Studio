# Multi-stage build for YT Studio
# Stage 1: Build (optional - use pre-built dist)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod

# Stage 2: Runtime
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copy built assets (or pre-built dist)
COPY dist/ .

# Nginx config for SPA routing
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  
  # Cache strategy for static assets
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
  
  # SPA fallback
  location / {
    try_files \$uri \$uri/ /index.html;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
  }
  
  # API proxy to Cloudflare Worker
  location /api/ {
    proxy_pass https://yt-studio-youtube-api-prod.ruhdevopsytstudio.workers.dev/;
    proxy_http_version 1.1;
    proxy_set_header Host yt-studio-youtube-api-prod.ruhdevopsytstudio.workers.dev;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_pragma \$http_authorization;
    add_header X-Cache-Status \$upstream_cache_status;
  }
  
  # Security headers
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Permissions-Policy "accelerometer=(), camera=(), microphone=(), geolocation=()" always;
}
EOF

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=5s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
