import type { NextConfig } from "next";

const nestApiOrigin =
  process.env.NEST_API_ORIGIN?.replace(/\/$/, "") ||
  "https://aureon-api.vercel.app";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/nest-api/:path*",
        destination: `${nestApiOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
