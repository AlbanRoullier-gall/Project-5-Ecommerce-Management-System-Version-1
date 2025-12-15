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

# Fix the shared-types path in package.json for Docker context
# In Docker, shared-types is at ./shared-types, not ../shared-types
RUN node -e "const fs=require('fs');const pkg=JSON.parse(fs.readFileSync('package.json'));if(pkg.dependencies&&pkg.dependencies['@tfe/shared-types']){pkg.dependencies['@tfe/shared-types']='file:./shared-types';fs.writeFileSync('package.json',JSON.stringify(pkg,null,2));}"

RUN npm install

# Copy backoffice source files
COPY backoffice/ .

# Verify that dto and shared-types exist
RUN ls -la dto/ && echo "---" && ls -la shared-types/ && echo "---" && cat dto/index.ts

RUN npm run build

EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "start"]
