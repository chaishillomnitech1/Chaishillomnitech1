/**
 * Next.js Configuration
 * 
 * Configuration for the Sovereign TV App
 * 
 * @author Supreme King Chais The Great ∞
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Image optimization
  images: {
    domains: [
      'scrollverse.io',
      'i.ytimg.com', // YouTube thumbnails
      'ipfs.io',
      'gateway.pinata.cloud',
    ],
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'Sovereign TV',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
  
  // Webpack configuration
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  
  // Output configuration for static export
  output: 'standalone',
};

module.exports = nextConfig;
