FROM node:18-alpine

WORKDIR /app

# Copy shared-types depuis la racine du projet
COPY shared-types/ ./shared-types/

# Copy package files
COPY services/payment-service/package*.json ./
COPY services/payment-service/tsconfig.json ./
RUN npm install

# Copy source code
COPY services/payment-service/src/ ./src/
RUN npm run build
RUN npm prune --production

EXPOSE 3006

CMD ["npm", "start"]
