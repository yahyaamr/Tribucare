# Blog admin

A password-protected panel at **`/admin`** where the SEO team writes, edits and
publishes TribuCare articles. Share that link plus the password — that is the
whole onboarding.

---

## What you need to set up (once)

Two things, both in the Vercel dashboard for this project. Neither needs a
terminal.

### 1. A password — `ADMIN_PASSWORD`

**Settings → Environment Variables → Add**

| Key | Value |
| --- | --- |
| `ADMIN_PASSWORD` | whatever you want the team to type |

Everyone signs in with this one password. Changing it signs everyone out, which
is how you revoke access when someone leaves the team.

Optionally add `ADMIN_SESSION_SECRET` (any long random string). Without it the
signing key is derived from the password, which works fine — it just means
changing the password also ends every open session.

### 2. Somewhere to store posts and images — Vercel Blob

**Storage → Create → Blob → connect it to this project**

Vercel gives every deployment a **read-only filesystem**. Without a Blob store,
anything the team writes is thrown away on the next deploy. Connecting the
store injects `BLOB_READ_WRITE_TOKEN` automatically; you don't copy anything by
hand.

**Redeploy after adding both.** Environment variables only reach a build that
starts after they exist.

Until Blob is connected, the dashboard shows a warning at the top of the panel
saying so.

---

## Running it locally

Nothing to set up beyond a password:

```bash
echo 'ADMIN_PASSWORD=whatever' > .env.local
npm run dev
```

Then open http://localhost:3000/admin.

Locally there is no Blob store, so posts are written to `.cms-data/` and
uploads to `public/uploads/`. Both are gitignored — they are content, not
source.

---

## How it works

- **Posts** live in the store as one JSON file each, not in the codebase. The
  six articles that were previously hard-coded in `content/blogs.ts` are copied
  in automatically the first time the panel is opened, and that file stays as
  the seed. Deleting every post does **not** bring them back.
- **The blog pages are cached** and refreshed the moment something is
  published, updated or deleted (`lib/cms/revalidate.ts`). There is no
  redeploy step — publishing is live within seconds.
- **Drafts are invisible** to the public: a draft URL 404s and the post appears
  in neither the blog index nor the sitemap.
- **Only one post can be featured.** Featuring a post automatically un-features
  the previous one, because the /blog index promotes exactly one.
