import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.b-cdn.net" }
    ]
  },
  poweredByHeader: false
};

export default nextConfig;