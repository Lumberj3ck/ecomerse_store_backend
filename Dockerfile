# Use Node.js LTS version as required by Medusa
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install system dependencies required for Medusa
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to resolve SWC conflicts
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the Medusa application
RUN npm run build

# Expose the default Medusa port
EXPOSE 9000

# Start Medusa server
CMD ["npm", "start"]