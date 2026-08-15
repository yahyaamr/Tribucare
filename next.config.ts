import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Author avatars in content/blogs.ts are hosted on Unsplash. Allowing the
    // host here lets them go through next/image (resizing, modern formats,
    // lazy loading) instead of raw <img> tags.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
