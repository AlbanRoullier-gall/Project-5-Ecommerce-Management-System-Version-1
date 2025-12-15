FROM node:18-alpine

WORKDIR /app

# Build arguments for environment variables (needed during build)
ARG NEXT_PUBLIC_API_URL

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy shared-types first (needed for npm install)
COPY shared-types/ ./shared-types/

# Copy package files from backoffice directory
COPY backoffice/package*.json ./
RUN npm install

# Copy backoffice source files
COPY backoffice/ .

RUN npm run build

EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "start"]
