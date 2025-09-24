FROM node:18-alpine

WORKDIR /app

# Copy package files from backoffice directory
COPY backoffice/package*.json ./
RUN npm install

# Copy backoffice source files
COPY backoffice/ .

# Copy shared types
COPY shared-types/ ./shared-types/

EXPOSE 3000

# Start Next.js in development mode
CMD ["npm", "run", "dev"]
