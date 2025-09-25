FROM node:18-alpine

WORKDIR /app

# Copy shared-types depuis la racine du projet
COPY shared-types/ ./shared-types/

# Copy package files
COPY services/customer-service/package*.json ./
COPY services/customer-service/tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY services/customer-service/src/ ./src/

# Build TypeScript
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

EXPOSE 3001

CMD ["npm", "start"]
