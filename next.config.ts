import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable strict ESM checks if importing from CommonJS files
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  }
};

export default nextConfig;
