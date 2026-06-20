import type { NextConfig } from "next";

// When deploying to GitHub Project Pages the site is served from a sub-path
// (e.g. /retirement-calculator). The Pages workflow passes that path in via
// PAGES_BASE_PATH so assets resolve correctly. Locally it's empty.
const basePath = process.env.PAGES_BASE_PATH || "";

const nextConfig: NextConfig = {
  // Produce a fully static export into ./out (downloadable / host-anywhere).
  output: "export",
  images: { unoptimized: true },
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
