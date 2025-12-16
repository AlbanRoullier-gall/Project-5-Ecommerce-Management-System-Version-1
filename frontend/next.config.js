/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // Help webpack resolve @tfe/shared-types
    const path = require("path");
    const sharedTypesPath = path.resolve(
      __dirname,
      "node_modules/@tfe/shared-types"
    );
    const sharedTypesFallback = path.resolve(__dirname, "shared-types");

    config.resolve.alias = {
      ...config.resolve.alias,
      "@tfe/shared-types": require("fs").existsSync(sharedTypesPath)
        ? sharedTypesPath
        : sharedTypesFallback,
    };
    return config;
  },
  // Section rewrites() retirée - Nginx route directement les API
};

module.exports = nextConfig;
