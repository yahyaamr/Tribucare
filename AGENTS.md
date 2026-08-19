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
app/                    routes only — thin, compose sections
  page.tsx              homepage = ordered list of <Section /> components
  partner/, blog/       secondary routes, same section vocabulary
  globals.css           ALL design tokens, utilities, keyframes. Single source.
  layout.tsx            fonts, metadata, nav, footer, smooth scroll
  sitemap.ts robots.ts opengraph-image.tsx    SEO surface
components/
  sections/             one file per page section, named export, no props
  site/                 layout + motion primitives (Shell, Eyebrow, Reveal, …)
  brand/                logo, wave-field, lanyard (3D)
  ui/                   shadcn primitives — button only. Retuned via CSS vars.
  blog/                 post-card, newsletter
content/
  site.ts               ALL marketing copy. Typed `as const`.
  blogs.ts              blog posts + categories
lib/
  site.ts               canonical siteUrl resolution
  utils.ts              cn()
  forms.ts              form helpers
```

**Rules that follow from this:**

- Copy never gets hardcoded in a component. It goes in `content/site.ts` and
  is imported. New section → new export in `content/site.ts`.
- Design values never get hardcoded either. Use the tokens.
- Sections take no props. They read their own content and render.
- A new page is a route file that composes existing section components, or new
  sections built to the pattern below.

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
