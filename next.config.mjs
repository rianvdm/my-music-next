import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

// Use the @cloudflare/next-on-pages next-dev module to allow us to use bindings during local development
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.discogs.com', 'file.elezea.com'], // Allow these external domains
  },
};

export default nextConfig;