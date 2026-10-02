import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Uploads go through a server action (FormData with the raw file bytes), so
  // the default 1 MB server-action body cap would reject anything bigger with a
  // minified React error #441 ("An error occurred in the Server Components
  // render") — only some images fail because only some are > ~1 MB. 6 MB fits
  // the 5 MB editor cap plus multipart overhead.
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  async rewrites() {
    return {
     afterFiles: [{ source: "/uploads/:name", destination: "/media/:name" }],
      beforeFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
