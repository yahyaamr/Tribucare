import type { MetadataRoute } from "next";
import { getContent } from "@/content";

/**
 * Web app manifest. Not a PWA — there is no service worker — but the manifest
 * is where Android and desktop browsers read the site's name, colour and icons
 * from when a visitor pins it, and Lighthouse reads it too.
 *
 * Sits outside `[lang]` like the other metadata routes, so it is served once at
 * `/manifest.webmanifest`; the proxy leaves dotted paths alone.
 */
export default function manifest(): MetadataRoute.Manifest {
  const { company } = getContent();

  return {
    name: company.name,
    short_name: company.name,
    description: company.description,
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#073c3c",
    lang: "en",
    icons: [
      { src: "/icon.png", sizes: "192x192", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
