/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/:path*`,
      },
    ];
  },
  images: {
    domains: ['picsum.photos', 'pub-xxxxx.r2.dev', 'mock-r2.local'],
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};
module.exports = nextConfig;
