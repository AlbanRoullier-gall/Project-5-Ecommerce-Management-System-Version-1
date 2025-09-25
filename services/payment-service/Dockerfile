FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

COPY src/ ./src/
RUN npm run build
RUN npm prune --production

EXPOSE 3006

CMD ["npm", "start"]
