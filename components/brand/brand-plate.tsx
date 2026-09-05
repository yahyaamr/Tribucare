import Image from "next/image";
import { content } from "@/content/server";

/**
 * Shared-height mark on a white plate — the same treatment the Expertise cards
 * give a row of brands, and the reason it is a plate rather than a filter is
 * that these logos are full colour. Knocking them white would be a new
 * treatment, and the site's rule is that cards stay white even on a deep
 * ground. Brands the deck carries no mark for fall back to their name.
 *
 * One component for the three brand pages, which each carried an identical
 * copy of this markup.
 */
export async function BrandPlate({ name }: { name: string }) {
  const { brandLogos } = await content();
  const logo = brandLogos[name];

  return (
    <span className="flex h-11 items-center rounded-xl bg-white px-4 shadow-[0_10px_24px_-18px_rgb(7_42_42/0.55)] transition-transform duration-300 hover:-translate-y-0.5">
      {logo ? (
        <Image
          src={logo.src}
          alt={name}
          width={logo.width}
          height={logo.height}
          className="h-5 w-auto max-w-[6.5rem] object-contain"
        />
      ) : (
        <span className="text-[0.85rem] font-semibold tracking-[0.02em] text-ink/85">
          {name}
        </span>
      )}
    </span>
  );
}
