FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Build the Next.js app for production
RUN npm run build

# Expose port
EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "start"]
