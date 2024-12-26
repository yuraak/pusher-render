# Base image
FROM node:18

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Set environment variables
ENV PORT=3000
ENV PROXY_PORT=5000

# Expose application ports
EXPOSE 3000
EXPOSE 5000

# Command to run both proxy and frontend
CMD ["npm", "start"]