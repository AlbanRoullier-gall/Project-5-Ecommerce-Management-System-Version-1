/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // assetPrefix pour que les assets pointent vers /admin/_next/...
  // mais le routing reste normal (sans basePath) pour éviter les boucles de redirection
  // Désactivé en développement local pour éviter les boucles de redirection
  assetPrefix: process.env.NODE_ENV === "production" ? "/admin" : undefined,
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
