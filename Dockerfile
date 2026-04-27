# Stage 1: Minimal builder - use distroless or static approach
# Don't install dev dependencies at all - use static files only
FROM scratch AS static
COPY . /app

# Stage 2: Production Nginx Alpine (latest patched version)
FROM nginx:1.30-alpine

LABEL maintainer="ruhdevops"
LABEL description="Ruh Al Tarikh - Islamic History Archive (Production Hardened)"
LABEL version="1.0.0"
LABEL security="hardened"

# Update Alpine packages to latest patched versions + remove unnecessary packages
RUN apk update && apk upgrade && \
    apk del --no-cache curl wget nghttp2 c-ares libunistring libidn2 && \
    apk add --no-cache tini ca-certificates && \
    rm -rf /var/cache/apk/* /var/cache/* /tmp/* /var/tmp/*

# Copy nginx configuration for SPA routing (secure)
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
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com https://static.cloudflareinsights.com https://readme-typing-svg.herokuapp.com https://*.ytimg.com https://www.youtube.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; img-src 'self' data: https: https://i.ytimg.com https://github.com https://raw.githubusercontent.com https://readme-typing-svg.herokuapp.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https: wss:; frame-src https://www.youtube.com; media-src https:" always;

  # SPA routing
  location / {
    try_files \$uri \$uri/ /index.html;
  }

  # Static assets caching
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 365d;
    add_header Cache-Control "public, immutable";
    access_log off;
  }

  # HTML no-cache
  location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
  }

  # Gzip
  gzip on;
  gzip_vary on;
  gzip_comp_level 6;
  gzip_types text/plain text/css application/json application/javascript;
  gzip_min_length 1000;
  
  # Block unwanted methods
  if (\$request_method !~ ^(GET|HEAD|OPTIONS)$) {
    return 405;
  }

  # Block hidden files
  location ~ /\. {
    deny all;
    access_log off;
  }
}
EOF

# Copy ONLY production files from source (no node_modules, no build tools)
COPY --from=static /app /usr/share/nginx/html/

# Clean up unnecessary files
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
    /usr/share/nginx/html/wrangler.jsonc && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html /etc/nginx

# Create nginx cache directories
RUN mkdir -p /var/cache/nginx/client_temp && \
    chmod 700 /var/cache/nginx/client_temp && \
    chown -R nginx:nginx /var/cache/nginx && \
    mkdir -p /var/run/nginx && \
    chown -R nginx:nginx /var/run/nginx

# Use tini as init
ENTRYPOINT ["/sbin/tini", "--"]

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD [ -f /usr/share/nginx/html/index.html ] || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
