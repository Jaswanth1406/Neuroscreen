import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Uncomment and update the path below if you get "Can't resolve 'tailwindcss'" error
  // turbopack: {
  //   root: "/path/to/your/project/autism-screening-app",
  // },
};

export default nextConfig;
