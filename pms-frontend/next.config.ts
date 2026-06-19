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


// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   reactCompiler: true,

//   allowedDevOrigins: [
//     "192.168.8.138",
//     "localhost",
//     "127.0.0.1",
//   ],

//   images: {
//     remotePatterns: [
//       {
//         protocol: "http",
//         hostname: "localhost",
//         port: "5122",
//         pathname: "/images/**",
//       },
//     ],
//     unoptimized: true,
//   },
// };

// export default nextConfig;