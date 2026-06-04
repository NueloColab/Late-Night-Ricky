/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '/home/node/.openclaw/workspace/late-night-ricky/admin/src',
    };
    return config;
  },
};

export default nextConfig;
