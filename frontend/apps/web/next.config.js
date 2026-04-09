/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@halyoontok/shared-types",
    "@halyoontok/api-client",
    "@halyoontok/constants",
  ],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
