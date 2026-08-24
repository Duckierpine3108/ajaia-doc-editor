import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Bypasses TypeScript errors during Vercel build
  },
  eslint: {
    ignoreDuringBuilds: true, // Bypasses ESLint errors during Vercel build
  },
};

export default nextConfig;