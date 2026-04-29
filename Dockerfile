# Stage 1: Minimal static copy (no build tools)
FROM scratch AS static
COPY . /app

# Stage 2: Production Nginx Alpine (latest patched)
FROM nginx:1.30-alpine

LABEL maintainer="ruhdevops"
LABEL description="YT Studio - Islamic History Archive (Production Hardened)"
LABEL version="1.0.0"
LABEL security="hardened"

# Update & secure: upgrade packages, remove unnecessary packages
RUN apk update && apk upgrade && \
    apk del --no-cache curl wget nghttp2 c-ares libunistring libidn2 && \
    apk add --no-cache tini ca-certificates && \
    rm -rf /var/cache/apk/* /var/cache/* /tmp/* /var/tmp/*

# Copy nginx configuration for SPA routing (with API proxy)
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  charset utf-8;
  
  # Security headers
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "no-referrer-when-downgrade" always;
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com https://static.cloudflareinsights.com https://readme-typing-svg.herokuapp.com https://*.ytimg.com https://www.youtube.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; img-src 'self' data: https: https://i.ytimg.com https://github.com https://raw.githubusercontent.com https://readme-typing-svg.herokuapp.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https: wss: http://localhost:3000; frame-src https://www.youtube.com; media-src https:" always;

  # API proxy (to Cloudflare Workers or Express backend)
  location /api/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;
    proxy_intercept_errors on;
  }

  # SPA routing
  location / {
    try_files \$uri \$uri/ /index.html;
  }

  # Static assets caching (1 year)
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 365d;
    add_header Cache-Control "public, immutable";
    access_log off;
  }

  # Public folder
  location /public/ {
    expires 1h;
    add_header Cache-Control "public, max-age=3600";
  }

  # HTML no-cache
  location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
  }

  # Gzip compression
  gzip on;
  gzip_vary on;
  gzip_comp_level 6;
  gzip_types text/plain text/css application/json application/javascript;
  gzip_min_length 1000;
  
  # Block unwanted HTTP methods
  if (\$request_method !~ ^(GET|HEAD|OPTIONS|POST)$) {
    return 405;
  }

  # Block hidden files
  location ~ /\. {
    deny all;
    access_log off;
  }
}
EOF

# Copy ONLY production files from source
COPY --from=static /app /usr/share/nginx/html/

# Clean up unnecessary files (keep only web assets)
RUN rm -rf /usr/share/nginx/html/node_modules \
    /usr/share/nginx/html/.git \
    /usr/share/nginx/html/.github \
    /usr/share/nginx/html/.circleci \
    /usr/share/nginx/html/Dockerfile \
    /usr/share/nginx/html/package*.json \
    /usr/share/nginx/html/*.md \
    /usr/share/nginx/html/src \
    /usr/share/nginx/html/.dockerignore \
    /usr/share/nginx/html/.editorconfig \
    /usr/share/nginx/html/.prettierrc \
    /usr/share/nginx/html/vite.config.js \
    /usr/share/nginx/html/wrangler.jsonc \
    /usr/share/nginx/html/wrangler.toml \
    /usr/share/nginx/html/workflows-starter \
    /usr/share/nginx/html/yt-studio-api \
    /usr/share/nginx/html/schema.sql && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html /etc/nginx

# Use tini as init process
ENTRYPOINT ["/sbin/tini", "--"]

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD [ -f /usr/share/nginx/html/index.html ] || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
