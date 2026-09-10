<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# TribuCare — working agreement

## How to work with this repo

**Move fast.** Small, clearly-scoped edits (copy, className, spacing, adding a
card, adding a section, adding a page) get made directly and reported in one
line. Do not open the browser, screenshot, read console logs, or re-read files
back to "verify" a change that obviously worked. Reserve that for changes that
are structurally risky, touch many files with unclear scope, or could break the
build.

Do not ask clarifying questions unless something is genuinely ambiguous.
Default to the conventions below and ship.

**Never invent facts.** All copy is traceable to the TribuCare company-profile
deck (see the sourcing rule at the top of `content/site.ts`). No invented
certifications, awards, customer counts, partnerships, or social accounts.
Anything the deck doesn't cover stays empty and renders conditionally.

## Non-negotiable: everything new must look like everything old

The site is one design system, not a folder of pages. A new page, section,
card, or image added a year from now must be indistinguishable in style from
what is here today. Never introduce a new colour, a new shadow, a new radius, a
new easing curve, a new card treatment, or a new icon shape. If you think you
need one, you're wrong — a token or utility for it already exists in
`app/globals.css`.

### The rule: find the existing one and copy it, before writing anything

Any time you are asked for a card, a list, a media block, a badge, a scroller,
a stat, or a CTA — **stop and go read the closest existing implementation
first.** Open the file. Copy its markup. Change only the content.

Do not design from the section's surrounding context, do not improvise from the
tokens, and do not build "something in the same spirit". Matching the palette is
not the same as matching the design — a card can use only brand tokens and still
be a foreign object because its proportions, media band, badge placement and
footer row are invented. That is the failure mode to avoid.

**The canonical card is `components/blog/post-card.tsx`.** Every content card on
the site — article, event, or anything added later — is that card:

- `card-surface card-interactive group relative flex h-full flex-col overflow-hidden`
- `h-52` media band, `bg-brand-50`, `next/image` `fill` `object-cover`,
  `transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105`
- floating category badge, `absolute top-3.5 left-3.5 rounded-xl bg-white/90 px-3 py-1 text-xs font-semibold text-brand-900 shadow-md backdrop-blur-md`
- body `flex flex-1 flex-col justify-between p-6`
- meta row `flex items-center gap-3 text-xs text-ink-faint`, items `flex items-center gap-1` with a `size-3.5` lucide icon, separated by a `•`
- title `mt-3 line-clamp-2 font-display text-lg leading-snug font-semibold text-ink transition-colors duration-300 group-hover:text-brand-700`
- excerpt `mt-2.5 line-clamp-3 text-sm leading-relaxed text-ink-soft`
- footer `mt-6 flex items-center justify-between border-t border-brand-50 pt-4`

`components/events/event-card.tsx` is that same card with event fields. **If you
change one, change the other.** A third card type gets a component next to
these, built the same way — never inlined into a section.

Cards are white (`card-surface`) even on `ground-deep` sections. Do not build a
dark variant of a card that already exists in white.

### When something genuinely has no precedent

Say so and ask, rather than inventing. One new pattern quietly introduced is
worth more damage than one question.

## Architecture

