"use client";

import { useAdminApi } from "@/components/admin/base-path";
import { fill, useAdminStrings } from "@/components/admin/strings";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_UPLOAD_BYTES, allowedTypeList, formatBytes } from "@/lib/cms/format";
import type { MediaItem } from "@/lib/cms/types";

/**
 * The media library, as a dialog and as a page.
 *
 * WordPress's modal: an upload target at the top, a grid of everything already
 * uploaded below, click to select. `onPick` is what makes it a picker — the
 * standalone /admin/media page renders the same component without it and gets
 * a manager instead.
 */
const GROUP_SOURCES = ["upload", "site"] as const;

/**
 * One image in the library.
 *
 * `onRemove` is what separates the two kinds: an upload passes it and gets the
 * delete affordance, a site image does not and simply has none. Nothing else
 * differs — same card, same size, same selection ring — because from the
 * picker's point of view they are equally choosable, and drawing them
 * differently would imply otherwise.
 */
function MediaCard({
  item,
  selected,
  onPick,
  onRemove,
}: {
  item: MediaItem;
  selected: boolean;
  onPick?: (item: MediaItem) => void;
  onRemove?: (item: MediaItem) => void;
}) {
  const t = useAdminStrings().media;
  return (
    <li className="group relative">
      <button
        type="button"
        onClick={() => onPick?.(item)}
        className={cn(
          "block w-full overflow-hidden rounded-xl border bg-brand-50 text-start transition-all duration-200",
          selected
            ? "border-brand-600 ring-2 ring-brand-600/30"
            : "border-brand-100 hover:border-brand-300",
          onPick ? "cursor-pointer" : "cursor-default",
        )}
      >
        <span className="relative block h-28 w-full">
          <Image
            src={item.url}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, 200px"
            className="object-cover"
          />
        </span>
        <span className="block px-2.5 py-2">
          <span className="block truncate text-[0.6875rem] font-medium text-ink">
            {item.filename}
          </span>
          <span className="block text-[0.625rem] text-ink-faint">
            {item.size ? formatBytes(item.size) : "—"}
          </span>
        </span>
      </button>

      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(item)}
          title={fill(t.deleteNamed, { name: item.filename })}
          className="absolute top-1.5 end-1.5 inline-flex size-7 items-center justify-center rounded-lg bg-white/90 text-ink-faint opacity-0 shadow-sm backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100 focus:opacity-100 hover:text-red-600"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          <span className="sr-only">
            {fill(t.deleteNamed, { name: item.filename })}
          </span>
        </button>
      )}
    </li>
  );
}

export function MediaLibrary({
  onPick,
  onClose,
  selectedUrl,
}: {
  onPick?: (item: MediaItem) => void;
  onClose?: () => void;
  selectedUrl?: string;
}) {
  const api = useAdminApi();
  const strings = useAdminStrings();
  const t = strings.media;
  const common = strings.common;
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Loads once on mount. Written inline with a cancellation flag rather than
  // as a callback the effect invokes, so a library closed mid-request cannot
  // set state on an unmounted component.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const response = await fetch(api("/media")).catch(() => null);
      if (cancelled) return;

      if (!response?.ok) {
        setError(t.loadFailed);
        setItems([]);
        return;
      }

      const body = (await response.json()) as { items: MediaItem[] };
      if (!cancelled) setItems(body.items);
    })();

    return () => {
      cancelled = true;
    };
    // `t` comes from context and is one of two module constants, so naming the
    // message here cannot re-fire the request.
  }, [api, t.loadFailed]);

  const upload = useCallback(
    async (files: FileList | File[]) => {
      setBusy(true);
      setError("");

      // Sequential rather than parallel: several uploads at once is a reliable
      // way to hit a request limit and lose all of them.
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);

        const response = await fetch(api("/media"), {
          method: "POST",
          body: form,
        }).catch(() => null);

        const body = await response?.json().catch(() => null);

        if (!response?.ok) {
          setError(body?.error ?? fill(t.uploadFailed, { name: file.name }));
          break;
        }
        setItems((current) => [body.item as MediaItem, ...(current ?? [])]);
      }

      setBusy(false);
    },
    [api, t.uploadFailed],
  );

  async function remove(item: MediaItem) {
    if (
      !window.confirm(fill(t.confirmDelete, { name: item.filename }))
    ) {
      return;
    }
    const response = await fetch(
      api(`/media?pathname=${encodeURIComponent(item.pathname)}`),
      { method: "DELETE" },
    ).catch(() => null);

    if (!response?.ok) {
      setError(fill(t.deleteFailed, { name: item.filename }));
      return;
    }
    setItems((current) => current?.filter((i) => i.pathname !== item.pathname) ?? null);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) void upload(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-2xl border-2 border-dashed p-6 text-center transition-colors duration-300",
          dragging
            ? "border-brand-600 bg-brand-50"
            : "border-brand-200 bg-white",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={allowedTypeList}
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) void upload(e.target.files);
            e.target.value = "";
          }}
        />
        <ImagePlus className="mx-auto size-7 text-brand-400" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-ink">
          {t.dragHere}
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="size-4" aria-hidden="true" />
          )}
          {busy ? t.uploading : t.chooseFiles}
        </button>
        <p className="mt-2 text-xs text-ink-faint">
          {fill(t.formats, { size: formatBytes(MAX_UPLOAD_BYTES) })}
        </p>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto">
        {items === null ? (
          <p className="py-10 text-center text-sm text-ink-faint">{t.loading}</p>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-faint">
            {t.empty}
          </p>
        ) : (
          <div className="space-y-6">
            {GROUP_SOURCES.map((source) => {
              const shown = items.filter((item) => item.source === source);
              if (shown.length === 0) return null;

              return (
                <section key={source}>
                  {/* Always labelled, even when only one group has anything in
                      it: the site images cannot be deleted, and a grid of cards
                      with no delete button and no explanation reads as a bug. */}
                  <h3 className="mb-2.5 text-[0.6875rem] font-semibold tracking-wide text-ink-faint uppercase">
                    {source === "upload" ? t.uploads : t.alreadyOnSite}
                  </h3>
                  {source === "site" && (
                    <p className="mb-2.5 text-xs text-ink-faint">
                      {t.siteNote}
                    </p>
                  )}
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {shown.map((item) => (
                      <MediaCard
                        key={item.pathname}
                        item={item}
                        selected={selectedUrl === item.url}
                        onPick={onPick}
                        onRemove={item.source === "upload" ? remove : undefined}
                      />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {onClose && (
        <div className="mt-4 flex justify-end border-t border-brand-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-brand-200 px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-brand-50"
          >
            {common.done}
          </button>
        </div>
      )}
    </div>
  );
}

/** The library in a modal. Escape closes it, and focus is trapped to the
 *  dialog by `aria-modal` plus the backdrop swallowing clicks. */
export function MediaPickerDialog({
  open,
  onPick,
  onClose,
  selectedUrl,
}: {
  open: boolean;
  onPick: (item: MediaItem) => void;
  onClose: () => void;
  selectedUrl?: string;
}) {
  const t = useAdminStrings().media;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Stops the page behind scrolling under the dialog.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t.closeLibrary}
        onClick={onClose}
        className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.library}
        className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between pb-4">
          <h2 className="font-display text-lg font-semibold text-ink">
            {t.library}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand-50 hover:text-ink"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">{t.close}</span>
          </button>
        </div>
        <MediaLibrary onPick={onPick} selectedUrl={selectedUrl} />
      </div>
    </div>
  );
}
