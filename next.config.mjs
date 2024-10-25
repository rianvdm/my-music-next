// next.config.mjs

import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

/**
 * Use the @cloudflare/next-on-pages next-dev module to allow us to use bindings during local development
 */
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.discogs.com',
        pathname: '/**', // Allows all paths on this hostname
      },
      {
        protocol: 'https',
        hostname: 'file.elezea.com',
        pathname: '/**', // Allows all paths on this hostname
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        pathname: '/**', // Allows all paths on this hostname
      },
    ],
    // Optional: Additional image configuration settings
    // deviceSizes: [320, 420, 768, 1024, 1200],
    // imageSizes: [16, 32, 48, 64, 96],
    // minimumCacheTTL: 60,
  },
};

export default nextConfig;