# TribuCare

The TribuCare marketing site — bilingual (English at the bare URLs, Arabic
under `/ar`), with a password-protected panel at `/admin` for blogs, events &
news, careers and media. Next.js 16, React 19, Tailwind 4.

## Getting started

```bash
cp .env.example .env.local   # then set ADMIN_PASSWORD at minimum
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The design system, content
rules and component vocabulary are in [AGENTS.md](AGENTS.md) — read it before
changing anything visual.

## Configuration

Every variable is listed and explained in [.env.example](.env.example). The
two that matter before launch are `NEXT_PUBLIC_SITE_URL` (the canonical
domain) and `GOOGLE_SITE_VERIFICATION`.

## SEO & Search Console

Metadata, structured data, sitemap and the go-live checklist:

**→ [docs/seo.md](docs/seo.md)**

## The admin panel

The SEO team publishes blogs, events & news and career roles at **`/admin`** —
no code, no redeploy. Two things need setting up once in Vercel
(`ADMIN_PASSWORD` and a Blob store), and without the Blob store anything
written in production is lost on the next deploy.

**→ [docs/blog-admin.md](docs/blog-admin.md)**

## Languages

English is served at the bare URLs it already ranks for; Arabic is added under
`/ar`, right-to-left, with `hreflang` pairs so search engines treat the two as
translations rather than duplicates. Both are one route tree — `proxy.ts` does
the routing.

Translation copy lives in `content/ar/` as a deep *override* of English, so
only translated strings are restated and anything missing falls back rather
than rendering blank. The conventions for writing it — including what stays in
Latin script, and the RTL rules for layout — are in
[AGENTS.md](AGENTS.md#arabic--rtl). The panel has a language of its own, set by
a cookie: see [docs/blog-admin.md](docs/blog-admin.md#languages).

## Deploying

The site deploys to Vercel from `main`. Set the environment variables above in
the project settings and redeploy — see [docs/blog-admin.md](docs/blog-admin.md)
for the Blob store the panel needs.