```
app/
  (site)/[lang]/        the public site — ONE route tree serves both languages
    layout.tsx          fonts, metadata, nav, footer, smooth scroll, site JSON-LD
    page.tsx            homepage = ordered list of <Section /> components
    about/ dermatology/ mlay/ altesse-soin/ partner/ blogs/ events/
    news/               retired — /news and /news/[slug] redirect into /events
    not-found.tsx       branded 404; [...rest]/page.tsx routes unknown paths to it
  (admin)/admin/        the CMS panel — blogs, events & news, careers, media,
                        settings. Own root layout; language is a cookie, not a URL.
                        Reached ONLY through the secret path — see below.
  api/admin/            the panel's JSON API — every handler calls requireSession
  globals.css           ALL design tokens, utilities, keyframes. Single source.
  sitemap.ts robots.ts manifest.ts opengraph-image.tsx    SEO surface
proxy.ts                locale routing (/x → /en/x rewrite, /ar/x passes,
                        /en/x → /x 308); mounts the panel on ADMIN_PATH, seals
                        /admin and /api/admin with the site's 404, and slides
                        the session's idle window on each authenticated request
components/
  sections/             one file per page section, named export, no props
  site/                 layout + motion primitives (Shell, Eyebrow, Reveal, …)
                        json-ld.tsx — the only way to emit structured data
  brand/                logo, brand-plate, wave-field, lanyard (3D)
  ui/                   shadcn primitives — button only. Retuned via CSS vars.
  blog/ news/ events/   post-card (canonical), event-card, article/news views
                        article-body.tsx — the ONE renderer for a Block[]
                        event-carousel.tsx — the homepage's one-at-a-time frame
  admin/                the panel's UI
                        rich-field.tsx — one contenteditable row + caret maths
                        use-draft-history.ts — undo/redo over the whole draft
                        leave-guard.tsx — the unsaved-changes prompt, shared by
                        both editors
content/
  site.ts dermatology.ts mlay.ts altesse.ts collections.ts
                        ALL marketing copy. `as const`.
  blogs.ts              seed for the CMS store — NOT read by the site
  en/index.ts           the English bundle, plus the `ui` and `meta` strings
  ar/                   Arabic — a deep OVERRIDE of English, never a copy
  index.ts server.ts    getContent(locale); content() / currentLocale()
lib/
  seo.ts                pageMetadata() + every schema.org builder
  site.ts               canonical siteUrl resolution
  fonts.ts              the four faces, shared by both root layouts
  i18n/config.ts        locales, URL shapes, localePath / splitLocale
  i18n/admin.ts         the panel's language cookie
  i18n/admin-strings.ts the panel's OWN strings, EN + AR — not content/
  cms/                  store, posts, news, roles, authors, categories,
                        news-tags, media, revalidate
  cms/rich-text.ts      the closed inline whitelist — sanitize on paste, on
                        save and again on render. Nothing widens it quietly.
  cms/paste-html.ts     a pasted document → Block[]. Browser-only (DOMParser).
  cms/gate.ts           where the panel is mounted (ADMIN_PATH). Server only.
  cms/auth.ts           password check, signed cookie, 60-minute idle window
  cms/rate-limit.ts     login lockout, backed by Upstash over its REST API
  cms/compress.ts       browser-side shrinking for pasted images
  forms.ts utils.ts
scripts/
  unlock-login.mjs      lifts a login block — the escape hatch for the lockout
```

**Rules that follow from this:**

- Copy never gets hardcoded in a component. It goes in `content/site.ts` and
  is imported. New section → new export in `content/site.ts`, and an Arabic
  override for its strings in `content/ar/`. Arrays merge by index, so keep
  the order identical to the English file.
- **The header's drop-down is content, not markup.** A `nav` item carrying a
  `menu` array (label, detail, href, icon) gets the split pill and the panel on
  desktop and the unfolding sub-list in the mobile menu, both from
  `components/site/nav.tsx`. Icon keys resolve through its `ICONS` map — add
  the lucide import there, never inline an SVG. The Arabic `nav` override must
  carry the same item at the same index, with its own `menu` labels; hrefs and
  icons inherit. Reordering the English nav means reordering the Arabic one.
- Server components read content with `await content()` from
  `content/server.ts`; client components receive what they need as props.
  Internal links go through `localePath(locale, path)` so both languages stay
  on the same page.
- Every route's `generateMetadata` returns `pageMetadata({...})` from
  `lib/seo.ts`. Never hand-write `openGraph`, `twitter` or `alternates` — Next
  replaces those keys wholesale, and a page that sets one loses the rest.
- Structured data goes through `<JsonLd data={...} />` with a builder from
  `lib/seo.ts`. Never an inline `<script type="application/ld+json">`.
- Design values never get hardcoded either. Use the tokens.
- Sections take no props. They read their own content and render.
- A new page is a route file that composes existing section components, or new
  sections built to the pattern below.

**The CMS owns three content types.** Blog posts, events & news, and career
roles are authored in the panel and live in the store (`lib/cms/`), not in
`content/`. `content/blogs.ts` is the one-time seed and is never read by a
page. So:

- Never add a post, event or role by editing a file — it will be ignored, or
  overwritten. Add it in the panel.
- Every handler under `app/api/admin/` starts with `requireSession()`. The only
  two that do not are `login` (which cannot) and `logout` (which need not) —
  anything else is a bug. The proxy's redirect is an optimistic UX check, not
  the gate; `requireSession` is.
