import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  reactStrictMode: true,

  // 🔥 This removes the Next.js floating logo bubble
  // devIndicators: {
  //   buildActivity: false,
  // },

  devIndicators: {
    position: "bottom-right", // cannot disable, only move
  },
};

export default nextConfig;
