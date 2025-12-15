/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // Help webpack resolve @tfe/shared-types
    const path = require("path");
    const sharedTypesPath = path.resolve(__dirname, "node_modules/@tfe/shared-types");
    const sharedTypesFallback = path.resolve(__dirname, "shared-types");
    
    config.resolve.alias = {
      ...config.resolve.alias,
      "@tfe/shared-types": require("fs").existsSync(sharedTypesPath) 
        ? sharedTypesPath 
        : sharedTypesFallback,
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
