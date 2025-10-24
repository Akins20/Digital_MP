import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Skip ESLint during builds (already checked manually)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript type checking
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
