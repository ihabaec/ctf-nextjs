/** @type {import("next").NextConfig} */
const nextConfig = {
  // Keep existing image remote patterns
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: ""
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: ""
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: ""
      },
      {
        protocol: "https",
        hostname: "pub-b7fd9c30cdbf439183b75041f5f71b92.r2.dev",
        port: ""
      }
    ],
    // Add image optimization settings
    minimumCacheTTL: 60,
    formats: ['image/webp'],
  },
  poweredByHeader: false,
  compress: true,
  
  // Reduce bundle size
  reactStrictMode: false,
  
  // Disable telemetry
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react-icons', 'date-fns', 'lodash']
  },
  
  // Cache aggressively
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  
};

export default nextConfig;