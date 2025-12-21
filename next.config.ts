import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
  experimental: {
    optimizeCss: true,
  },
  serverExternalPackages: ['@clerk/backend'], // Moved from experimental
  // Suppress source map warnings for external dependencies
  productionBrowserSourceMaps: false,
  
  // Suppress specific development warnings
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  webpack: (config, { isServer, dev }) => {
    // Disable source maps for node_modules in development to prevent 404s
    if (dev && !isServer) {
      config.module.rules.push({
        test: /\.js$/,
        enforce: 'pre',
        include: /node_modules/,
        use: ['source-map-loader'],
      });
      
      // Ignore source map warnings for specific packages
      config.ignoreWarnings = [
        /Failed to parse source map/,
        /Critical dependency: the request of a dependency is an expression/,
      ];
    }
    
    // Fix for Clerk Edge Runtime compatibility
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }
    
    return config;
  },
  
  // Suppress static generation warnings
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};

export default nextConfig;