- **Never hardcode `/admin` or `/api/admin` in a link or a fetch.** The routes
  live at those paths but are never *served* from them: `ADMIN_PATH` names the
  secret segment the proxy rewrites onto them, and a direct request to either
  gets the site's 404. Client components build URLs with `useAdminBase()` and
  `useAdminApi()` from `components/admin/base-path.tsx`; server components call
  `adminBase()` from `lib/cms/gate.ts`. A hardcoded path 404s the moment
  `ADMIN_PATH` is set, and it will look like a routing bug rather than a typo.
- **`ADMIN_PATH` must never become `NEXT_PUBLIC_`.** Next inlines those into
  every client bundle, including the marketing site's — which would publish the
  secret on the pages it is hidden from. The panel's layout reads it on the
  server and passes it down through context. That indirection is the point.
- After any create / update / delete, call `revalidateBlog()` (or its news
  equivalent) from `lib/cms/revalidate.ts`. The public pages are ISR-cached and
  will otherwise keep serving the old copy until the window ages out.
  Three things keep that true, and each has been broken once:
  - Every page that reads the store declares `export const revalidate = 3600`
    (the homepage, `/blogs`, `/events`, `/dermatology`, the article and event
    pages, the sitemap). It is the backstop; publishing is what refreshes.
  - **The store's reads are ordinary fetches.** A `cache: "no-store"` fetch
    forces every route that touches it to render on every request, which
    silently turned the whole site dynamic and its `Cache-Control` to
    `no-store` — `revalidate` on the page changes nothing once that happens.
    The cache-busting `?nc=` query is what keeps the Blob CDN honest instead.
  - **`revalidatePath` takes the route-file path, never the URL.** `proxy.ts`
    rewrites `/blogs` onto `/en/blogs`, and cache entries are keyed by the
    route that rendered them, so `revalidatePath("/blogs")` matches nothing.
    Use the pattern form — `revalidatePath("/[lang]/blogs/[slug]", "page")` —
    which clears both languages and every slug in one call.
- **Events & news lead automatically.** There is no `featured` flag on a news
  item: `/events` leads with the next upcoming event, or failing that the
  newest, and the homepage carousel and the `/dermatology` rail show the same
  store items — each card linking to its own page — with the static six in
  `content/site.ts` as the fallback for an unreachable store. Posts keep their
  opt-in `featured`; the two are deliberately different.
- **Editors guard the way out.** `components/admin/leave-guard.tsx` holds any
  in-panel link while the draft is dirty and offers save / leave / stay; with
  nothing unsaved every link works untouched. It depends on the editor's
  `dirty` flag being honest — every `update()` sets it, every successful save
  clears it — and on `save()` returning whether it succeeded. A new editor gets
  the hook and the dialog the same way `post-editor.tsx` does.
- **An article is an ordered `Block[]`, and that is a contract.**
  `components/blog/article-body.tsx` is the single renderer for both the
  published page and the editor's preview, so a change to what a block means
  changes every article already written. `components/admin/doc-editor.tsx` is a
  writing surface over that array and nothing more; replacing it must leave the
  array untouched.
- **A block's text is an inline fragment, and the whitelist is closed.**
  `lib/cms/rich-text.ts` owns it: `strong em u s code sup sub a[href] br`, and
  nothing else. It is applied on paste, on save (`savePost` / `saveNews`) and
  *again at render time*, so a record seeded from a file, hand-edited in
  storage or written by an older build still cannot put a script on the page.
  Plain text is a valid fragment, which is why every record written before this
  existed is already correct.

  The list is closed at the **inline** level on purpose. Nothing in it can carry
  a class, an id, a style attribute, a colour, a size or a font — that is what
  keeps a pasted `h2` rendering as *the site's* `h2`. Widening it to any
  block-level or styling tag is the hole in the design system this whole
  arrangement exists to prevent, so it is a decision to bring to the user, not
  one to make while implementing something else.
- **Pasting is structure in, styling out.** `lib/cms/paste-html.ts` reads the
  clipboard's `text/html` flavour and maps it onto blocks — headings,
  paragraphs, bulleted and numbered lists, quotes, images and the marks above.
  Everything the source document said about *appearance* is dropped and
  re-derived from the design system. It is browser-only (`DOMParser`), so never
  import it from a server component. Emphasis that Word and Google Docs express
  in CSS (`style="font-weight:700"`) is promoted to real tags first, and the
  self-cancelling `<b style="font-weight:normal">` both wrap a selection in is
  unwrapped — miss either and a pasted article loses all its bold, or gains it
  everywhere.
