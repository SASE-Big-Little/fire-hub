import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tailwind CSS is compiled by Turbopack (the default bundler in Next.js 16).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
