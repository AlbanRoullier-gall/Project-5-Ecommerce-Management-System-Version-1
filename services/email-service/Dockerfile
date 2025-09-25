FROM node:18-alpine

WORKDIR /app

# Copy shared-types depuis la racine du projet
COPY shared-types/ ./shared-types/

# Copy package files
COPY services/email-service/package*.json ./
COPY services/email-service/tsconfig.json ./
RUN npm install

# Copy source code
COPY services/email-service/src/ ./src/
RUN npm run build
RUN npm prune --production

EXPOSE 3007

CMD ["npm", "start"]
