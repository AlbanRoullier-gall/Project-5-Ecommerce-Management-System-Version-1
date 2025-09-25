FROM node:18-alpine

WORKDIR /app

# Copy shared-types depuis la racine du projet
COPY shared-types/ ./shared-types/

# Copy package files from backoffice directory
COPY backoffice/package*.json ./
RUN npm install

# Copy backoffice source files
COPY backoffice/ .

EXPOSE 3000

# Start Next.js in development mode
CMD ["npm", "run", "dev"]
