FROM node:18-alpine

WORKDIR /app

# Copy package files from frontend directory
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source files
COPY frontend/ .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
