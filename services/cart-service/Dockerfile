FROM node:18-alpine

WORKDIR /app

# Copy shared-types depuis la racine du projet
COPY shared-types/ ./shared-types/

# Copy package files
COPY services/cart-service/package*.json ./
COPY services/cart-service/tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY services/cart-service/src/ ./src/

# Build TypeScript
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

EXPOSE 3004

CMD ["npm", "start"]
