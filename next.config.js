/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Expose the gateway at /v1/* (clients pass base URL `/v1` and append paths).
  // Map to internal /api/v1/* route handlers.
  async rewrites() {
    return [
      {
        source: "/v1/:path*",
        destination: "/api/v1/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
