/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Disable problematic modules for client-side
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    // Handle pdfjs-dist for server-side rendering
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },
  // Enable experimental features
  experimental: {
    esmExternals: 'loose',
  },
}

module.exports = nextConfig