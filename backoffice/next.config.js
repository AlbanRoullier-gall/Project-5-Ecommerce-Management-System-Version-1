/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:13000",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:13000/:path*",
      },
      {
        source: "/uploads/products/:path*",
        destination: "http://product-service:3002/uploads/products/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
