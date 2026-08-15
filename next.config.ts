import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next only negotiates WebP by default. AVIF is listed first so browsers
    // that advertise it get it — it lands roughly 20-30% under WebP on the
    // large photographic art here, which is most of the page's image weight.
    // Anything that cannot take AVIF still falls back through this list.
    formats: ["image/avif", "image/webp"],
    // These are content images, not user uploads: they only change on deploy,
    // so re-optimising them every 4 hours (the default) buys nothing.
    minimumCacheTTL: 2678400, // 31 days
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
