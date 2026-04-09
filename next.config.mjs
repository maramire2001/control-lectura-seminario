/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabling strict mode for p5.js compatibility
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