- **Editor rows are `contenteditable`, and the rule is: never write to one
  while the writer is typing into it.** Re-setting `innerHTML` collapses the
  selection to the start of the node, so a controlled field moves the caret to
  the top of the line on every keystroke. `components/admin/rich-field.tsx`
  remembers the value it last emitted and ignores that value coming back; the
  caret helpers (split a half-bold line, measure an offset through markup) live
  there too, so the editor addresses a line by a character offset and never has
  to know what runs it is made of.
- **Undo/redo is the editor's, not the browser's**
  (`components/admin/use-draft-history.ts`). Every field is React-controlled and
  the rows are written from state, so a native undo rewinds the *element* while
  React still holds the old value and the next keystroke renders the undone text
  straight back — the native one is refused inside the rows. Typing coalesces
  into one entry per burst. An asynchronous edit — an image upload writes a
  placeholder, then the finished URL — must `amend` the entry it opened rather
  than pushing a second one, or a single undo lands on the placeholder: an empty
  frame nobody typed their way into.
- **A post or news item has exactly one content language**, chosen by the
  radios in the editor's *Content language* panel — a placement decision, not a
  claim about what the words are in. Records written before this carry both
  locales; they read as their first and are narrowed the next time one is
  saved.
- **The panel's language and the content's language are two different
  questions.** The panel's is a cookie and decides what "Permanently delete"
  says. The content's decides which way the words being typed run. The editor
  therefore sets `dir` on the *content* — the block area, the title, excerpt,
  SEO fields, alt text, and the preview — and never on the screen: the action
  bar, the two-column split, the settings rail and the toolbars stay with the
  panel's language, because that is the language their labels are in.
- **A category belongs to one language site** (`lib/cms/categories.ts`), and
  the picker offers only the current one. The stored list upgrades itself on
  read; a category carried by a post inherits that post's language, which is a
  fact rather than an inference, and script is read only where nothing else can
  answer — a legacy list, or a legacy post still naming both languages. A name
  may be taken once across both, so Settings can move a category between them
  rather than forcing a delete and re-create.
- Panel strings go in `lib/i18n/admin-strings.ts`, never in `content/`. That
  file is software chrome — "Permanently delete" does not belong beside the
  homepage headline. Both locales are one typed object, so a missing Arabic key
  is a build error.

## Design tokens — use these, never raw hex

Defined in `app/globals.css` under `@theme`. Available as Tailwind classes.

| Purpose | Token |
|---|---|
| Deep teal ground | `brand-900` / `brand-950`, via `ground-deep` |
| Section ground (deck) | `brand-700` |
| Primary / links / accents | `brand-600` |
| Soft tints, plates | `brand-50` `brand-100` `brand-200` |
| Light ground | `ground-light` utility |
| Cyan accent (cool trace) | `circuit-300/400/500` |
| Orange accent (warm trace) | `signal-300/400/500/600` |
| Body text | `text-ink` (headlines), `text-ink-soft` (body), `text-ink-faint` (meta) |

Never pure black, never pure `#000` text. Ink is teal-black.

**Type:** `font-display` (Outfit) for h1–h4 and numerals. `font-sans`
(Figtree) for body. `font-mono` (Geist Mono) only inside the `eyebrow`
utility.

**Motion:** `--ease-out` is the house curve — everything decelerates the same
way. Durations: `--duration-fast|base|slow|reveal`. Never write a bespoke
cubic-bezier or a one-off duration.

**Radius:** `--radius` = 0.75rem, scaled by `radius-sm…4xl`. Cards use
`rounded-[1.75rem]` / `lg:rounded-[2.25rem]` (large feature cards) or the
`card-surface` utility (standard panels).

## Shared utilities — reach for these first

Defined in `app/globals.css`:

- `eyebrow` — uppercase mono annotation. Prefer the `<Eyebrow>` component,
  which adds the orange trace tick.
- `ground-deep` / `ground-light` — the only two section backgrounds.
- `card-surface` — the standard white panel: hairline `brand-100` border,
  `radius-2xl`, soft shadow.
- `card-interactive` — pair with `card-surface` for the shared hover: 4px
  lift, `brand-300` border, deep shadow. **All hoverable cards use this.**
