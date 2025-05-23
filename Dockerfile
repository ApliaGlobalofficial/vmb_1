# Use the Node.js official image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies, including NestJS CLI
RUN npm install

# Ensure NestJS CLI is available globally
RUN npm install -g @nestjs/cli

# Copy all files into the container
COPY . .

# Build the app
RUN npm run build

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
