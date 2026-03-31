# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
# Remove default nginx static assets
RUN rm -rf ./*
# Copy from builder
COPY --from=builder /app/dist .

# Custom Nginx config to listen on 3000 and handle SPA routing
RUN printf "server { \n\
    listen 3000; \n\
    server_name localhost; \n\
    resolver 127.0.0.11 valid=30s; \n\
    set \$backend_url http://backend:5000; \n\
    location / { \n\
        root /usr/share/nginx/html; \n\
        index index.html index.htm; \n\
        try_files \$uri \$uri/ /index.html; \n\
    } \n\
    location ~ ^/api/(.*)$ { \n\
        proxy_pass \$backend_url/api/\$1\$is_args\$args; \n\
        proxy_http_version 1.1; \n\
        proxy_set_header Upgrade \$http_upgrade; \n\
        proxy_set_header Connection 'upgrade'; \n\
        proxy_set_header Host \$host; \n\
        proxy_cache_bypass \$http_upgrade; \n\
    } \n\
    location ~ ^/uploads/(.*)$ { \n\
        proxy_pass \$backend_url/uploads/\$1; \n\
        proxy_http_version 1.1; \n\
        proxy_set_header Host \$host; \n\
    } \n\
    location ~ ^/socket.io/(.*)$ { \n\
        proxy_pass \$backend_url/socket.io/\$1\$is_args\$args; \n\
        proxy_http_version 1.1; \n\
        proxy_set_header Upgrade \$http_upgrade; \n\
        proxy_set_header Connection 'Upgrade'; \n\
        proxy_set_header Host \$host; \n\
    } \n\
}" > /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
