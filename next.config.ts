import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    turbo: {
      root: path.join(__dirname, "./"),
    },
  },
};

export default nextConfig;
