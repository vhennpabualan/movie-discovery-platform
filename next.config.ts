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
  // Add headers for streaming iframe support
  async headers() {
    return [
      {
        source: "/movies/:id",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-src 'self' https://vidsrc.in https://vidsrc.to https://vidsrc.xyz https://vidsrc.net https://vidsrc.pm https://vidsrc.icu https://vidsrc.me;",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "origin",
          },
        ],
      },
      {
        source: "/tv/:id",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-src 'self' https://vidsrc.in https://vidsrc.to https://vidsrc.xyz https://vidsrc.net https://vidsrc.pm https://vidsrc.icu https://vidsrc.me;",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
