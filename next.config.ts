import type { NextConfig } from "next";

// Internal, signed-in app: every page reads the session, so nothing is prerendered.
const nextConfig: NextConfig = {
  cacheComponents: false,
};

export default nextConfig;
