/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: { unoptimized: true },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://ai-text-suite-deepseekv1.onrender.com/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
