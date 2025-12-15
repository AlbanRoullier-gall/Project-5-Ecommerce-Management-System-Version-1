FROM node:18-alpine

WORKDIR /app

# Build arguments for environment variables (needed during build)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Copy shared-types first (needed for npm install)
COPY shared-types/ ./shared-types/

# Copy package files from frontend directory
COPY frontend/package*.json ./

# Fix the shared-types path in package.json for Docker context
# In Docker, shared-types is at ./shared-types, not ../shared-types
RUN sed -i 's|"file:../shared-types"|"file:./shared-types"|g' package.json

RUN npm install

# Copy frontend source files
COPY frontend/ .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
