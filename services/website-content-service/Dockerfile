FROM node:18-alpine

WORKDIR /app

# Copy shared-types depuis la racine du projet
COPY shared-types/ ./shared-types/

# Copy package files
COPY services/website-content-service/package*.json ./
COPY services/website-content-service/tsconfig.json ./
RUN npm install

# Copy source code
COPY services/website-content-service/src/ ./src/
RUN npm run build
RUN npm prune --production

EXPOSE 3005

CMD ["npm", "start"]
