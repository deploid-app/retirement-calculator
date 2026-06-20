import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a fully static export into ./out (downloadable / host-anywhere).
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
