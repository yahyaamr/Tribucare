"use client";

import { useAdminApi } from "@/components/admin/base-path";
import { fill, useAdminStrings } from "@/components/admin/strings";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check, ImagePlus, Loader2, Pencil, Trash2, Upload, X } from "lucide-react";
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

/** One shared empty draft, so resetting the upload form after it is spent is
 *  a reference rather than a fresh literal each time. */
const BLANK_DRAFT: MediaDraft = Object.freeze({ alt: "", description: "" });

/**
 * One image in the library.
 *
 * `onRemove` is what separates the two kinds: an upload passes it and gets the
 * delete affordance, a site image does not and simply has none. Nothing else
 * differs — same card, same size, same selection ring — because from the
 * picker's point of view they are equally choosable, and drawing them
 * differently would imply otherwise.
 */
/** The two note fields an image carries. */
export interface MediaDraft {
  alt: string;
  description: string;
}

/** The small fields used by the card's editor and by the upload form, so a
 *  caption is typed into the same control in both places. */
const NOTE_FIELD =
  "w-full rounded-lg border border-brand-200 bg-white px-2 py-1.5 text-[0.6875rem] text-ink transition-colors placeholder:text-ink-faint focus:border-brand-600 focus:outline-none";

function MediaCard({
  item,
  selected,
  draft,
  saving,
  onPick,
  onRemove,
  onEdit,
  onDraftChange,
  onSave,
  onCancel,
}: {
  item: MediaItem;
  selected: boolean;
  /** Non-null while this card is the one being described. */
  draft: MediaDraft | null;
  saving: boolean;
  onPick?: (item: MediaItem) => void;
  onRemove?: (item: MediaItem) => void;
  /** Absent in a read-only context; present everywhere the panel can write. */
  onEdit?: (item: MediaItem) => void;
  onDraftChange?: (draft: MediaDraft) => void;
  onSave?: () => void;
  onCancel?: () => void;
}) {
  const strings = useAdminStrings();
  const t = strings.media;

  if (draft) {
    // Editing replaces the card's body rather than opening a dialog: the
    // library is itself already a dialog half the time, and a modal over a
    // modal is a trap with two Escapes to guess between.
    return (
      <li className="rounded-xl border border-brand-300 bg-white p-2 ring-2 ring-brand-600/20">
        <span className="relative block h-16 w-full overflow-hidden rounded-lg bg-brand-50">
          <Image
            src={item.url}
            alt=""
            fill
            sizes="200px"
            className="object-cover"
          />
        </span>
        <span className="mt-2 block truncate text-[0.625rem] text-ink-faint">
          {item.filename}
        </span>
        <div className="mt-1.5 space-y-1.5">
          <input
            autoFocus
            value={draft.alt}
            placeholder={t.altLabel}
            aria-label={t.altLabel}
            onChange={(e) => onDraftChange?.({ ...draft, alt: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave?.();
              if (e.key === "Escape") onCancel?.();
            }}
            className={NOTE_FIELD}
          />
          <input
            value={draft.description}
            placeholder={t.descriptionLabel}
            aria-label={t.descriptionLabel}
            onChange={(e) =>
              onDraftChange?.({ ...draft, description: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave?.();
              if (e.key === "Escape") onCancel?.();
            }}
            className={NOTE_FIELD}
          />
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-brand-700 px-2 py-1.5 text-[0.6875rem] font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="size-3 animate-spin" aria-hidden="true" />
              ) : (
                <Check className="size-3" aria-hidden="true" />
              )}
              {strings.common.save}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-2 py-1.5 text-[0.6875rem] font-semibold text-ink-faint transition-colors hover:bg-brand-50 hover:text-ink"
            >
              {strings.common.cancel}
            </button>
          </div>
        </div>
      </li>
    );
  }

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
          {/* The alt text in place of the byte count when there is one: it is
              what a writer is looking for when scanning the library, and a
              card with none says so rather than looking merely untidy. */}
          {item.alt ? (
            <span className="block truncate text-[0.625rem] text-ink-soft">
              {item.alt}
            </span>
          ) : (
            <span className="block text-[0.625rem] font-medium text-signal-600">
              {t.needsAlt}
            </span>
          )}
          <span className="block text-[0.625rem] text-ink-faint">
            {item.size ? formatBytes(item.size) : "—"}
          </span>
        </span>
      </button>

      <div className="absolute top-1.5 end-1.5 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(item)}
            title={fill(t.editNamed, { name: item.filename })}
            className="inline-flex size-7 items-center justify-center rounded-lg bg-white/90 text-ink-faint shadow-sm backdrop-blur-md transition-colors hover:text-brand-800"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            <span className="sr-only">
              {fill(t.editNamed, { name: item.filename })}
            </span>
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(item)}
            title={fill(t.deleteNamed, { name: item.filename })}
            className="inline-flex size-7 items-center justify-center rounded-lg bg-white/90 text-ink-faint shadow-sm backdrop-blur-md transition-colors hover:text-red-600"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            <span className="sr-only">
              {fill(t.deleteNamed, { name: item.filename })}
            </span>
          </button>
        )}
      </div>
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
  /** The notes to attach to whatever is uploaded next, so an image can be
   *  described before it is sent rather than found again afterwards. */
  const [uploadDraft, setUploadDraft] = useState<MediaDraft>(BLANK_DRAFT);
  /** Which card is being described, and what has been typed into it. */
  const [editing, setEditing] = useState<
    { pathname: string; draft: MediaDraft } | null
  >(null);
  const [saving, setSaving] = useState(false);

  // `upload` is memoised on the API base, so it cannot read the draft from a
  // closure without going stale. A ref is the value it reads instead.
  const draftRef = useRef(uploadDraft);
  useEffect(() => {
    draftRef.current = uploadDraft;
  }, [uploadDraft]);

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
        // Read from the ref, not from the closure: `upload` is a callback and
        // would otherwise carry whatever was typed when it was last created.
        form.append("alt", draftRef.current.alt);
        form.append("description", draftRef.current.description);

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

      // Cleared once spent, so the next upload does not silently inherit the
      // last one's alt text — which would be worse than having none.
      setUploadDraft(BLANK_DRAFT);
      setBusy(false);
    },
    [api, t.uploadFailed],
  );

  /** Saves one image's notes. The list is patched in place rather than
   *  refetched, so the grid does not jump under the cursor. */
  async function saveNotes() {
    if (!editing) return;
    setSaving(true);
    setError("");

    const response = await fetch(api("/media"), {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        pathname: editing.pathname,
        alt: editing.draft.alt,
        description: editing.draft.description,
      }),
    }).catch(() => null);

    const body = await response?.json().catch(() => null);
    setSaving(false);

    if (!response?.ok) {
      setError(body?.error ?? t.saveFailed);
      return;
    }

    const meta = body.meta as MediaDraft;
    setItems(
      (current) =>
        current?.map((i) =>
          i.pathname === editing.pathname ? { ...i, ...meta } : i,
        ) ?? null,
    );
    setEditing(null);
  }

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
        {/* Said out loud, because the file that comes back out of the library
            is not the file that went in — a PNG uploaded here is a .webp
            afterwards, and finding that out from the filename is a surprise. */}
        <p className="mt-1 text-xs text-ink-faint">{t.convertedNote}</p>

        {/* Described before it is sent, which is the whole point: an image
            uploaded and then hunted down again to caption is two trips for
            one thought. Optional, and cleared once spent. */}
        <div className="mx-auto mt-4 max-w-md text-start">
          <p className="text-[0.6875rem] font-semibold tracking-wide text-ink-faint uppercase">
            {t.describeUpload}
          </p>
          <div className="mt-1.5 space-y-1.5">
            <input
              value={uploadDraft.alt}
              placeholder={t.altPlaceholder}
              aria-label={t.altLabel}
              onChange={(e) =>
                setUploadDraft({ ...uploadDraft, alt: e.target.value })
              }
              className={NOTE_FIELD}
            />
            <input
              value={uploadDraft.description}
              placeholder={t.descriptionPlaceholder}
              aria-label={t.descriptionLabel}
              onChange={(e) =>
                setUploadDraft({ ...uploadDraft, description: e.target.value })
              }
              className={NOTE_FIELD}
            />
          </div>
          <p className="mt-1.5 text-[0.625rem] leading-relaxed text-ink-faint">
            {t.describeUploadHint}
          </p>
        </div>
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
                        draft={
                          editing?.pathname === item.pathname
                            ? editing.draft
                            : null
                        }
                        saving={saving && editing?.pathname === item.pathname}
                        onPick={onPick}
                        onRemove={item.source === "upload" ? remove : undefined}
                        // Offered for a site image too: the sidecar is keyed
                        // by pathname, so artwork committed with the code can
                        // be described even though it cannot be replaced.
                        onEdit={(picked) =>
                          setEditing({
                            pathname: picked.pathname,
                            draft: {
                              alt: picked.alt,
                              description: picked.description,
                            },
                          })
                        }
                        onDraftChange={(draft) =>
                          setEditing((current) =>
                            current ? { ...current, draft } : current,
                          )
                        }
                        onSave={saveNotes}
                        onCancel={() => setEditing(null)}
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

