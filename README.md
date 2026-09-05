# TribuCare

The TribuCare marketing site — bilingual (English at the bare URLs, Arabic
under `/ar`), with a password-protected blog and news panel at `/admin`.
Next.js 16, React 19, Tailwind 4.

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

## Blog admin

The SEO team writes and publishes articles at **`/admin`** — no code, no
redeploy. Two things need setting up once in Vercel (`ADMIN_PASSWORD` and a
Blob store).

**→ [docs/blog-admin.md](docs/blog-admin.md)**

## Deploying

The site deploys to Vercel from `main`. Set the environment variables above in
the project settings and redeploy — see [docs/blog-admin.md](docs/blog-admin.md)
for the Blob store the panel needs.
