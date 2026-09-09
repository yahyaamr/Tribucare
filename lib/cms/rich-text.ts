/**
 * Inline marks — the one place the block model admits formatting.
 *
 * A block used to hold a plain string, which is why the editor could offer no
 * bold, no italic and no links: there was nowhere to put the mark. That is now
 * relaxed by exactly one notch. A block's text is an **inline HTML fragment**
 * drawn from the closed list below, and nothing else:
 *
 *     strong  em  u  s  code  sup  sub  a[href]  br
 *
 * The list is closed on purpose, and it is closed at the *inline* level. Block
 * structure — what is a heading, what is a list, what is a pull-quote — stays
 * the editor's decision and stays styled by the article template, so a pasted
 * article still arrives wearing the site's type scale rather than the source
 * document's. Nothing here can carry a colour, a font, a size, a class, a
 * style attribute or an id: every one of those is dropped, which is the whole
 * reason this is a whitelist and not a blocklist.
 *
 * `sanitizeInline` is the gate, and it is applied on the way *out* as well as
 * on the way in — `article-body.tsx` sanitizes every fragment it renders, so a
 * record hand-edited in storage, seeded from a file, or written by an older
 * build still cannot put a script on the page.
 *
 * Pure string work, no DOM: this runs on the server (the published page), in
 * the route handlers (on save) and in the browser (the editor).
 */

/** Everything that survives, and what it is normalised to. `execCommand` still
 *  emits `<b>` and `<i>` in some browsers, and a pasted document is full of
 *  `<del>` and `<ins>` — they all land on one canonical tag so two identical
 *  looking fragments compare equal. */
const TAGS = new Map<string, string>([
  ["b", "strong"],
  ["strong", "strong"],
  ["i", "em"],
  ["em", "em"],
  ["cite", "em"],
  ["var", "em"],
  ["u", "u"],
  ["ins", "u"],
  ["s", "s"],
  ["strike", "s"],
  ["del", "s"],
  ["code", "code"],
  ["kbd", "code"],
  ["samp", "code"],
  ["sup", "sup"],
  ["sub", "sub"],
  ["a", "a"],
  ["br", "br"],
]);

const VOID_TAGS = new Set(["br"]);

/** Deep enough for anything a writer means (a link inside a bold run inside an
 *  italic one), shallow enough that a pathological paste cannot make the
 *  renderer walk a thousand levels of `<span>`-turned-nothing. */
const MAX_DEPTH = 8;

