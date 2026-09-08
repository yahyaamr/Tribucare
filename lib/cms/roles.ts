import { getStore } from "./store";
import { getContent } from "@/content";
import type { Bilingual, Role } from "./types";
import type { Locale } from "@/lib/i18n/config";

/**
 * The open roles behind the homepage careers cards.
 *
 * One document per role, the way `posts` and `news` store theirs — not the
 * single-document shape `authors` uses, even though the list is short enough
 * for it. Blob reads are eventually consistent by a few seconds, and a single
 * document makes every save a read-modify-write of all three: fix a typo on one
 * card, open the next, and the second save can be built on a read taken before
 * the first landed, silently putting the first card back. A record that only
 * ever writes itself cannot lose a sibling's edit.
 *
 * Roles are a *fixed* set — the panel edits the three that exist rather than
 * opening and closing vacancies — so there is no create, no delete and no slug,
 * and `order` carries the position the list no longer implies.
 *
 * Roles carry both languages inside the record (see `Bilingual`), which is the
 * one place the CMS is bilingual. They had a full Arabic override in
 * `content/ar/site.ts` before they moved here, and losing it would have made
 * the Arabic homepage worse than it was.
 */

const ROLES_PREFIX = "cms/careers/";
const rolePath = (id: string) => `${ROLES_PREFIX}${id}.json`;

/**
 * Written once, beside the document, and then only ever read.
 *
 * An empty read has two causes that look identical from here — nothing has been
 * seeded yet, or the store did not answer — and `readRoles` turns a failure into
 * `[]` the same way every other reader in this folder does. Seeding on that
 * alone means one unlucky read overwrites an editor's work with the originals,
 * which is exactly what it did before this marker existed. Once this file is
 * present the seed never runs again, so the worst an unanswered read can do is
 * render the static fallback for one request.
 */
const SEED_MARKER = "cms/careers-seeded.json";

function bilingual(value: unknown): Bilingual {
  if (typeof value === "string") return { en: value, ar: "" };
  if (typeof value !== "object" || value === null) return { en: "", ar: "" };
  const pair = value as Partial<Bilingual>;
  return {
    en: typeof pair.en === "string" ? pair.en : "",
    ar: typeof pair.ar === "string" ? pair.ar : "",
  };
}

/** Tolerant of a hand-edited document, like every other parser here: a record
 *  without an id is dropped, anything else missing becomes empty rather than
 *  taking the whole list down with it. */
function parseRole(value: unknown): Role | null {
  if (typeof value !== "object" || value === null) return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.id !== "string" || !raw.id) return null;
  return {
    id: raw.id,
    order: typeof raw.order === "number" ? raw.order : 0,
    icon: typeof raw.icon === "string" ? raw.icon : "",
    title: bilingual(raw.title),
    department: bilingual(raw.department),
    type: bilingual(raw.type),
    location: bilingual(raw.location),
    blurb: bilingual(raw.blurb),
  };
}

async function readRoles(strict: boolean): Promise<Role[]> {
  const store = getStore();
  let found;
  try {
    found = await store.list(ROLES_PREFIX);
  } catch (error) {
    if (strict) throw error;
    return [];
  }

  const roles = await Promise.all(
    found
      .filter((object) => object.pathname.endsWith(".json"))
      .map(async (object) => {
        const raw = strict
          ? await store.read(object.pathname)
          : await store.read(object.pathname).catch(() => null);
        if (!raw) return null;
        try {
          return parseRole(JSON.parse(raw));
        } catch {
          return null;
        }
      }),
  );

  return roles
    .filter((role): role is Role => role !== null)
    .sort((a, b) => a.order - b.order);
}

async function writeRole(role: Role) {
  await getStore().put(
    rolePath(role.id),
    JSON.stringify(role, null, 2),
    "application/json",
  );
}

/**
 * The roles as they were before they moved into the panel.
 *
 * The two bundles are read through `getContent` rather than the override file
 * directly, so the Arabic that arrives is the merged result the site was
 * actually rendering — the panel opens showing the three cards exactly as they
 * were, in both languages, instead of three blank forms someone has to retype.
 *
 * Arrays merge by index in `content/`, so the two lists are the same length and
 * in the same order; the `?? ""` is there for the case where they stop being.
 */
