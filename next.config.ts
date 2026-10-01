import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
     afterFiles: [{ source: "/uploads/:name", destination: "/media/:name" }],
      beforeFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
