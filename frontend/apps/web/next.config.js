/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@halyoontok/shared-types",
    "@halyoontok/api-client",
    "@halyoontok/constants",
    "@halyoontok/i18n",
  ],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_FRONT_API_URL || "http://localhost:8081"}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