const TAG_RE = /<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>])*)>/g;
const ATTR_RE = /([a-zA-Z][a-zA-Z0-9:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
const ENTITY_RE = /&(#\d{1,7}|#[xX][0-9a-fA-F]{1,6}|[a-zA-Z][a-zA-Z0-9]{1,30});/g;

/** Only the references a pasted document actually produces. Anything else is
 *  left as written — an unknown entity is text, not a decoding failure. */
const NAMED: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  bull: "•",
  middot: "·",
  deg: "°",
  times: "×",
  trade: "™",
  reg: "®",
  copy: "©",
};

/** Entity references are left standing rather than re-escaped, so a fragment
 *  that has already been through here is unchanged by a second pass — which is
 *  what lets the renderer sanitize on every render without the text drifting. */
function escapeText(input: string) {
  return input
    .replace(
      /&(#\d{1,7};|#[xX][0-9a-fA-F]{1,6};|[a-zA-Z][a-zA-Z0-9]{1,30};)?/g,
      (_match, entity: string | undefined) => (entity ? `&${entity}` : "&amp;"),
    )
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(input: string) {
  return escapeText(input).replace(/"/g, "&quot;");
}

export function decodeEntities(input: string) {
  return input.replace(ENTITY_RE, (match, body: string) => {
    if (body.startsWith("#")) {
      const code =
        body[1] === "x" || body[1] === "X"
          ? Number.parseInt(body.slice(2), 16)
          : Number.parseInt(body.slice(1), 10);
      // Control characters are how `java&#09;script:` gets past a naive check.
      if (!Number.isFinite(code) || code < 0x20 || code > 0x10ffff) return "";
      return String.fromCodePoint(code);
    }
    return NAMED[body.toLowerCase()] ?? match;
  });
}

/** Whitespace and control characters, stripped before a URL's scheme is read:
 *  `java\nscript:` is one URL to a browser and a different string to a regex. */
const URL_NOISE = /[\u0000-\u0020\u00a0\u1680\u2000-\u200f\u2028-\u202f\u205f\u3000\ufeff]/g;

/**
 * A link target that is safe to put in an `href`.
 *
 * Anything carrying a scheme other than http, https, mailto or tel is dropped
 * outright — `javascript:` and `data:` are the two that matter, and a
 * whitelist means the next one nobody thought of is refused too.
 */
function safeHref(raw: string): string | null {
  const value = decodeEntities(raw).trim();
  if (!value) return null;

  const flattened = value.replace(URL_NOISE, "");
  if (/^[a-z][a-z0-9+.-]*:/i.test(flattened)) {
    return /^(https?|mailto|tel):/i.test(flattened) ? value : null;
  }
  // No scheme at all: a path, an anchor or a bare relative link.
  return value;
}

function readAttributes(raw: string) {
  const found = new Map<string, string>();
  ATTR_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = ATTR_RE.exec(raw))) {
    found.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? "");
  }
  return found;
}

/**
 * Reduce a fragment to the whitelist.
 *
 * A tag that is not on the list is *unwrapped*, never deleted with its
 * contents: pasted markup is mostly `<span>`, `<font>` and `<div>` wrapped
 * around the words the writer actually wants, so dropping the subtree would
 * throw the article away. `<script>` and `<style>` are the exception — their
 * contents are code, not prose, and go with the tag.
 */
export function sanitizeInline(input: string): string {
  if (!input) return "";
  if (!input.includes("<") && !input.includes("&")) return input;

  const out: string[] = [];
  const open: string[] = [];
  let index = 0;
  let skipUntil: string | null = null;

  TAG_RE.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TAG_RE.exec(input))) {
    const [tag, rawName, rawAttrs] = match;
    const name = rawName.toLowerCase();
    const closing = tag[1] === "/";

    if (skipUntil) {
      if (closing && name === skipUntil) skipUntil = null;
      index = TAG_RE.lastIndex;
      continue;
    }

    if (match.index > index) out.push(escapeText(input.slice(index, match.index)));
    index = TAG_RE.lastIndex;

    if (!closing && (name === "script" || name === "style")) {
      skipUntil = name;
      continue;
    }

    const mapped = TAGS.get(name);
    if (!mapped) continue; // Unwrapped: the tag goes, the words stay.

    if (VOID_TAGS.has(mapped)) {
      if (!closing) out.push(`<${mapped}>`);
      continue;
    }

    if (closing) {
      const at = open.lastIndexOf(mapped);
      if (at === -1) continue; // A stray close, from a fragment cut mid-run.
      while (open.length > at) out.push(`</${open.pop()}>`);
      continue;
    }

    if (open.length >= MAX_DEPTH) continue;

    if (mapped === "a") {
      const href = safeHref(readAttributes(rawAttrs).get("href") ?? "");
      // A link with nowhere to go is not a link. Its text is kept.
      if (!href) continue;
      const external = /^https?:/i.test(href.replace(URL_NOISE, ""));
      out.push(
        `<a href="${escapeAttribute(href)}"${
          external ? ' target="_blank" rel="noreferrer"' : ""
        }>`,
      );
      open.push("a");
      continue;
    }

    out.push(`<${mapped}>`);
    open.push(mapped);
  }

  if (index < input.length) out.push(escapeText(input.slice(index)));
  while (open.length) out.push(`</${open.pop()}>`);

  return out.join("");
}

/** The words alone. Everything that counts, measures or summarises an article —
 *  the read time, the SEO description fallback, the excerpt — reads this, so a
 *  bolded word is one word and never `<strong>one</strong>`. */
export function inlineToPlain(input: string): string {
  if (!input) return "";
  return decodeEntities(
    input.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, ""),
  );
}

/** Plain text on its way into a fragment. */
export function plainToInline(input: string): string {
  return escapeText(input);
}

/** Whether a fragment has any words in it. A `<strong></strong>` left behind by
 *  a deleted run is empty, and the renderer skips empty blocks. */
export function isBlankInline(input: string): boolean {
  return !inlineToPlain(input).replace(/ /g, " ").trim();
}

/**
 * A whole document, reduced to the whitelist.
 *
 * Called on save. The renderer sanitizes too, so this is not what makes the
 * page safe — it is what keeps *storage* clean, so the record on disk is the
 * record that renders and a diff between two saves is a diff between two
 * articles rather than between two browsers' idea of `<b>`.
 */
export function sanitizeBlocks<T extends { type: string }>(blocks: T[]): T[] {
  return blocks.map((block) => {
    if ("items" in block && Array.isArray((block as { items: unknown }).items)) {
      const items = (block as unknown as { items: string[] }).items;
      return { ...block, items: items.map((item) => sanitizeInline(item)) };
    }
    if ("text" in block) {
      const next = {
        ...block,
        text: sanitizeInline((block as unknown as { text: string }).text),
      } as T & { attribution?: string; caption?: string };
      // Attribution and caption are rendered as text and as a fragment
      // respectively; both go through the same gate.
      if (typeof next.attribution === "string") {
        next.attribution = sanitizeInline(next.attribution);
      }
      return next;
    }
    if ("caption" in block) {
      const next = { ...block } as T & { caption?: string };
      if (typeof next.caption === "string") next.caption = sanitizeInline(next.caption);
      return next;
    }
    return block;
  });
}
