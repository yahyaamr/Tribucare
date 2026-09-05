import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
// This default OG card sits outside `[lang]`, so it uses the English bundle.
// Arabic pages get their own title and description from `generateMetadata`.
import { getContent } from "@/content";

/**
 * The site-wide social card.
 *
 * `metadata.openGraph` already declared a title and description but had no
 * image, so every share of the homepage rendered as a bare text link. Blog
 * posts set their own image in `generateMetadata`, so this covers everything
 * else — home, /partner, and any future route that doesn't override it.
 *
 * Next resolves `twitter:image` from the Open Graph image when the `twitter`
 * metadata declares no images of its own, so this one file feeds both cards.
 *
 * Type is deliberately the `next/og` default rather than Outfit/Figtree: the
 * brand faces arrive through `next/font/google` as woff2, which Satori cannot
 * parse, and pulling a static .ttf into the repo just for this card is a poor
 * trade. The shield and the brand palette carry the identity instead.
 */

const { company, hero } = getContent();

export const alt = `${company.name} — ${company.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Read once at module scope: the asset is the same for every request.
const markData = await readFile(
  join(process.cwd(), "public/brand/logos/tribucare-mark.png"),
  "base64",
);
const markSrc = `data:image/png;base64,${markData}`;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          // brand-950 → brand-800, the deck's deep-teal ground.
          backgroundImage: "linear-gradient(135deg, #042726 0%, #0a5251 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={markSrc} width={104} height={104} alt="" />
          <span
            style={{
              marginLeft: 28,
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "#ffffff",
            }}
          >
            {company.name}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 78,
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
            }}
          >
            <span style={{ color: "#ffffff" }}>{hero.headlineLead}</span>
            {/* Flat circuit-cyan: the site gradients this line, Satori can't. */}
            <span style={{ color: "#7fdcec" }}>{hero.headlineAccent}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Circuit-orange rule — the deck's accent, and the only warm mark. */}
          <div
            style={{
              width: 96,
              height: 5,
              borderRadius: 3,
              backgroundColor: "#f5a623",
              marginBottom: 26,
            }}
          />
          <span style={{ fontSize: 27, color: "#ade1de" }}>{hero.eyebrow}</span>
        </div>
      </div>
    ),
    size,
  );
}