- **A post can hold several categories.** The first one selected is the
  *primary* — it is what shows wherever there is only room for one badge (the
  article card's floating pill, the admin list row). The article header shows
  all of them, and the post appears under every one of its categories in the
  /blog filter. Reorder by removing and re-adding.
- **Authors and categories are managed in Settings**, not per post. The post
  editor picks from those lists.

### Settings

`/admin/settings` holds the two lists every post draws from.

**Categories** — add, rename, delete. Renaming rewrites every post carrying the
old name in the same operation, so the blog can never show two filter tabs for
what is one category.

Deleting is two-step. The first click asks what the category is attached to and
shows the answer: the posts using it, with the ones for which it is the *only*
category flagged as "will have no category". Nothing is removed until that
warning is confirmed; the posts themselves are never deleted, only the category
is stripped from them.

The four categories in `content/blogs.ts` are copied into the store the first
time the list is read, exactly as the starter posts are. After that the store
owns the list and all of them are equally editable — there are no permanent
built-ins.

**Authors** — add, edit, delete, with a photo picked from the media library.

Posts hold a *reference* to an author, not a copy, which is why the byline
moved out of the post editor. Correcting a name, role or photo here updates
every article that author wrote, live, without re-editing any of them.

Deleting an author warns which posts would lose their byline. Those posts keep
everything else and simply render without an author until one is assigned.

Near-duplicates are collapsed in both lists: typing `beauty   innovation`
selects the existing **Beauty Innovation** rather than adding a second,
near-identical tab to the blog filter row, and a second "temp author" is
refused.

### Categories on a post

In the post editor, type in the category box to filter the list, tick as many
as apply, or type a name that doesn't exist yet and choose **Create "…"**. A
category created there is saved immediately, so it is offered on every other
post straight away — even before the post you created it on is saved.

### The editor

Articles are built from blocks, WordPress-style — add, reorder, duplicate,
delete:

| Block | Renders as |
| --- | --- |
| Intro | The opening paragraph, one size up |
| Heading | A section `h2` |
| Paragraph | Body copy |
| Bulleted list | Simple bullets |
| Pull quote | The dark teal quote panel |
| Key takeaways | The mint summary panel |
| Image | Full-width figure with an optional caption |

There is deliberately no free-form HTML. Every block maps onto a treatment the
site already has, so an article written a year from now still looks like the
rest of TribuCare. The writer chooses *what* a passage is; the design system
decides how it looks.

**Preview** renders `components/blog/article-view.tsx` — the exact component
the published page uses — against the draft in the editor. It cannot drift from
the real article, because it *is* the real article.

---

## Where the code is

```
lib/cms/
  types.ts        Post and Block shapes
  format.ts       Pure helpers — safe to import from client components
  store.ts        Storage interface + Vercel Blob and filesystem implementations
  posts.ts        Post CRUD, seeding, validation
  categories.ts   Category list, rename, delete-with-usage-report
  authors.ts      Author list; posts reference these by id
  media.ts        Uploads
  auth.ts         Password check and signed session cookie
  session.ts      The server-side gate used by pages and API routes
  revalidate.ts   Cache refresh on publish
proxy.ts          Redirects signed-out visitors to the login form
app/(admin)/admin/ The panel (login sits outside the gated (panel) group)
app/api/admin/    Its API
components/admin/ Shell, list table, block editor, media library
```

### Swapping the storage later

Everything above `store.ts` speaks one interface (`list` / `read` / `put` /
`del`). Moving to Postgres or anything else means writing one more
implementation and changing `getStore()` — no page, route or component moves.

---

## Languages

The public site is bilingual — English at its existing URLs, Arabic under
`/ar/…` — and the panel has a language of its own.

**In the panel**, the globe in the admin bar and the **Language** panel in
Settings switch the interface between English and Arabic. It is a cookie, not a
URL, so it is per person: one editor can work in Arabic while another works in
English, on the same posts. Switching does not move you off the page you are
on.

**Blog articles themselves are not translated.** A post written in the panel
appears on both `/blog` and `/ar/blog` in whatever language it was written in;
only the surrounding chrome changes. That was a deliberate scoping decision —
see the note in `content/index.ts` — and the way to add Arabic articles later is
either a language field per post or paired Arabic fields on each one.

### Where the site's own translations live

```
lib/i18n/
  config.ts        Locales, URL shapes, the LTR/RTL mapping
  admin.ts         The panel's language cookie
  admin-strings.ts The panel's own strings, EN + AR
content/
  en/index.ts      The English bundle (a barrel over content/*.ts, plus ui/meta)
  ar/              Arabic — a deep *override*, not a copy
  index.ts         getContent(locale) + the merge
  server.ts        currentLocale() / content() for server components
```

Arabic overrides only the strings that differ. Slugs, hrefs, image paths, icon
keys and brand names inherit from English, which is what keeps the two
languages on the same URLs and lets the language switch stay on the current
page. Anything not yet translated falls back to English rather than rendering
blank.

### What is deliberately still in Latin script

Not everything that looks untranslated is a gap:

- **Brand and model names** — MLAY T14 Pro, Rejuran Healer, Altesse Cica
  Repairing Bundle. These are how the products are ordered, serviced and
  registered, and they are what is printed on the packaging.
- **Technical notation** — 755 nm, 2,500 W, 33G, Nd:YAG, PLLA, SPF 50+.
- **Standard designations** — CE, ISO 13485, FDA 510(k), MFDS. A standard's
  name is its identifier; only the descriptive line under each is translated.
- **The MLAY distributor seal.** It reproduces an official stamp, which is
  issued and read in the language of the agreement. Its accessible label *is*
  translated, so a screen reader in Arabic still says what the seal means.
- **Blog articles.** Titles, excerpts, categories and author roles come from
  the CMS and are shown as written, per the scoping decision above.

### ⚠️ Before the Arabic site goes live

`content/ar/products-dermatology.ts` carries a notice worth repeating here: the
dermatology product pages are regulated medical-device copy — indications,
wavelengths, injection depths, treatment protocols. Every number and unit is
preserved exactly from the English, but the translation has not been reviewed
by a clinician or a regulatory affairs officer. It should be. A mistranslated
indication is a different class of error from a mistranslated headline.
