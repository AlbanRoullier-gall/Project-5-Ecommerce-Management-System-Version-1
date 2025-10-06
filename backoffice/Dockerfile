FROM node:18-alpine

WORKDIR /app

# Copy package files from backoffice directory
COPY backoffice/package*.json ./
RUN npm install

# Copy backoffice source files
COPY backoffice/ .

RUN npm run build

EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "start"]