/**
 * Alt text and a description for the image a post or news item is using as its
 * cover, edited in the editor's own rail.
 *
 * It writes to the **media item**, not to the record — alt text describes the
 * picture, so the same picture wants the same sentence wherever it appears,
 * and a cover shared by two posts should not be able to disagree with itself.
 * That is why this saves on its own button rather than riding the editor's
 * Save: it is not part of the draft, and it must not be lost when a draft is
 * abandoned or be written when one is.
 *
 * Mount it with `key={url}` — the loaded notes are the initial state, so a
 * changed cover needs a fresh component rather than a reset inside an effect.
 */
export function CoverNotes({ url }: { url: string }) {
  const api = useAdminApi();
  const strings = useAdminStrings();
  const t = strings.media;
  /** `null` until the stored notes arrive, so the fields never show a blank
   *  that could be saved over the top of a real caption. */
  const [draft, setDraft] = useState<MediaDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const response = await fetch(
        api(`/media?url=${encodeURIComponent(url)}`),
      ).catch(() => null);
      const body = await response?.json().catch(() => null);
      if (cancelled) return;
      setDraft(
        response?.ok && body?.meta ? (body.meta as MediaDraft) : BLANK_DRAFT,
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [api, url]);

  async function save() {
    if (!draft) return;
    setSaving(true);
    setError("");

    const response = await fetch(api("/media"), {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url, alt: draft.alt, description: draft.description }),
    }).catch(() => null);

    const body = await response?.json().catch(() => null);
    setSaving(false);

    if (!response?.ok) {
      setError(body?.error ?? t.saveFailed);
      return;
    }
    setSaved(true);
  }

  if (!draft) {
    return <p className="text-[0.6875rem] text-ink-faint">{t.loading}</p>;
  }

  return (
    <div className="space-y-1.5 border-t border-brand-100 pt-2.5">
      <input
        value={draft.alt}
        placeholder={t.altPlaceholder}
        aria-label={t.altLabel}
        onChange={(e) => {
          setDraft({ ...draft, alt: e.target.value });
          setSaved(false);
        }}
        className={NOTE_FIELD}
      />
      <input
        value={draft.description}
        placeholder={t.descriptionPlaceholder}
        aria-label={t.descriptionLabel}
        onChange={(e) => {
          setDraft({ ...draft, description: e.target.value });
          setSaved(false);
        }}
        className={NOTE_FIELD}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-1 rounded-lg border border-brand-200 px-2.5 py-1 text-[0.6875rem] font-semibold text-ink-soft transition-colors hover:bg-brand-50 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="size-3 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="size-3" aria-hidden="true" />
          )}
          {strings.common.save}
        </button>
        {saved && (
          <span className="text-[0.6875rem] font-medium text-brand-700">
            {t.savedNotice}
          </span>
        )}
        {error && (
          <span role="alert" className="text-[0.6875rem] text-red-600">
            {error}
          </span>
        )}
      </div>
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
