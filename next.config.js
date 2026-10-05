/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["cashfree-pg"],
  },
};

module.exports = nextConfig;
