FROM node:18-alpine

WORKDIR /app

# Copy shared-types depuis la racine du projet
COPY shared-types/ ./shared-types/

# Copy package files
COPY services/product-service/package*.json ./
COPY services/product-service/tsconfig.json ./
RUN npm install

# Copy source code
COPY services/product-service/src/ ./src/
RUN npm run build
RUN npm prune --production

EXPOSE 3002

CMD ["npm", "start"]
