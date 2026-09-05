"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  Loader2,
  Newspaper,
  PlusCircle,
  Search,
  SquarePen,
  Star,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPostDate } from "@/lib/cms/format";
import type { NewsSummary, PostStatus } from "@/lib/cms/types";
import { StatusPill } from "./status-pill";

type Filter = "all" | PostStatus;

/**
 * The news list.
 *
 * `components/admin/posts-table.tsx` with news fields in place of post ones —
 * same status tabs with counts, same search box, same row shape, same hover
 * actions. An editor who has used one has used the other, which is the point.
 * If you change one of the two, change both.
 */
export function NewsTable({ initialNews }: { initialNews: NewsSummary[] }) {
  const router = useRouter();
  const [news, setNews] = useState(initialNews);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const counts = useMemo(
    () => ({
      all: news.length,
      published: news.filter((n) => n.status === "published").length,
      draft: news.filter((n) => n.status === "draft").length,
    }),
    [news],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return news.filter((item) => {
      if (filter !== "all" && item.status !== filter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)) ||
        item.slug.toLowerCase().includes(q)
      );
    });
  }, [news, filter, query]);

  async function remove(item: NewsSummary) {
    const label = item.title || "this untitled news item";
    if (
      !window.confirm(
        `Delete “${label}”? This removes it from the website immediately and cannot be undone.`,
      )
    ) {
      return;
    }

    setDeleting(item.id);
    setError("");

    const response = await fetch(`/api/admin/news/${item.id}`, {
      method: "DELETE",
    }).catch(() => null);

    if (!response?.ok) {
      setError(`Could not delete “${label}”. Try again.`);
      setDeleting(null);
      return;
    }

    setNews((current) => current.filter((n) => n.id !== item.id));
    setDeleting(null);
    // Keeps the dashboard counts and the public news page in step.
    router.refresh();
  }

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "published", label: "Published" },
    { key: "draft", label: "Drafts" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">News</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Announcements, launches and company updates. Separate from the blog —
            these appear on the news page only.
          </p>
        </div>
        <Link
          href="/admin/news/new"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors duration-300 hover:bg-brand-800"
        >
          <PlusCircle className="size-4" aria-hidden="true" />
          Add news
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Filter by status" className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              aria-pressed={filter === tab.key}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200",
                filter === tab.key
                  ? "bg-brand-800 text-white"
                  : "text-ink-soft hover:bg-white hover:text-brand-700",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "ms-1.5 text-xs",
                  filter === tab.key ? "text-brand-200" : "text-ink-faint",
                )}
              >
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <label htmlFor="admin-news-search" className="sr-only">
            Search news
          </label>
          <Search
            className="absolute top-1/2 start-3.5 size-4 -translate-y-1/2 text-ink-faint"
            aria-hidden="true"
          />
          <input
            id="admin-news-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search news…"
            className="w-full rounded-xl border border-brand-200/80 bg-white py-2.5 pe-4 ps-10 text-sm text-ink shadow-sm transition-colors placeholder:text-ink-faint focus:border-brand-600 focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="card-surface mt-5 overflow-hidden">
        {visible.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Newspaper
              className="mx-auto size-10 text-brand-300"
              aria-hidden="true"
            />
            <p className="mt-4 font-display text-base font-semibold text-ink">
              {news.length === 0 ? "No news yet" : "No news matches this filter"}
            </p>
            <p className="mt-1 text-sm text-ink-faint">
              {news.length === 0
                ? "Add your first announcement to get started."
                : "Try a different status or search term."}
            </p>
            {news.length === 0 && (
              <Link
                href="/admin/news/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
              >
                <PlusCircle className="size-4" aria-hidden="true" />
                Add news
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-brand-50">
            {visible.map((item) => (
              <li
                key={item.id}
                className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-brand-50/50"
              >
                <div className="relative hidden size-14 shrink-0 overflow-hidden rounded-xl bg-brand-50 sm:block">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center">
                      <Newspaper
                        className="size-5 text-brand-300"
                        aria-hidden="true"
                      />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/news/${item.id}`}
                      className="truncate text-sm font-semibold text-ink transition-colors hover:text-brand-700"
                    >
                      {item.title || "(untitled)"}
                    </Link>
                    {item.featured && (
                      <Star
                        className="size-3.5 shrink-0 fill-signal-500 text-signal-500"
                        aria-label="Featured"
                      />
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-ink-faint">
                    {item.tags.join(", ") || "Untagged"} ·{" "}
                    {formatPostDate(item.date)} ·{" "}
                    <span className="font-mono">/news/{item.slug}</span>
                  </p>
                </div>

                <StatusPill
                  status={item.status}
                  className="hidden sm:inline-flex"
                />

                <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100">
                  <Link
                    href={`/admin/news/${item.id}`}
                    title="Edit"
                    className="inline-flex size-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand-100 hover:text-brand-800"
                  >
                    <SquarePen className="size-4" aria-hidden="true" />
                    <span className="sr-only">Edit {item.title}</span>
                  </Link>
                  <Link
                    href={
                      item.status === "published"
                        ? `/news/${item.slug}`
                        : `/admin/news/${item.id}#preview`
                    }
                    target={item.status === "published" ? "_blank" : undefined}
                    rel="noreferrer"
                    title="View"
                    className="inline-flex size-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand-100 hover:text-brand-800"
                  >
                    <Eye className="size-4" aria-hidden="true" />
                    <span className="sr-only">View {item.title}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    disabled={deleting === item.id}
                    title="Delete"
                    className="inline-flex size-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    {deleting === item.id ? (
                      <Loader2
                        className="size-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Trash2 className="size-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">Delete {item.title}</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