- `icon-disc` / `icon-disc-dark` — the single icon language. Circular plate,
  `brand-50` bg on light, translucent teal on dark. Never squircles, never
  square icon tiles.
- `rich-text` / `rich-text-dark` — the **only** place an article's inline marks
  are styled: link colour and underline, the `code` plate, `sup`/`sub` size.
  `-dark` is the same set on `ground-deep` (the pull-quote), where the two
  colours move to the light accents that ground already uses. Every value
  resolves to an existing token, which is what makes a link inside a pasted
  article read as a TribuCare link. Nothing here sets a size, family or colour
  for ordinary text — the block's own class owns those.
- `stack-card` — sticky layered card stack (see Expertise).
- `.notch-fillet-*` — the header's concave joins. Don't reimplement.

## Component vocabulary

| Need | Use |
|---|---|
| A content card (article, event, anything) | `<PostCard>` / `<EventCard>` — copy one, never invent |
| Horizontal card scroller | `<Rail>` (wheel + drag + edge fades), items get `rail-item` |
| Unframed scrolling column | `<ScrollColumn>` (wheel handling + themed bar), cards `gap-8` |
| Page gutter | `<Shell>` — the only horizontal rhythm. Never a bespoke max-w. |
| Section label | `<Eyebrow tone="dark"\|"light">` |
| Headline that animates in | `<LineReveal as="h2" lines={[...]} />` |
| Anything else that animates in | `<Reveal from="up\|down\|left\|right\|scale\|mask" delay={} />` |
| Scroll parallax on media | `<Parallax speed={0.12} />` |
| Layer that rises then settles | `<Rise distance={80} />` |
| Pointer-reactive drift | `<Floating />` |
| Animated statistic | `<Counter value={} prefix suffix />` |
| Button | `<Button variant size>` from `components/ui/button` |
| Logo | `<TribuLogo>` / `<TribuMark>` from `components/brand/logo` |
| Decorative line field | `<WaveField tone="light"\|"dark" lines={} />` |

## Section pattern — copy this shape for every new section

```tsx
export function NewSection() {
  return (
    <section id="slug" className="ground-light relative py-24 md:py-32">
      <Shell>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal><Eyebrow>Section Label</Eyebrow></Reveal>
            <LineReveal
              as="h2"
              delay={90}
              className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.025em] text-ink"
              lines={["First line.", <span key="a" className="text-brand-600">Accent line.</span>]}
            />
          </div>
          <Reveal className="lg:col-span-5" delay={100} from="right">
            <p className="text-[1.0625rem] leading-relaxed text-ink-soft">Intro paragraph.</p>
          </Reveal>
        </div>
        {/* body */}
      </Shell>
    </section>
  );
}
```

Fixed values in that block — reuse them exactly:

- Section padding: `py-24 md:py-32`
- Grounds alternate `ground-light` / `ground-deep` down the page
- h2 size: `clamp(2.125rem,4.6vw,3.5rem)`, `leading-[1.03]`, `tracking-[-0.025em]`
- Body size: `text-[1.0625rem] leading-relaxed`
- Header→body gap: `mt-16` (`md:mt-24` for large stacks)
- Reveal stagger: eyebrow 0ms → headline 90ms → side copy 100ms → items `i * 70–90ms`
- On `ground-deep`: `<Eyebrow tone="light">`, headline `text-white`, body
  `text-brand-200`, accents `text-circuit-300`.

## Images

- Always `next/image`. Never `<img>` (except inside `opengraph-image.tsx`,
  which is Satori).
- Always give `sizes` on `fill` images: `"(max-width: 1024px) 100vw, 50vw"`.
- Brand marks: register in `brandLogos` in `content/site.ts` with explicit
  width/height, render at a **shared height** (`h-5 w-auto max-w-[6.5rem]`),
  never a shared box — a row of marks with different aspect ratios must read
  as one set.
- Product shots: `.webp`, cut-out on transparent, anchored
  `object-contain object-right-bottom` over a soft mint disc
  (`bg-gradient-to-b from-brand-100/90 to-brand-50/30`, `rounded-full`).
- Hover on media: `transition-transform duration-700 group-hover:scale-[1.03]`.
- Keep page weight down — the mobile budget was cut to ~700KB and must stay
  there. Compress before adding.
