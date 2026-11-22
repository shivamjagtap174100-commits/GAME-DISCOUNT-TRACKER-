/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.steamstatic.com',
      },
      {
        protocol: 'https',
        hostname: '**.akamaihd.net',
      },
      {
        protocol: 'https',
        hostname: 'cdn1.epicgames.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn2.epicgames.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
