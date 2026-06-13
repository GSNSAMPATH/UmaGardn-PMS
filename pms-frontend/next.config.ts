import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5122",
        pathname: "/images/**",
      },
    ],
    unoptimized: true, // << IMPORTANT FIX  
  },
};

export default nextConfig;