- New OG images inherit `app/opengraph-image.tsx`: teal gradient
  `linear-gradient(135deg,#042726,#0a5251)`, white mark + wordmark top-left,
  headline in white with a `#7fdcec` accent line, `#f5a623` rule above the
  eyebrow.

## Arabic & RTL

The site is one codebase serving two languages. English keeps the bare URLs it
already ranks for; Arabic is added under `/ar`. Both are the same route tree —
`proxy.ts` rewrites `/x` onto `/en/x`, lets `/ar/x` through, and 308s `/en/x`
back to `/x` so nothing is published at two URLs.

### Writing copy

- Arabic lives in `content/ar/` and is a **deep override**, not a copy. Put only
  translated strings there. Slugs, hrefs, image paths, icon keys, dimensions and
  brand names inherit from English — that is what keeps both languages on the
  same URL, which is what makes the language switch land on the same page.
- **Arrays merge by index.** A short Arabic array silently leaves the tail in
  English, which is how a missing fifth bullet hides. Match the English length.
- Anything untranslated falls back to English rather than rendering blank. That
  is deliberate, and it means a new English section ships readable — but it also
  means nothing shouts when a translation is missing. Sweep the rendered `/ar`
  pages for Latin text before calling a translation done.
- Register: Modern Standard Arabic as Egyptian professionals read it. Not
  colloquial Egyptian, not Gulf-inflected marketing Arabic.
- **Do not translate:** brand and model names (MLAY, Rejuran, `IDS Tridi`),
  technical notation (`755 nm`, `2,500 W`, `33G`, `PLLA`), standard
  designations (CE, ISO 13485, FDA 510(k)) — a standard's name is its
  identifier — or SKU names as they appear on the packaging.
- Device copy in `content/ar/products-dermatology.ts` carries a clinical-review
  notice. Indications, depths and protocols are regulated claims; keep the
  numbers identical to the English and leave the notice in place.

### Layout

Everything directional is expressed **logically**, so `dir="rtl"` mirrors the
page on its own:

| Never | Always |
|---|---|
| `ml-` `mr-` | `ms-` `me-` |
| `pl-` `pr-` | `ps-` `pe-` |
| `left-` `right-` | `start-` `end-` |
| `text-left` `text-right` | `text-start` `text-end` |
| `border-l-` `border-r-` | `border-s-` `border-e-` |

Four things have no logical form and need an explicit `rtl:` counterpart. Miss
one and it only shows in Arabic:

- `group-hover:translate-x-1` → add `rtl:group-hover:-translate-x-1`
- `origin-left` → add `rtl:origin-right`
- `bg-gradient-to-r` → add `rtl:bg-gradient-to-l`
- Directional lucide icons mirror globally from `globals.css` — do not add a
  per-icon flip.

### The two deliberate exceptions — do not "fix" these

- **`.notch-fillet-*`** in `nav.tsx` and `footer.tsx` keep **physical**
  `left-full` / `right-full`. Each fillet's mask is a radial gradient centred on
  the specific corner it fairs into (`circle at 0 0` for the left one). Logical
  insets swap their *positions* under RTL while leaving the *masks* alone, so
  the left-cut arc lands on the right and the curve reads inverted. The header
  and footer bars are symmetric overall, so physical is correct here. This has
  been broken twice; leave it.
- **`<WaveField>`'s `left-0`** — a 200%-wide decorative line field that should
  overflow the same way in both directions.

`globals.css` ends with the RTL block: Cairo rebinds `--font-display` and
`--font-sans` under `[dir="rtl"]` (Outfit and Figtree carry no Arabic glyphs),
and `.eyebrow` drops its uppercase and mono face, neither of which means
anything in Arabic.

### Client components

`next/root-params` — how server components read the locale — **cannot be called
from a client component, or from any module a client component imports.** A
client component receives what it needs as props from its server parent. If a
shared component is rendered from inside a client component (as `<EventCard>` is
from the carousel), it takes a prop too; making it async breaks the build with
an "only available in Server Components" error.

## Inner scroll areas

**Never hand-roll one.** Use `<ScrollColumn>` (vertical) or `<Rail>`
(horizontal). Both wrap `useEasedScroll`, which is where all of the following
lives — get any one of these wrong and the section has a scroll bug that only
shows up under a real mouse or a real finger:

