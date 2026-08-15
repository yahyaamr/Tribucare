"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Search,
  Sparkles,
} from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { PostCard } from "@/components/blog/post-card";
import { blogPosts, blogCategories } from "@/content/blogs";
import { cn } from "@/lib/utils";

const ALL = "All Articles";

const featuredPost = blogPosts.find((post) => post.featured) ?? blogPosts[0];

/**
 * The filtering half of the blog index.
 *
 * Split out of the page so the page itself can stay a server component and
 * export `metadata` — the previous version marked the whole route
 * `"use client"`, which silently forfeited the page title, description and
 * social card for the entire blog index.
 */
export function BlogIndex() {
  const [category, setCategory] = useState<string>(ALL);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return blogPosts.filter((post) => {
      const matchesCategory = category === ALL || post.category === category;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q)
      );
    });
  }, [category, query]);

  return (
    <>
      <div className="mt-10 flex flex-col gap-6 border-b border-brand-100 pb-8 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Filter articles by category"
          className="flex flex-wrap items-center gap-2"
        >
          {blogCategories.map((cat) => {
            const isActive = category === cat;
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={isActive}
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-brand-800 text-white shadow-md"
                    : "card-surface text-ink-soft hover:border-brand-300 hover:text-brand-700",
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-80">
          <label htmlFor="blog-search" className="sr-only">
            Search articles and topics
          </label>
          <Search
            className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-faint"
            aria-hidden="true"
          />
          <input
            id="blog-search"
            type="search"
            placeholder="Search articles & topics..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-xl border border-brand-200/80 bg-white py-2.5 pr-4 pl-10 text-sm text-ink shadow-sm transition-colors placeholder:text-ink-faint focus:border-brand-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Featured article — hidden once a filter or search narrows the list, so
          the page never promotes an article the current filter excludes. */}
      {category === ALL && !query.trim() && (
        <Reveal className="mt-12" from="scale">
          <article className="card-surface group relative overflow-hidden shadow-lg transition-shadow duration-500 hover:shadow-2xl lg:grid lg:grid-cols-12 lg:items-center">
            <div className="relative h-64 min-h-[360px] overflow-hidden sm:h-80 lg:col-span-6 lg:h-full">
              <Image
                src={featuredPost.image}
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent lg:hidden"
              />
              <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-xl bg-signal-500 px-3.5 py-1 text-xs font-semibold text-brand-950 shadow-md">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Featured Article
              </span>
            </div>

            <div className="p-8 lg:col-span-6 lg:p-12">
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold tracking-wider text-brand-700 uppercase">
                <span className="rounded-md border border-brand-200/60 bg-brand-50 px-2.5 py-1 text-brand-800">
                  {featuredPost.category}
                </span>
                <span className="flex items-center gap-1 text-ink-faint">
                  <Calendar className="size-3.5" aria-hidden="true" />
                  {featuredPost.date}
                </span>
                <span className="flex items-center gap-1 text-ink-faint">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {featuredPost.readTime}
                </span>
              </div>

              <h2 className="mt-4 font-display text-2xl font-semibold text-ink transition-colors duration-300 group-hover:text-brand-700 sm:text-3xl">
                <Link href={`/blog/${featuredPost.slug}`}>
                  <span className="absolute inset-0 z-10" aria-hidden="true" />
                  {featuredPost.title}
                </Link>
              </h2>

              <p className="mt-3 line-clamp-3 text-base leading-relaxed text-ink-soft">
                {featuredPost.excerpt}
              </p>

              <div className="mt-8 flex items-center justify-between gap-4 border-t border-brand-100 pt-6">
                <div className="flex items-center gap-3">
                  <Image
                    src={featuredPost.author.avatar}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 rounded-full object-cover ring-2 ring-brand-100"
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {featuredPost.author.name}
                    </p>
                    <p className="text-xs text-ink-faint">
                      {featuredPost.author.role}
                    </p>
                  </div>
                </div>

                <span
                  aria-hidden="true"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors duration-300 group-hover:bg-brand-800"
                >
                  Read Article
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </div>
          </article>
        </Reveal>
      )}

      <div className="mt-12">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-ink">
            {category === ALL ? "Latest Articles" : category}
          </h2>
          {/* Announced politely so filtering gives screen-reader users the same
              feedback sighted users get from the grid changing. */}
          <p aria-live="polite" className="text-sm text-ink-faint">
            Showing {filtered.length} article{filtered.length === 1 ? "" : "s"}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-brand-200 bg-white p-12 text-center">
            <BookOpen
              className="mx-auto size-12 text-brand-300"
              aria-hidden="true"
            />
            <p className="mt-4 font-display text-lg font-semibold text-ink">
              No articles found matching your criteria
            </p>
            <p className="mt-1 text-sm text-ink-faint">
              Try resetting your category filter or adjusting your search
              keywords.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategory(ALL);
                setQuery("");
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-800"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post, idx) => (
              <Reveal
                as="li"
                // Keyed by filter state as well as slug so a card that survives
                // a filter change still replays its entrance rather than
                // snapping into a new grid position.
                key={`${category}-${post.slug}`}
                delay={Math.min(idx, 6) * 60}
                from="scale"
                className="h-full"
              >
                <PostCard post={post} />
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
