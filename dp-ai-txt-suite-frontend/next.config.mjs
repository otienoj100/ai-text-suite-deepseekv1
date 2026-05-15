/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
 // frontend/next.config.js
async rewrites() {
  return [
    {
      source: '/api/:path*',     // Frontend calls this
      destination: 'https://ai-text-suite-deepseekv1.onrender.com',  // Goes to backend
    },
  ];
} 
}

export default nextConfig
