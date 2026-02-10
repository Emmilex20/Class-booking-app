import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        pathname: "/**",
      },
    ],
  },

  // 👇 Explicitly acknowledge Turbopack
  turbopack: {},

  // Silence noisy source-map warnings
  productionBrowserSourceMaps: false,

  webpack(config) {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /Failed to parse source map/,
      /Invalid source map/,
    ];
    return config;
  },
};

export default nextConfig;
