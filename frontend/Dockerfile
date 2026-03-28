# Stage 1: Build the Vue application
FROM node:20-alpine AS builder

WORKDIR /app

# Set build-time environment variable for the API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Copy the build output from the builder stage to Nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 81

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
