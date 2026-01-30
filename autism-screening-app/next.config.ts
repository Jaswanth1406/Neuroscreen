import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  turbopack: {
    root: "C:/Users/jaswa/Downloads/Neuroscreen/autism-screening-app",
  },
};

export default nextConfig;
