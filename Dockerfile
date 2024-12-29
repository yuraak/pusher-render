# Base image
FROM node:18

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy app source code
COPY . .

# Set environment variables
ENV PORT=3000

# Expose the frontend port
EXPOSE 3000

# Command to run the React app
CMD ["npm", "start"]