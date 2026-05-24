/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Allow inline SVG via next/image for the static brand assets we ship.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
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
  async headers() {
    return [
      {
        // Skip the gateway routes — clients depend on minimal headers there.
        source: "/((?!api/v1|v1).*)",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
