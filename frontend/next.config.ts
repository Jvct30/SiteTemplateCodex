import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiImageHost = apiUrl ? new URL(apiUrl).hostname : null;

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      ...(apiImageHost
        ? [
            {
              protocol: "https" as const,
              hostname: apiImageHost,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
