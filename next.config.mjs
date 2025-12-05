/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'blob.v0.dev',
        port: '',
        pathname: '**',
      },
    ],
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/projects',
        destination: '/blog',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