function seedRoles(): Role[] {
  const en = getContent("en").careers.roles;
  const ar = getContent("ar").careers.roles;

  return en.map((role, i) => ({
    id: role.id,
    order: i,
    icon: role.icon,
    title: { en: role.title, ar: ar[i]?.title ?? "" },
    department: { en: role.department, ar: ar[i]?.department ?? "" },
    type: { en: role.type, ar: ar[i]?.type ?? "" },
    location: { en: role.location, ar: ar[i]?.location ?? "" },
    blurb: { en: role.blurb, ar: ar[i]?.blurb ?? "" },
  }));
}

/**
 * A pure read — **this never writes.**
 *
 * The public careers section calls it on every render, and a page render has no
 * business writing to storage: when several were in flight at once they raced
 * each other to seed, and a slow one landed after an editor's save and undid
 * it. Seeding is now a deliberate, authenticated act (`ensureRolesSeeded`), and
 * an empty answer here is a fallback for the caller to handle rather than
 * something to repair in place.
 */
export async function getRoles(): Promise<Role[]> {
  return readRoles(false);
}

/**
 * Fills the document the first time the panel is opened, once and only once.
 *
 * Admin-only: nothing on the public site calls this. A visitor never triggers a
 * write, and the section they see is identical either way because the fallback
 * it renders *is* this seed.
 */
export async function ensureRolesSeeded(): Promise<Role[]> {
  // Strict on purpose: "no roles" must mean the store answered and holds
  // none, never that it failed to answer. Seeding on a failed read would
  // overwrite the three real roles with the originals.
  const roles = await readRoles(true);
  if (roles.length > 0) return roles;

  const store = getStore();
  const marker = await store.read(SEED_MARKER);
  // Seeded before, so this empty read is a blip. Hand back nothing rather than
  // overwriting whatever is really in there.
  if (marker) return [];

  const seeded = seedRoles();
  await Promise.all(seeded.map(writeRole));
  await store.put(
    SEED_MARKER,
    JSON.stringify({ seededAt: new Date().toISOString() }, null, 2),
    "application/json",
  );
  return seeded;
}

/** Admin-only, so it seeds: opening a role directly has to work on a fresh
 *  install, not only after the list page has been visited. */
export async function getRoleById(id: string): Promise<Role | null> {
  return (await ensureRolesSeeded()).find((role) => role.id === id) ?? null;
}

/**
 * Writes one role, and only that role.
 *
 * `order` is taken from the stored record rather than the payload: it is the
 * homepage's layout, not a field the editor exposes, and letting a request set
 * it would let a malformed one reshuffle the section.
 */
export async function saveRole(role: Role, existing: Role): Promise<Role> {
  const next: Role = { ...role, id: existing.id, order: existing.order };
  await writeRole(next);
  return next;
}

/** Picks a language, falling back to English so a half-translated role renders
 *  a complete card rather than a blank one. */
export function pick(value: Bilingual, locale: Locale): string {
  if (locale === "ar") return value.ar.trim() || value.en;
  return value.en;
}

/** The shape `<RoleCard>` takes — one language, flattened. */
export function localiseRole(role: Role, locale: Locale) {
  return {
    id: role.id,
    icon: role.icon,
    title: pick(role.title, locale),
    department: pick(role.department, locale),
    type: pick(role.type, locale),
    location: pick(role.location, locale),
    blurb: pick(role.blurb, locale),
  };
}

/**
 * Flat `{field: message}` map, the same contract the news validator returns and
 * the editor renders.
 *
 * Only English is required. Arabic is allowed to be empty because `pick` covers
 * it, and blocking a save on a missing translation would mean an editor fixing
 * an English typo has to translate the whole card first.
 */
export function validateRole(role: Role): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!role.title.en.trim()) errors.title = "Give the role a title in English.";
  if (!role.type.en.trim()) errors.type = "Set the employment type in English.";
  if (!role.department.en.trim()) {
    errors.department = "Set the department in English.";
  }
  if (!role.location.en.trim()) {
    errors.location = "Set the location in English.";
  }
  if (!role.blurb.en.trim()) {
    errors.blurb = "Write the short description in English.";
  }
  return errors;
}
