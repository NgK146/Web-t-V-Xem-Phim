FROM node:22-alpine

WORKDIR /app

# Install dependencies separately to cache them
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Expose backend port
EXPOSE 5001

# Command to run the application
CMD ["npm", "start"]
