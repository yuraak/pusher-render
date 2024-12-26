# Base image
FROM node:16

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install
RUN npm install -g concurrently

# Copy app source code
COPY . .

# Set environment variables
ENV PORT=3000

# Expose application ports
EXPOSE 3000
EXPOSE 3001

# Command to run both proxy and frontend
CMD ["concurrently", "\"node proxyServer.js\"", "\"npm start\""]