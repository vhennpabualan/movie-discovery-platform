import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    deviceSizes: [640, 1080, 1920],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
      {
        protocol: "https",
        hostname: "myanimelist.net",  // ← add this
      },
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",  // ← add this too (Jikan uses both)
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
            value: "frame-src 'self' https://vidsrc.net https://www.2embed.cc https://multiembed.mov https://vidsrc-embed.ru https://vidsrc-embed.su https://vidsrcme.su https://vsrc.su https://vsembed.ru https://cloudnestra.com https://theajack.github.io;",
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
            value: "frame-src 'self' https://vidsrc.net https://www.2embed.cc https://multiembed.mov https://vidsrc-embed.ru https://vidsrc-embed.su https://vidsrcme.su https://vsrc.su https://vsembed.ru https://cloudnestra.com https://theajack.github.io;",
          },
          {
            key: "Referrer-Policy",
            value: "origin",
          },
        ],
      },
      {
        source: "/anime/:id",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-src 'self' https://vidnest.fun https://vidsrc.cc https://vidsrc.icu;",
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
