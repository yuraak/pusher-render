# Dockerfile
FROM node:14

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the source code
COPY . .

# Build the React app for production
RUN npm run build

# Install `serve` to serve the static files
RUN npm install -g serve

# Use the PORT environment variable provided by Render
ENV PORT 10000

# Expose the port
EXPOSE 10000

# Use `serve` to serve the production build
CMD ["serve", "-s", "build", "-l", "10000"]