- Lenis owns wheel input site-wide, so a nested scroller needs
  `data-lenis-prevent` to see the wheel at all. Without it the page keeps
  easing and the container can only be moved by dragging its scrollbar.
- The wheel must be **eased**, not written straight to the scroll offset — a
  direct write moves one hard step per notch, which stutters next to the eased
  page. `useEasedScroll` runs a rAF lerp of 0.12, matching Lenis.
- At either end the gesture must be handed back by calling `lenis.scrollTo()`
  **explicitly**. Do not "just let the event through": `data-lenis-prevent`
  stops Lenis reading it, and the resulting native scroll is overwritten on
  Lenis's next frame — the page sits frozen under the cursor.
- Boundary tests read the *target*, not the live offset. Mid-glide the container
  is still catching up, and testing the live offset hands the page the wheel
  while there is visibly road left.
- The glide's position is held in a JS variable, **never read back from
  `scrollTop`/`scrollLeft` each frame**. Browsers quantise those to physical
  pixels, so a written `1.76` reads back as `2`, the loop recomputes the same
  difference forever and never closes the last pixels — the container rests
  short of the top with the first card clipped. Ends are also snapped within
  `EDGE` (2px) so "fully scrolled" always shows a whole card.
- **Set `overflow-y: clip` alongside `overflow-x: auto`.** Giving one axis
  `auto` computes the *other* to `auto` too, so a rail silently becomes a
  vertical scroller with nothing in it. On a phone a downward swipe starting on
  a card latches to that empty scroller before chaining to the page, and the
  page visibly lags the finger over a rail and nowhere else. `clip`, not
  `hidden` — `hidden` is still a scroll container and still latches.
- **No `overscroll-behavior-y: contain`.** The wheel is already handled, so
  containing Y only stops *touch* chaining once the container is scrolled out —
  which on a phone, where a 34rem column fills most of the screen, is a dead end
  no gesture can escape. The inlined Lenis rule is narrowed to the X axis for
  exactly this reason; don't widen it back.
- **No scroll-snap on rails.** Proximity snapping fires once the glide settles
  and yanks the rail a second time, undoing the easing.

`rail-fade` owns a rail's inset as well as its soft edges: it pads by the fade
width, pulls the same amount back with a negative margin, and sets
`scroll-padding-inline`. The inset tracks Shell's gutter per breakpoint, so keep
rails **inside** `<Shell>` and add no margins of your own — a fixed inset
overflows the viewport on phones.

## Accessibility & motion

- Every animation must no-op under `prefers-reduced-motion` — the global switch
  in `globals.css` handles CSS; JS primitives already check `matchMedia`.
  Anything new must too.
- Content ships visible in the HTML; reveals only hide it after hydration.
- Focus ring is global (`circuit-400`, 2px, 3px offset). Never remove it.
- Decorative elements get `aria-hidden="true"`.
- Card links use the `<span className="absolute inset-0" />` overlay pattern so
  the whole card is clickable with one accessible name.

## Before finishing

`npx tsc --noEmit` if you touched types or added files. That's it — no browser
run unless the change is visual *and* risky, or the user asks.

Add to that only when the change earns it:

- **Moved or added routes, or touched `proxy.ts`:** `npm run build`. Route
  resolution, the two root layouts and `generateStaticParams` are only fully
  exercised at build time, and `tsc` will not catch a client component pulling
  in `next/root-params`.
- **Touched a client component or a hook:** `npx eslint .`. The React rules
  catch the two failures that look fine in review and break at runtime —
  setState in an effect body, and a component declared inside a render (which
  remounts its inputs and loses focus on every keystroke).
- **Added or changed copy:** load `/ar` for the pages you touched and look for
  Latin text. The English fallback means a missing translation renders silently
  rather than failing.
- **Anything visual on a page that has an Arabic version:** check it in both
  directions. A logical-property miss is invisible in English by definition.
- **Re-exported an image that has already shipped:** give the new file a new
  URL. `next/image` caches by URL, as does every CDN and browser in front of
  it, so overwriting a path serves the old pixels — and where two layers are
  registered against one crop box (the Mission, Partner and About composites),
  one going stale breaks the composite rather than merely dating it. The About
  pair carries a content hash in its filename for this reason. A `?v=` would
  say the same thing, but `next/image` refuses a query string on a local path
  unless `images.localPatterns` is configured, and configuring it blocks every
  *other* local image on the site unless each is listed too.
