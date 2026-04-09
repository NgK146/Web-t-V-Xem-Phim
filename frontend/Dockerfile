# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Define build arguments that will be passed from docker-compose
ARG REACT_APP_API_URL
ARG REACT_APP_SOCKET_URL
ARG REACT_APP_PAYOS_CLIENT_ID
ARG REACT_APP_PAYOS_API_KEY
ARG REACT_APP_PAYOS_CHECKSUM_KEY

# Set them as environment variables during build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_SOCKET_URL=$REACT_APP_SOCKET_URL
ENV REACT_APP_PAYOS_CLIENT_ID=$REACT_APP_PAYOS_CLIENT_ID
ENV REACT_APP_PAYOS_API_KEY=$REACT_APP_PAYOS_API_KEY
ENV REACT_APP_PAYOS_CHECKSUM_KEY=$REACT_APP_PAYOS_CHECKSUM_KEY

# Copy package and install dependencies
COPY package*.json ./
RUN npm install

# Copy app and build it
COPY . .
RUN npm run build

# Serve stage using Nginx
FROM nginx:alpine

# Copy built app to nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Replace default Nginx configuration to support SPA React routing
RUN echo 'server { \
    listen       80; \
    server_name  localhost; \
    location / { \
        root   /usr/share/nginx/html; \
        index  index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    error_page   500 502 503 504  /50x.html; \
    location = /50x.html { \
        root   /usr/share/nginx/html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
