import type { NextConfig } from "next";

const backendOrigin = getBackendOrigin();

const nextConfig: NextConfig = {
  async rewrites() {
    if (!backendOrigin) {
      return [];
    }

    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendOrigin}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;

function getBackendOrigin(): string | undefined {
  const value = process.env.BACKEND_ORIGIN?.trim();

  if (!value) {
    return undefined;
  }

  return new URL(value).origin;
}
