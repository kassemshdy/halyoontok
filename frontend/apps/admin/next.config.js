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
        source: "/api/admin/:path*",
        destination: `${process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:8080"}/api/:path*`,
      },
      {
        source: "/api/upload/:path*",
        destination: `${process.env.NEXT_PUBLIC_UPLOAD_API_URL || "http://localhost:8082"}/api/:path*`,
      },
      {
        source: "/api/auth/:path*",
        destination: `${process.env.NEXT_PUBLIC_FRONT_API_URL || "http://localhost:8081"}/api/auth/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
