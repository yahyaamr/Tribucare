import Image from "next/image";
import { ArrowRight, Building2, Layers } from "lucide-react";
import { brandLogos } from "@/content/site";
import type { AltesseProduct } from "@/content/altesse";

export function AltesseProductCard({
  product,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: {
  product: AltesseProduct;
  sizes?: string;
}) {
  const logo = brandLogos[product.brand];

  return (
    <article className="card-surface card-interactive group relative flex h-full flex-col overflow-hidden">
      <div className="relative h-52 w-full overflow-hidden bg-brand-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
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
              {product.lineLabel}
            </span>
          </div>

          <h3 className="mt-3 line-clamp-2 font-display text-lg leading-snug font-semibold text-ink transition-colors duration-300 group-hover:text-brand-700">
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="absolute inset-0 z-10" aria-hidden="true" />
              {product.name}
            </a>
          </h3>

          {product.summary && (
            <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-ink-soft">
              {product.summary}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-brand-50 pt-4">
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
