/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // Help webpack resolve @tfe/shared-types and dto
    const path = require("path");
    const fs = require("fs");
    const sharedTypesPath = path.resolve(__dirname, "node_modules/@tfe/shared-types");
    const sharedTypesFallback = path.resolve(__dirname, "shared-types");
    const dtoPath = path.resolve(__dirname, "dto");
    
    config.resolve.alias = {
      ...config.resolve.alias,
      "@tfe/shared-types": fs.existsSync(sharedTypesPath) 
        ? sharedTypesPath 
        : sharedTypesFallback,
      // Add alias for dto to help resolve relative imports
      "dto": dtoPath,
    };
    return config;
  },
  async rewrites() {
    // Vérification stricte de la variable d'environnement
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error(
        "NEXT_PUBLIC_API_URL n'est pas définie. Veuillez configurer cette variable d'environnement dans .env.local ou .env.production"
      );
    }

    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
