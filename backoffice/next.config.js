/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // basePath permet à Next.js de gérer automatiquement le préfixe /admin
  // pour tous les liens, routes et assets. Plus besoin d'assetPrefix séparé.
  basePath: "/admin",
  webpack: (config, { isServer }) => {
    // Help webpack resolve @tfe/shared-types and dto
    const path = require("path");
    const fs = require("fs");
    const sharedTypesPath = path.resolve(
      __dirname,
      "node_modules/@tfe/shared-types"
    );
    const sharedTypesFallback = path.resolve(__dirname, "shared-types");
    const dtoPath = path.resolve(__dirname, "dto");

    config.resolve.alias = {
      ...config.resolve.alias,
      "@tfe/shared-types": fs.existsSync(sharedTypesPath)
        ? sharedTypesPath
        : sharedTypesFallback,
      // Add alias for dto to help resolve relative imports
      dto: dtoPath,
    };
    return config;
  },
  // Section rewrites() retirée - Nginx route directement les API
};

module.exports = nextConfig;
