# Stage 1: Build the React app
FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./

# Use npm mirror for faster installation
RUN npm config set registry https://registry.npmmirror.com

# Install dependencies
RUN npm install --no-cache
COPY . .

# Set the build argument and environment variable for React
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Build the app
RUN npm run build

# Check if build succeeded
RUN test -f /app/build/index.html || (echo "Build failed: index.html not found in /app/build" && exit 1)

# Stage 2: Serve the React app with nginx
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

