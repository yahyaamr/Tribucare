import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Layers } from "lucide-react";
import { brandLogos } from "@/content/site";
import type { Product } from "@/content/dermatology";
import { ProductPlaceholder } from "@/components/dermatology/product-placeholder";

/**
 * The product card.
 *
 * Deliberately the same card as `components/blog/post-card` and
 * `components/events/event-card` — same `card-surface card-interactive` shell,
 * same h-52 media band, same floating top-left badge, same meta / title /
 * excerpt rhythm, same bordered footer row. An article, an event and a device
 * are the same kind of object to a reader, so they get the same object on
 * screen. If you change one of these three files, change the others.
 *
 * The media band holds its `bg-brand-50` plate whether or not a shot exists
 * yet, so a product without imagery is a card with a quiet mint band rather
 * than a broken or collapsed one.
 */
export function ProductCard({
  product,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: {
  product: Product;
  sizes?: string;
}) {
  const logo = brandLogos[product.brand];

  return (
    <article className="card-surface card-interactive group relative flex h-full flex-col overflow-hidden">
      <div className="relative h-52 w-full overflow-hidden bg-brand-50">
        {product.image ? (
          <Image
            src={product.image}
            alt=""
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          />
        ) : (
          <ProductPlaceholder brand={product.brand} />
        )}
        <span className="absolute top-3.5 left-3.5 rounded-xl bg-white/90 px-3 py-1 text-xs font-semibold text-brand-900 shadow-md backdrop-blur-md">
          {product.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-3 text-xs text-ink-faint">
            <span className="flex items-center gap-1">
              <Building2 className="size-3.5" aria-hidden="true" />
              {product.brand}
            </span>
            <span aria-hidden="true">•</span>
            <span className="flex items-center gap-1">
              <Layers className="size-3.5" aria-hidden="true" />
              {product.line === "devices" ? "Device" : "Injectable"}
            </span>
          </div>

          <h3 className="mt-3 line-clamp-2 font-display text-lg leading-snug font-semibold text-ink transition-colors duration-300 group-hover:text-brand-700">
            <Link href={`/dermatology/${product.slug}`}>
              {/* Stretches the link across the whole card, so the name stays the
                  single accessible name rather than adding a second link to the
                  tab order for the same destination. */}
              <span className="absolute inset-0 z-10" aria-hidden="true" />
              {product.name}
            </Link>
          </h3>

          {product.summary && (
            <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-ink-soft">
              {product.summary}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-brand-50 pt-4">
          {/* Marks are set to a shared height rather than a shared box, so a row
              of cards reads as one set despite the logos' aspect ratios. Brands
              the deck has no mark for fall back to their name. */}
          {logo ? (
            <Image
              src={logo.src}
              alt={product.brand}
              width={logo.width}
              height={logo.height}
              className="h-5 w-auto max-w-[6.5rem] object-contain"
            />
          ) : (
            <span className="line-clamp-1 text-xs font-medium text-ink">
              {product.brand}
            </span>
          )}

          <span
            aria-hidden="true"
            className="inline-flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors duration-300 group-hover:bg-brand-700 group-hover:text-white"
          >
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </article>
  );
}
