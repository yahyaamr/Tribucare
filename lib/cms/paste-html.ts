/**
 * A pasted document, read as blocks.
 *
 * This is what makes "copy a finished article, paste it into the editor" work.
 * The clipboard carries a `text/html` flavour alongside the plain text, and
 * that flavour is where the structure lives: which lines were headings, which
 * were bullets, which words were bold, where the links pointed. Reading only
 * `text/plain` — which is what the editor did before — throws all of it away
 * and lands one undifferentiated wall of paragraphs.
 *
 * What survives, and what deliberately does not:
 *
 *   survives   headings, paragraphs, bulleted and numbered lists, block
 *              quotes, images, and the inline marks in `rich-text.ts` —
 *              bold, italic, underline, strikethrough, code, sup/sub, links
 *   dropped    every font, size, colour, alignment, margin, class and style
 *              attribute the source document carried
 *
 * The second half is not a limitation, it is the feature. A pasted `h2` comes
 * out as *the site's* `h2`; a pasted paragraph comes out at the site's body
 * size. Carrying the source's own type scale across is how a pasted article
 * ends up looking like a foreign object on the page, so the structure is kept
 * and the styling is re-derived.
 *
 * Browser-only: it parses with `DOMParser`, so this must never be imported
 * from a server component. `sanitizeInline` runs over every fragment on the
 * way out anyway, and again at render time.
 */

import { newBlockId } from "./format";
import { inlineToPlain, sanitizeInline } from "./rich-text";
import type { Block } from "./types";

/** Elements that own a line of their own. Anything with one of these inside it
 *  is a container to descend into, not a paragraph to read. */
const BLOCK_SELECTOR =
  "p,div,section,article,main,header,footer,aside,ul,ol,li,dl,blockquote,pre,figure,table,h1,h2,h3,h4,h5,h6,hr";

const HEADINGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);

/** Chrome that a copied web page brings with it and a reader never wanted. */
const IGNORED = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEMPLATE",
  "HEAD",
  "META",
  "LINK",
  "TITLE",
  "NAV",
  "SVG",
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "IFRAME",
  "FORM",
  "HR",
]);

export interface PasteResult {
  blocks: Block[];
  /** What the article template has no home for, counted so the editor can say
   *  so rather than letting it vanish silently. */
  dropped: { tables: number };
}

/**
 * Emphasis that a document expressed in CSS, promoted to real tags.
 *
 * Google Docs and Word do not write `<b>`. They write
 * `<span style="font-weight:700">`, and the whitelist in `rich-text.ts` drops
 * style attributes on principle — so without this pass, pasting from the two
 * tools people actually write in loses every bold and italic in the article.
 *
 * The inverse is just as necessary. Both tools wrap an entire copied selection
 * in `<b style="font-weight:normal">`, a quirk of how they serialise; taken at
 * face value that tag bolds the whole document. A `b` or `i` that explicitly
 * cancels itself is unwrapped rather than honoured.
 *
 * This runs on the parsed document, before anything is read out of it, so what
 * reaches `sanitizeInline` is already expressed in the vocabulary it keeps.
 */
function promoteStyledEmphasis(root: Document) {
  for (const el of Array.from(root.querySelectorAll<HTMLElement>("[style]"))) {
    const { fontWeight, fontStyle } = el.style;
    const decoration = el.style.textDecorationLine || el.style.textDecoration || "";
    const weight = Number.parseInt(fontWeight, 10);

    // A tag that cancels the emphasis it names is serialisation noise.
    const cancels =
      (el.tagName === "B" || el.tagName === "STRONG") &&
      (fontWeight === "normal" || weight === 400);
    const cancelsItalic =
      (el.tagName === "I" || el.tagName === "EM") && fontStyle === "normal";

    if (cancels || cancelsItalic) {
      const span = root.createElement("span");
      while (el.firstChild) span.append(el.firstChild);
      el.replaceWith(span);
      continue;
    }

    const wraps: string[] = [];
    if (fontWeight === "bold" || fontWeight === "bolder" || weight >= 600) {
      wraps.push("strong");
    }
    if (fontStyle === "italic" || fontStyle === "oblique") wraps.push("em");
    if (decoration.includes("underline")) wraps.push("u");
    if (decoration.includes("line-through")) wraps.push("s");
    if (!wraps.length) continue;

    let inner: Node = root.createDocumentFragment();
    while (el.firstChild) inner.appendChild(el.firstChild);
    for (const tag of wraps) {
      const wrapper = root.createElement(tag);
      wrapper.append(inner);
      inner = wrapper;
    }
    el.append(inner);
  }
}

/** One element's inline content: sanitized to the whitelist, with the source's
 *  line wrapping collapsed — a paragraph broken across forty lines in the HTML
 *  is one paragraph, not forty. */
function inlineOf(el: Element): string {
  return sanitizeInline(el.innerHTML)
    .replace(/\s+/g, " ")
    .replace(/(^ | $)/g, "");
}

function textBlock(type: "heading" | "paragraph", el: Element): Block | null {
  const text = inlineOf(el);
  return inlineToPlain(text).trim() ? { id: newBlockId(), type, text } : null;
}

