# SEO & Google Search Console

Everything a crawler reads is generated from one place, so the checklist for
going live is short.

## Before submitting to Search Console

1. **Set the canonical domain.** In Vercel → Settings → Environment Variables,
   add `NEXT_PUBLIC_SITE_URL=https://<the production domain>`. Every absolute
   URL the site emits — canonical links, `hreflang`, Open Graph, the sitemap,
   robots.txt, structured data — resolves against it. Without it the site
   falls back to Vercel's production hostname, and the Organization schema
   omits its `url` rather than publish an address nobody uses.
2. **Add the verification token.** Search Console → Settings → Ownership
   verification → *HTML tag*. Copy only the `content="…"` value into
   `GOOGLE_SITE_VERIFICATION`. `BING_SITE_VERIFICATION` does the same for Bing
   Webmaster Tools. Both are optional and emit nothing when unset.
3. **Redeploy.** Environment variables only reach a build that starts after
   they exist.
4. **Submit the sitemap:** `https://<domain>/sitemap.xml`. It is also declared
   in `robots.txt`, which is where crawlers look first.

## What every page carries

Built by `pageMetadata()` in `lib/seo.ts`, so no route writes its own tags:

- `<title>` with the `| TribuCare` template, and a `description`
- `rel="canonical"`, locale-aware — `/dermatology` and `/ar/dermatology` each
  point at themselves
- `hreflang` for `en`, `ar` and `x-default` (English holds the established
  URLs, so it is the default)
- Open Graph: type, site name, `og:locale` + alternate, `og:url`, title,
  description, and an image — the page's own where it has one, otherwise the
  site-wide card at `/opengraph-image`
- Twitter card, mirroring the Open Graph values
- Articles add `article:published_time`, `article:modified_time`, author,
  section and tags

Site-wide, from the layout: `robots` (index, follow, large image previews),
icons, the web app manifest, and the verification tags.

## Structured data

Emitted through `<JsonLd>` (which escapes `<` so CMS text can never break out of
the script block), built in `lib/seo.ts`:

| Where | Types |
| --- | --- |
| Every page | `Organization` (with `@id`, logo, parent MIC, brands, area served) and `WebSite` |
| Homepage | `FAQPage`, from the FAQ section |
| Blog post | `Article` (absolute image, `datePublished`, `dateModified`, author, publisher by `@id`) and `BreadcrumbList` |
| News item | `NewsArticle` and `BreadcrumbList` |
| Dermatology product | `Product` (brand, category, specs as `additionalProperty`; no offers — devices are quoted, not priced) and `BreadcrumbList` |

Contact details, social profiles and the Organization `url` render only once
they exist in `content/site.ts` / the environment. Nothing is asserted that the
content does not carry.

Validate any page at <https://search.google.com/test/rich-results> and
<https://validator.schema.org/>.

## Sitemap and robots

`app/sitemap.ts` lists every public page once per language, each entry naming
both languages plus `x-default`. Blog posts and news items carry `lastmod` from
their publication date; marketing pages omit it rather than stamp the build
time. Drafts never appear. `app/robots.ts` allows everything except `/admin`
and `/api/admin`, and names the sitemap.

## Redirects and status codes

- `/en/…` → the bare path, **308** (permanent). English lives at the bare
  URLs; the prefixed form is internal.
- Unknown paths render the branded 404 inside the site layout, in the
  visitor's language, with `noindex` and a real 404 status.
- Drafts and unpublished slugs are 404s to the public.

## Response headers

Set in `next.config.ts`: `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Cross-Origin-Opener-Policy`, `Permissions-Policy`,
`Strict-Transport-Security`; `X-Powered-By` is removed. There is no Content
Security Policy — see the note in the config for why.

## Known limits

- **Blog articles are not translated.** `/ar/blog/<slug>` shows the English
  article inside Arabic chrome, with `hreflang` pairing the two. That is the
  scoping decision recorded in `content/index.ts`; if Arabic articles are
  added later, the pairing already exists.
- **No `Event` schema.** The events on the site are marked `placeholder` in
  `content/site.ts` and their dates are month-level text. Event markup asserts
  a real, dated event; add it only when the calendar is real.
- **Arabic dermatology copy** should be reviewed by a clinician before the
  Arabic site is promoted — see `content/ar/products-dermatology.ts`.
