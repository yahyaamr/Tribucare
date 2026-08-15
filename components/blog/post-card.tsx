import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import type { BlogPost } from "@/content/blogs";

/**
 * The article card, shared by the homepage section and the /blog index.
 *
 * Both previously carried their own near-identical copy of this markup, which
 * had already drifted apart (different image heights, ring weights and hover
 * durations). One component means one card.
 */
export function PostCard({
  post,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: {
  post: BlogPost;
  sizes?: string;
}) {
  return (
    <article className="card-surface card-interactive group relative flex h-full flex-col overflow-hidden">
      <div className="relative h-52 w-full overflow-hidden bg-brand-50">
        <Image
          src={post.image}
          alt=""
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        <span className="absolute top-3.5 left-3.5 rounded-xl bg-white/90 px-3 py-1 text-xs font-semibold text-brand-900 shadow-md backdrop-blur-md">
          {post.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-3 text-xs text-ink-faint">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" aria-hidden="true" />
              {post.date}
            </span>
            <span aria-hidden="true">•</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {post.readTime}
            </span>
          </div>

          <h3 className="mt-3 line-clamp-2 font-display text-lg leading-snug font-semibold text-ink transition-colors duration-300 group-hover:text-brand-700">
            <Link href={`/blog/${post.slug}`}>
              {/* Stretches the link across the whole card, so the title stays
                  the single accessible name rather than adding a second
                  "Read …" link to the tab order for the same destination. */}
              <span className="absolute inset-0 z-10" aria-hidden="true" />
              {post.title}
            </Link>
          </h3>

          <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-ink-soft">
            {post.excerpt}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-brand-50 pt-4">
          <div className="flex items-center gap-2.5">
            <Image
              src={post.author.avatar}
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-full object-cover ring-1 ring-brand-200"
            />
            <span className="line-clamp-1 text-xs font-medium text-ink">
              {post.author.name}
            </span>
          </div>

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
