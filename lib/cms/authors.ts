import { getStore } from "./store";
import { newId, slugify } from "./format";
import type { Author } from "./types";

/**
 * The author list.
 *
 * Authors used to be typed into each post, three fields at a time, which meant
 * the same person existed as several slightly different records — a corrected
 * job title or a new photo had to be applied post by post, and one typo made a
 * second author. They are managed once here now, and posts hold a reference.
 *
 * The store is a single JSON document rather than a file each: the list is
 * short, always read whole, and one document means renaming is a single write.
 */

const AUTHORS_PATH = "cms/authors.json";

export function normaliseAuthorName(name: string) {
  return name.trim().replace(/\s+/g, " ").slice(0, 80);
}

async function readAuthors(): Promise<Author[]> {
  const raw = await getStore()
    .read(AUTHORS_PATH)
    .catch(() => null);
  if (!raw) return [];
  try {
    const value = JSON.parse(raw) as { authors?: unknown };
    if (!Array.isArray(value.authors)) return [];
    return value.authors.filter(
      (a): a is Author =>
        typeof a === "object" &&
        a !== null &&
        typeof (a as Author).id === "string" &&
        typeof (a as Author).name === "string",
    );
  } catch {
    return [];
  }
}

async function writeAuthors(authors: Author[]) {
  await getStore().put(
    AUTHORS_PATH,
    JSON.stringify({ authors }, null, 2),
    "application/json",
  );
}

/**
 * The id a legacy post's inline author maps to.
 *
 * Derived from the name so the mapping is deterministic: the seeded author
 * records and the `authorId` that `parsePost` invents for an un-migrated post
 * land on the same value without either having to know about the other.
 */
export function legacyAuthorId(name: string) {
  return slugify(name) || "";
}

export async function getAuthors(): Promise<Author[]> {
  const authors = await readAuthors();
  return [...authors].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAuthorMap(): Promise<Map<string, Author>> {
  return new Map((await readAuthors()).map((a) => [a.id, a]));
}

/**
 * Creates author records for anyone who only exists inside a post.
 *
 * Runs whenever posts are read. It is idempotent — an author whose derived id
 * is already present is skipped — so it costs one read once the list is
 * populated, and it means the six seeded articles arrive with their bylines
 * already in Settings rather than needing to be re-entered.
 */
export async function ensureAuthorsFor(
  inline: { name: string; role: string; avatar: string }[],
) {
  const existing = await readAuthors();
  const known = new Set(existing.map((a) => a.id));
  const added: Author[] = [];

  for (const person of inline) {
    const name = normaliseAuthorName(person.name);
    if (!name) continue;
    const id = legacyAuthorId(name);
    if (!id || known.has(id)) continue;
    known.add(id);
    added.push({ id, name, role: person.role ?? "", avatar: person.avatar ?? "" });
  }

  if (added.length === 0) return existing;

  const next = [...existing, ...added];
  await writeAuthors(next);
  return next;
}

export async function createAuthor(input: {
  name: string;
  role?: string;
  avatar?: string;
}): Promise<{ ok: true; author: Author } | { ok: false; error: string }> {
  const name = normaliseAuthorName(input.name);
  if (!name) return { ok: false, error: "Give the author a name." };

  const authors = await readAuthors();
  if (authors.some((a) => a.name.toLowerCase() === name.toLowerCase())) {
    return { ok: false, error: `“${name}” is already in the list.` };
  }

  // Prefer the name-derived id so a person added here and the same person
  // found inside an old post resolve to one record rather than two.
  const derived = legacyAuthorId(name);
  const id = derived && !authors.some((a) => a.id === derived) ? derived : newId("a");

  const author: Author = {
    id,
    name,
    role: (input.role ?? "").trim(),
    avatar: (input.avatar ?? "").trim(),
  };

  await writeAuthors([...authors, author]);
  return { ok: true, author };
}

export async function updateAuthor(
  id: string,
  patch: { name?: string; role?: string; avatar?: string },
): Promise<{ ok: true; author: Author } | { ok: false; error: string }> {
  const authors = await readAuthors();
  const index = authors.findIndex((a) => a.id === id);
  if (index === -1) return { ok: false, error: "That author no longer exists." };

  const name =
    patch.name === undefined
      ? authors[index].name
      : normaliseAuthorName(patch.name);
  if (!name) return { ok: false, error: "Give the author a name." };

  if (
    authors.some(
      (a) => a.id !== id && a.name.toLowerCase() === name.toLowerCase(),
    )
  ) {
    return { ok: false, error: `Another author is already called “${name}”.` };
  }

  // The id never changes on a rename — that is the whole point of the
  // reference. Every post keeps pointing at this record.
  const author: Author = {
    ...authors[index],
    name,
    role: patch.role === undefined ? authors[index].role : patch.role.trim(),
    avatar:
      patch.avatar === undefined ? authors[index].avatar : patch.avatar.trim(),
  };

  const next = [...authors];
  next[index] = author;
  await writeAuthors(next);
  return { ok: true, author };
}

export async function deleteAuthor(id: string) {
  const authors = await readAuthors();
  await writeAuthors(authors.filter((a) => a.id !== id));
}
