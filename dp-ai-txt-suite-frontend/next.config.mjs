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
      destination: 'http://localhost:10000/api/:path*',  // Goes to backend
    },
  ];
} 
}

export default nextConfig
