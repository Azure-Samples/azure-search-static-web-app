# Use an official Node.js runtime as a base image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy the static files to the container
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Use a simple HTTP server to serve the static files
RUN npm install -g http-server

# Start the HTTP server
CMD ["http-server", "-p", "3000"]