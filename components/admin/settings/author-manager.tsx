"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ImagePlus, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Author } from "@/lib/cms/types";
import { MediaPickerDialog } from "../media-picker";
import { DeleteWarning } from "./category-manager";

type Draft = { name: string; role: string; avatar: string };

const EMPTY: Draft = { name: "", role: "", avatar: "" };

const FIELD =
  "w-full rounded-lg border border-brand-200/80 bg-white px-3 py-2 text-sm text-ink transition-colors placeholder:text-ink-faint focus:border-brand-600 focus:outline-none";

function Avatar({ author }: { author: Pick<Author, "name" | "avatar"> }) {
  if (author.avatar) {
    return (
      <Image
        src={author.avatar}
        alt=""
        width={36}
        height={36}
        className="size-9 shrink-0 rounded-full object-cover ring-1 ring-brand-200"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[0.6875rem] font-semibold text-brand-800 ring-1 ring-brand-200"
    >
      {author.name.slice(0, 2).toUpperCase() || "?"}
    </span>
  );
}

/**
 * The name/role/photo trio, shared by the add form and the edit row.
 *
 * At module scope on purpose: declared inside the manager it would be a fresh
 * component type on every render, so React would remount these inputs and the
 * field would lose focus after each keystroke.
 */
function Fields({
  value,
  onChange,
  onPick,
}: {
  value: Draft;
  onChange: (next: Draft) => void;
  onPick: () => void;
}) {
  return (
    <div className="flex-1 space-y-2">
      <input
        autoFocus
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        placeholder="Full name"
        className={FIELD}
      />
      <input
        value={value.role}
        onChange={(e) => onChange({ ...value, role: e.target.value })}
        placeholder="Role, e.g. Medical Advisory Lead"
        className={FIELD}
      />
      <div className="flex gap-2">
        <input
          value={value.avatar}
          onChange={(e) => onChange({ ...value, avatar: e.target.value })}
          placeholder="Photo URL (optional)"
          className={FIELD}
        />
        <button
          type="button"
          onClick={onPick}
          title="Choose from the media library"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-brand-200 px-3 text-xs font-semibold text-ink-soft transition-colors hover:bg-brand-50"
        >
          <ImagePlus className="size-3.5" aria-hidden="true" />
          Choose
        </button>
      </div>
    </div>
  );
}

/**
 * Author management.
 *
 * Posts reference an author rather than embedding one, so an edit here reaches
 * every article that person wrote — which is the whole reason authors moved out
 * of the post editor. The rename keeps the author's id, so nothing is orphaned.
 *
 * Deleting warns first, and names the posts that would lose their byline.
 */
export function AuthorManager({ initial }: { initial: Author[] }) {
  const router = useRouter();
  const [authors, setAuthors] = useState(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState<Draft>(EMPTY);
  const [confirming, setConfirming] = useState<{
    author: Author;
    posts: { id: string; title: string; status: string }[];
  } | null>(null);
  const [picking, setPicking] = useState<"new" | "edit" | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function call(input: RequestInfo, init: RequestInit, key: string) {
    setBusy(key);
    setError("");
    const response = await fetch(input, init).catch(() => null);
    const body = await response?.json().catch(() => null);
    setBusy(null);
    return { ok: Boolean(response?.ok), status: response?.status ?? 0, body };
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!draft?.name.trim()) return;

    const { ok, body } = await call(
      "/api/admin/authors",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      },
      "new",
    );

    if (!ok) return setError(body?.error ?? "Could not add that author.");
    setAuthors(body.authors);
    setDraft(null);
    router.refresh();
  }

  async function save(id: string) {
    const { ok, body } = await call(
      `/api/admin/authors/${id}`,
      {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(edit),
      },
      id,
    );

    if (!ok) return setError(body?.error ?? "Could not save that author.");
    setAuthors(body.authors);
    setEditingId(null);
    router.refresh();
  }

  async function requestDelete(author: Author) {
    const { ok, status, body } = await call(
      `/api/admin/authors/${author.id}`,
      { method: "DELETE" },
      author.id,
    );

    if (ok) {
      setAuthors(body.authors);
      router.refresh();
      return;
    }

    if (status === 409 && body?.posts) {
      setConfirming({ author, posts: body.posts });
      return;
    }
    setError(body?.error ?? "Could not delete that author.");
  }

  async function confirmDelete() {
    if (!confirming) return;

    const { ok, body } = await call(
      `/api/admin/authors/${confirming.author.id}?force=true`,
      { method: "DELETE" },
      confirming.author.id,
    );

    if (!ok) return setError(body?.error ?? "Could not delete that author.");
    setAuthors(body.authors);
    setConfirming(null);
    router.refresh();
  }

  return (
    <section className="card-surface overflow-hidden">
      <div className="border-b border-brand-100 bg-brand-50/50 px-5 py-3.5">
        <h2 className="font-display text-base font-semibold text-ink">Authors</h2>
        <p className="mt-0.5 text-xs text-ink-soft">
          Bylines are managed here, not on each post. Correcting a name or photo
          updates every article that author wrote.
        </p>
      </div>

      {error && (
        <p role="alert" className="border-b border-red-100 bg-red-50 px-5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <ul className="divide-y divide-brand-50">
        {authors.length === 0 && (
          <li className="px-5 py-8 text-center text-sm text-ink-faint">
            No authors yet.
          </li>
        )}

        {authors.map((author) => (
          <li key={author.id} className="group px-5 py-3">
            {editingId === author.id ? (
              <div className="flex items-start gap-3">
                <Avatar author={{ name: edit.name, avatar: edit.avatar }} />
                <Fields
                  value={edit}
                  onChange={setEdit}
                  onPick={() => setPicking("edit")}
                />
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => save(author.id)}
                    disabled={busy === author.id}
                    className="inline-flex size-8 items-center justify-center rounded-lg bg-brand-700 text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
                  >
                    {busy === author.id ? (
                      <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Check className="size-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">Save</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand-50"
                  >
                    <X className="size-4" aria-hidden="true" />
                    <span className="sr-only">Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Avatar author={author} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {author.name}
                  </p>
                  {author.role && (
                    <p className="truncate text-xs text-ink-faint">
                      {author.role}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-0.5 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(author.id);
                      setEdit({
                        name: author.name,
                        role: author.role,
                        avatar: author.avatar,
                      });
                    }}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand-100 hover:text-brand-800"
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">Edit {author.name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => requestDelete(author)}
                    disabled={busy === author.id}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                  >
                    {busy === author.id ? (
                      <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    )}
                    <span className="sr-only">Delete {author.name}</span>
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="border-t border-brand-100 px-5 py-3.5">
        {draft ? (
          <form onSubmit={create} className="flex items-start gap-3">
            <Avatar author={{ name: draft.name, avatar: draft.avatar }} />
            <Fields
              value={draft}
              onChange={setDraft}
              onPick={() => setPicking("new")}
            />
            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="submit"
                disabled={!draft.name.trim() || busy === "new"}
                className="inline-flex size-8 items-center justify-center rounded-lg bg-brand-700 text-white transition-colors hover:bg-brand-800 disabled:opacity-50"
              >
                {busy === "new" ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Check className="size-4" aria-hidden="true" />
                )}
                <span className="sr-only">Add author</span>
              </button>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="inline-flex size-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand-50"
              >
                <X className="size-4" aria-hidden="true" />
                <span className="sr-only">Cancel</span>
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setDraft({ ...EMPTY })}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add author
          </button>
        )}
      </div>

      <MediaPickerDialog
        open={picking !== null}
        selectedUrl={picking === "edit" ? edit.avatar : (draft?.avatar ?? "")}
        onClose={() => setPicking(null)}
        onPick={(item) => {
          if (picking === "edit") setEdit((v) => ({ ...v, avatar: item.url }));
          else setDraft((v) => (v ? { ...v, avatar: item.url } : v));
          setPicking(null);
        }}
      />

      {confirming && (
        <DeleteWarning
          title={`Delete “${confirming.author.name}”?`}
          busy={busy === confirming.author.id}
          onCancel={() => setConfirming(null)}
          onConfirm={confirmDelete}
          lead={
            <>
              They are credited on{" "}
              <strong className="font-semibold">
                {confirming.posts.length} post
                {confirming.posts.length === 1 ? "" : "s"}
              </strong>
              . The {confirming.posts.length === 1 ? "post is" : "posts are"} not
              deleted.
            </>
          }
          warning={
            <>
              <strong className="font-semibold">
                {confirming.posts.length === 1 ? "This post" : "These posts"} will
                be left with no byline
              </strong>{" "}
              — the author name, role and photo stop showing on the article and
              its cards. Assign a new author afterwards to restore them.
            </>
          }
          rows={confirming.posts.map((post) => ({
            id: post.id,
            title: post.title,
            status: post.status,
            flagged: true,
            flagLabel: "loses its byline",
          }))}
        />
      )}
    </section>
  );
}
