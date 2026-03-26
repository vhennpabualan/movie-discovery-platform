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
value: "frame-src 'self' https://vidsrc-embed.ru https://vidsrc-embed.su https://vidsrcme.su https://vsrc.su https://vsembed.ru https://cloudnestra.com https://theajack.github.io;",          },
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
value: "frame-src 'self' https://vidsrc-embed.ru https://vidsrc-embed.su https://vidsrcme.su https://vsrc.su https://vsembed.ru https://cloudnestra.com https://theajack.github.io;",          },
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
