import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
  // Enable experimental optimizations
  experimental: {
    optimizePackageImports: ["react", "react-dom"],
  },
};

export default nextConfig;
