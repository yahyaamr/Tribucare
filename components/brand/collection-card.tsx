import Image from "next/image";
import { ArrowRight, Building2, ExternalLink } from "lucide-react";
import { content } from "@/content/server";
import type { BrandCollection } from "@/content/collections";

/**
 * The canonical content card (see `components/blog/post-card.tsx`), carrying a
 * store collection instead of an article. Shared by the MLAY and Altesse Soin
 * pages, which is why it lives here rather than in either brand folder — the
 * two per-brand product cards it replaces were byte-identical to each other.
 */
export async function CollectionCard({
  collection,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: {
  collection: BrandCollection;
  sizes?: string;
}) {
  const { brandLogos } = await content();
  const logo = brandLogos[collection.brand];

  return (
    <article className="card-surface card-interactive group relative flex h-full flex-col overflow-hidden">
      <div className="relative h-52 w-full overflow-hidden bg-brand-50">
        <Image
          src={collection.image}
          alt={collection.name}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        <span className="absolute top-3.5 start-3.5 rounded-xl bg-white/90 px-3 py-1 text-xs font-semibold text-brand-900 shadow-md backdrop-blur-md">
          {collection.badge}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-3 text-xs text-ink-faint">
            <span className="flex items-center gap-1">
              <Building2 className="size-3.5" aria-hidden="true" />
              {collection.brand}
            </span>
            <span aria-hidden="true">•</span>
            <span className="flex items-center gap-1">
              <ExternalLink className="size-3.5" aria-hidden="true" />
              {collection.store}
            </span>
          </div>

          <h3 className="mt-3 line-clamp-2 font-display text-lg leading-snug font-semibold text-ink transition-colors duration-300 group-hover:text-brand-700">
            <a href={collection.url} target="_blank" rel="noopener noreferrer">
              <span className="absolute inset-0 z-10" aria-hidden="true" />
              {collection.name}
            </a>
          </h3>

          {collection.summary && (
            <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-ink-soft">
              {collection.summary}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-brand-50 pt-4">
          {logo ? (
            <Image
              src={logo.src}
              alt={collection.brand}
              width={logo.width}
              height={logo.height}
              className="h-5 w-auto max-w-[6.5rem] object-contain"
            />
          ) : (
            <span className="line-clamp-1 text-xs font-medium text-ink">
              {collection.brand}
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