function imageBlock(src: string, alt = "", caption = ""): Block | null {
  const trimmed = src.trim();
  // A tracking pixel or a spacer gif is not an illustration.
  if (!trimmed || /^data:image\/gif/i.test(trimmed)) return null;
  return { id: newBlockId(), type: "image", src: trimmed, alt, caption };
}

/**
 * A list, flattened.
 *
 * A nested list becomes more items in the same list rather than a nested one:
 * the article template has one list treatment and no indent level, so an
 * invented second tier would be exactly the kind of foreign pattern this
 * whole path exists to avoid.
 */
function listBlock(el: Element): Block | null {
  const items: string[] = [];

  const collect = (list: Element) => {
    for (const li of Array.from(list.children)) {
      if (li.tagName !== "LI") continue;
      const nested = Array.from(li.children).filter(
        (child) => child.tagName === "UL" || child.tagName === "OL",
      );
      // Read the bullet's own words with its sub-lists removed, then append
      // those sub-lists as siblings.
      const clone = li.cloneNode(true) as Element;
      for (const child of Array.from(clone.children)) {
        if (child.tagName === "UL" || child.tagName === "OL") child.remove();
      }
      const text = inlineOf(clone);
      if (inlineToPlain(text).trim()) items.push(text);
      nested.forEach(collect);
    }
  };

  collect(el);
  if (!items.length) return null;
  return {
    id: newBlockId(),
    type: "list",
    items,
    ...(el.tagName === "OL" ? { ordered: true } : {}),
  };
}

/** A block quote keeps its words and loses its internal structure — the
 *  template's pull-quote is one run of text with an attribution under it. */
function quoteBlock(el: Element): Block | null {
  const text = Array.from(el.querySelectorAll("p"))
    .map((p) => inlineOf(p))
    .filter((part) => inlineToPlain(part).trim())
    .join(" ");
  const value = text || inlineOf(el);
  if (!inlineToPlain(value).trim()) return null;
  return { id: newBlockId(), type: "quote", text: value, attribution: "" };
}

function figureBlock(el: Element): Block | null {
  const img = el.querySelector("img");
  if (!img) return null;
  const caption = el.querySelector("figcaption");
  return imageBlock(
    img.getAttribute("src") ?? "",
    img.getAttribute("alt") ?? "",
    caption ? inlineOf(caption) : "",
  );
}

export function htmlToBlocks(html: string): PasteResult {
  const doc = new DOMParser().parseFromString(html, "text/html");
  promoteStyledEmphasis(doc);

  const blocks: Block[] = [];
  const dropped = { tables: 0 };

  const push = (block: Block | null) => {
    if (block) blocks.push(block);
  };

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      // Loose text sitting straight inside a container, which is how a
      // stripped-down export writes a paragraph.
      const text = node.textContent ?? "";
      if (!text.trim()) return;
      push({
        id: newBlockId(),
        type: "paragraph",
        text: sanitizeInline(text).replace(/\s+/g, " ").trim(),
      });
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    const tag = el.tagName;

    if (IGNORED.has(tag)) return;

    if (HEADINGS.has(tag)) {
      // Every level lands on the article's one `h2`. The page already has an
      // `h1` — the post title — and a second one would be a document-outline
      // bug as well as a design one.
      push(textBlock("heading", el));
      return;
    }

    switch (tag) {
      case "P":
        push(textBlock("paragraph", el));
        return;
      case "UL":
      case "OL":
        push(listBlock(el));
        return;
      case "BLOCKQUOTE":
        push(quoteBlock(el));
        return;
      case "FIGURE":
        push(figureBlock(el));
        return;
      case "IMG":
        push(
          imageBlock(el.getAttribute("src") ?? "", el.getAttribute("alt") ?? ""),
        );
        return;
      case "PRE": {
        const text = (el.textContent ?? "").trim();
        if (text) {
          push({
            id: newBlockId(),
            type: "paragraph",
            text: `<code>${sanitizeInline(text)}</code>`,
          });
        }
        return;
      }
      case "TABLE":
        // The article template has no table. Counted rather than flattened:
        // a table pulled apart into paragraphs is worse than a table the
        // editor is told to re-enter.
        dropped.tables += 1;
        return;
      case "BR":
        return;
    }

    // A container: descend. A leaf with only inline content inside it is a
    // paragraph in everything but name, which is what a `<div>`-per-line
    // export produces.
    if (el.querySelector(BLOCK_SELECTOR) || el.querySelector("img")) {
      Array.from(el.childNodes).forEach(walk);
      return;
    }
    push(textBlock("paragraph", el));
  };

  Array.from(doc.body.childNodes).forEach(walk);

  return { blocks, dropped };
}

/**
 * Whether a clipboard's HTML flavour is worth reading.
 *
 * Copying inside a plain textarea still puts a scrap of HTML on the clipboard,
 * and running that through the converter would turn a two-word paste into a
 * paragraph block. Structure or marks have to actually be present.
 */
export function hasStructure(html: string): boolean {
  return /<(h[1-6]|ul|ol|li|blockquote|img|figure|table|pre|strong|b|em|i|u|s|del|ins|code|sup|sub|a\s)\b/i.test(
    html,
  );
}
