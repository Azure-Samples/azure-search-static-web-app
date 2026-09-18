# Stage 1: build the Vite app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: serve the built static site
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/build ./build
COPY docker-entrypoint.sh /docker-entrypoint.sh
COPY static-server.mjs ./static-server.mjs
RUN sed -i 's/\r$//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh
ENV PORT=3000
EXPOSE 3000
ENTRYPOINT ["/docker-entrypoint.sh"]
