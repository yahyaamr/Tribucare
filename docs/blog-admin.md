# The admin panel

A password-protected CMS where the SEO team publishes everything on the site
that changes week to week — without a developer, a code change or a redeploy.

It covers three content types, plus the media and lists they draw from:

| Section | Publishes to | Notes |
|---|---|---|
| **Blogs** | `/blog` and `/blog/<slug>` | Continuous editor, live preview, categories, authors |
| **Events & News** | `/events` | Same editor, with a date, a location and tags |
| **Careers** | the Careers section on `/` | Role, department, type, location, blurb |
| **Media** | shared by all three | Drag-and-drop uploads, plus the site's own artwork |
| **Settings** | — | Categories, authors, news tags, panel language |

Everything below describes blogs; **events, news and careers work the same
way** — same editor, same draft/publish model, same media library. Where they
differ it is called out.

---

## Contents

1. [Getting in](#1-getting-in)
2. [Setup, once](#2-setup-once)
3. [Running it locally](#3-running-it-locally)
4. [The panel, screen by screen](#4-the-panel-screen-by-screen)
5. [The editor in detail](#5-the-editor-in-detail)
6. [How what you write reaches the live site](#6-how-what-you-write-reaches-the-live-site)
7. [The security model](#7-the-security-model)
8. [Maintenance](#8-maintenance)
9. [Troubleshooting](#9-troubleshooting)
10. [Languages](#10-languages)

---

## 1. Getting in

Three things stand between the internet and the panel. They are independent, and
each one exists because the one before it is not enough.

### The secret path

The panel is **not at `/admin`**. It is served from whatever `ADMIN_PATH` names —
for example `https://www.tribucare.com/tc-guztckekhtvy`. Requests to `/admin`
and `/api/admin/*` return the site's ordinary 404, **whatever cookies or session
they carry**. There is no redirect from the old address, because a redirect
would hand the secret to anyone who guessed the old one.

Treat that URL as a credential. Bookmark it; do not put it in `robots.txt`, a
sitemap, an email signature or any public link.

**What this is and is not.** It stops the automated scanners that sweep every
site on the internet for `/admin`, `/wp-admin` and `/administrator`. It does not
stop a person who has the URL — obscurity is a layer, not a lock, and the
password is what actually guards the panel. It also means the secret now sits in
the browser's URL bar and history, so anyone who watches you work has it.

### The password

One shared password for the whole team, set as `ADMIN_PASSWORD`. There are no
individual accounts, which has one consequence worth knowing: **the panel cannot
tell you who did what.** Changing the password signs everybody out at once,
which is how access is revoked when someone leaves.

### How long you stay signed in

Three rules, all of which must hold. Any one of them ending your session sends
you back to the login screen with your work unsaved, so **save before you walk
away**.

| Rule | What ends the session |
|---|---|
| **Idle** | 60 minutes with no request. The clock slides forward on every page load and save, so it never interrupts active work. |
| **Browser** | Quitting the browser. The session cookie carries no expiry date, so the browser discards it on exit. |
| **Tab** | Closing the tab you signed in from. |

The tab rule has a cost that is not a bug. The browser gives a page no way to
tell "this tab was reopened" from "this is a second tab" — both are a tab with
empty `sessionStorage`. So **opening the panel in a second tab signs the first
one out.** Work in one tab. If that becomes intolerable, delete
`components/admin/tab-session.tsx` and its mount in
`app/(admin)/admin/(panel)/layout.tsx`; the other two rules keep working.

### Three wrong passwords blocks you for a week

Consecutive wrong passwords from one IP address: the first two are refused with
a countdown ("2 attempts left…"), the third blocks that address for **seven
days**. Signing in successfully clears the run, so the three have to be
unbroken, not merely three in a month.

While blocked, **even the correct password is refused** — otherwise the block
would mean nothing.

Two properties were chosen deliberately:

- **The block is per address, never global.** A global counter would let any
  stranger who found the login stop the whole team publishing for a week with
  three wrong guesses — trading a brute-force risk for a much cheaper denial of
  service.
- **An office is one address.** Everyone behind the same router shares a
  counter, so a colleague's third typo locks their colleagues out too. That is
  unavoidable when the credential is shared and there are no accounts, and it is
  why the unlock script exists.

### Unlocking

Being locked out is exactly when the panel cannot help you, so the escape hatch
is a script rather than a button:

```bash
node scripts/unlock-login.mjs --list    # who is blocked, and for how long
node scripts/unlock-login.mjs --all     # lift every block
node scripts/unlock-login.mjs 41.35.12.7  # lift one address
```

It needs the Upstash credentials in the environment — run `vercel env pull`
first, or run it anywhere `.env.local` has them. Without Redis configured,
blocks live in each server instance's memory and a redeploy clears them anyway.

---

## 2. Setup, once

All of it in the Vercel dashboard for this project. **Environment variables only
reach builds that start after they exist, so redeploy after any change.**

| Variable | Required | What it does |
|---|---|---|
| `ADMIN_PASSWORD` | **Yes** | The shared password. Without it every login is refused with a message saying so. |
| `ADMIN_PATH` | Recommended | The secret path the panel is served from, without slashes. Unset, the panel falls back to `/admin`. |
| `BLOB_READ_WRITE_TOKEN` | **Yes in production** | Injected automatically when a Blob store is connected. |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN` | Recommended | Injected automatically when Upstash Redis is connected. Without them the login lockout is per-instance and effectively toothless. |
| `ADMIN_SESSION_SECRET` | Optional | Signing key for the session cookie. Without it the key derives from the password, which works — it just means changing the password also ends every open session. |

### Vercel Blob — where posts and uploads live

**Storage → Create Database → Blob → connect to this project.**

Vercel gives every deployment a **read-only filesystem**. Without a Blob store,
anything the team writes is thrown away on the next deploy. The panel shows a
warning on every page until one is connected.

### Upstash Redis — where login attempts are counted

**Storage → Create Database → Upstash → Redis.** Pick the region your functions
run in (`fra1` for this project), leave **Eviction off** — eviction would let
Redis silently drop lockout keys under memory pressure — and connect it to the
project across **Production, Preview and Development**.

Tick Development too: `vercel env pull` only pulls that environment, and without
it the unlock script cannot work from your machine.

**Leave the Custom Prefix blank.** A prefix renames the injected variables to
`STORAGE_REST_API_URL` and similar, which this code does not read. It would not
error — it would silently fall back to in-memory counting, and you would believe
you had brute-force protection you did not have.

You do **not** need `npm install @upstash/redis`. The code calls the REST API
with `fetch`, which is one fewer dependency and runs in any runtime.

### Setting `ADMIN_PATH`

Generate something unguessable, not a word:

```bash
node -e "const c=require('crypto');console.log('tc-'+c.randomBytes(9).toString('base64url').toLowerCase().replace(/[^a-z0-9]/g,''))"
```

Save it in a password manager. If you store it in Vercel as a **Secret** you
cannot read it back — losing it means setting a new one and redeploying, which
is recoverable but disruptive.

---

## 3. Running it locally

```bash
cp .env.example .env.local     # then fill in ADMIN_PASSWORD
npm run dev
```

Open `http://localhost:3000/<ADMIN_PATH>`, or `http://localhost:3000/admin` if
you left `ADMIN_PATH` blank.

Without a Blob store, posts are written to `.cms-data/` and uploads to
`public/uploads/`. Both are gitignored — they are content, not source.

**Pulling environment variables is not safe by default.** `vercel env pull`
overwrites `.env.local` with the **Development** environment only. If
`ADMIN_PASSWORD` and `ADMIN_PATH` are set for Production but not Development,
a straight pull silently deletes them from your local file and your local login
stops working. Back the file up first, or pull to a scratch path and merge:

```bash
cp .env.local /tmp/env.backup
npx vercel env pull /tmp/pulled.env --yes
# then copy across only the keys you actually want
```

### Moving local content up

Anything written before a Blob store was connected lives on the machine that
wrote it. To copy it up rather than retype it:

```bash
npm run cms:push                     # dry run — lists what it would send
node scripts/cms-push.mjs --write    # actually send it
```

It copies posts, news, authors, categories, tags and uploaded images, and
**skips anything already in Blob**, so a second run cannot quietly overwrite
what the team has since edited online. `--force` replaces those too.

---

## 4. The panel, screen by screen

### The admin bar and sidebar

Present on every screen once signed in.

| Control | What it does |
|---|---|
| **☰** (mobile) | Opens the sidebar. |
| **Globe** | Switches the *panel's* language between English and Arabic. A cookie, so it is per person and does not change any content. |
| **View blog** | Opens the public `/blog` index in a new tab. |
| **View events** | Opens the public `/events` index in a new tab. |
| **Sign out** | Ends the session and returns to the login screen. |
| **Dashboard / Posts / Events & News / Careers / Media / Settings** | Navigation. The current section is highlighted. |
| **New post / New item** | Shortcuts straight into an empty editor. |

### Dashboard

Counts of published blogs, published news, drafts and images, plus the five most
recent of each. Every row links into its editor. Read-only.

### The Posts list

| Control | What it does |
|---|---|
| **All / Published / Drafts** | Filters the list. Counts update with it. |
| **Search** | Filters by title as you type. |
| **Add new post** | Opens an empty editor. |
| **Pencil** | Edit. |
| **Eye** | Published posts open the live article; drafts open the editor's Preview tab, since there is no live URL yet. |
| **Trash** | Deletes after a confirmation. Immediate and permanent — there is no trash to restore from. |

### The editor

Three regions: the **action bar** at the top, the **main column** (Title,
Permalink, Content, Excerpt), and the **settings rail** on the right.

**Action bar**

| Control | What it does |
|---|---|
| **← Posts** | Back to the list. Warns if you have unsaved changes. |
| **Status pill** | Draft or Published. |
| **Unsaved changes** | Appears the moment you type. Nothing autosaves. |
| **Edit / Preview** | A tab pair, not a separate screen. Preview renders `components/blog/article-view.tsx` — the exact component the published page uses — against the draft in memory. It cannot drift from the real article, because it *is* the real article. |
| **Save draft** | Saves without publishing. Disabled until a language is ticked. |
| **Publish / Update** | Saves and makes it live. The label changes once the post is published. |

**Main column**

- **Title** — the headline on the card, the `/blog` index and the browser tab.
  Accepts Arabic (`dir="auto"`, so the box follows the text).
- **Permalink** — the URL slug. It follows the title until you edit it by hand,
  after which it stops following, so a post never ships with a slug from an
  abandoned first headline.
- **Content** — the writing surface. [Full detail below.](#5-the-editor-in-detail)
- **Excerpt** — the card, index and search/social description. It sits *after*
  the article deliberately: it summarises what you just wrote, and asking for it
  first meant writing it twice.

**Settings rail**

| Panel | What it holds |
|---|---|
| **Publish** | Status, publish date (stored sortable, shown long-form), **Feature this post**, **View live post**, **Move to trash**. |
| **Cover image** | Drives the card, the article hero and the social image. Set / Replace / Remove. |
| **About the Taxonomy** | Which language sites the post is listed on. **Placement, not translation** — ticking English lists it on `/blog` whatever language it is written in. Both save buttons stay disabled until one is ticked, because a post on no site is not a post. |
| **Categories** | Type to filter, tick as many as apply, or type a new name and choose **Create "…"**. A category created here is saved immediately and offered on every other post straight away. The **first** one selected is the primary — the one shown wherever there is room for only one badge. |
| **Author** | Picked from the list managed in Settings. A post holds a *reference*, so correcting a name or photo updates every article that author wrote. |
| **SEO** | Meta title and description, with character counts. Both fall back to the title and excerpt when blank. |
| **Reading time** | Blank means "compute it from the word count". |

### Media

Two groups:

- **Uploads** — everything the team has added. Drag and drop, or **Choose
  files**. Deletable.
- **Already on the site** — the artwork the current articles use, which lives in
  the repository rather than in storage. Selectable for new posts, **not
  deletable**, because removing one needs a code change rather than a click.

Uploads are capped at **300 KB** and limited to JPG, PNG, WebP, AVIF and GIF.
SVG is deliberately refused: it can carry scripts, and nothing on the site needs
a vector cover image.

### Settings

`/settings` holds the lists the editors draw from.

**Categories** — add, rename, delete. Renaming rewrites every post carrying the
old name in the same operation, so the blog can never show two filter tabs for
what is one category.

Deleting is two-step. The first click reports what the category is attached to,
flagging posts for which it is the *only* category as "will have no category".
Nothing is removed until that warning is confirmed, and the posts themselves are
never deleted — only the category is stripped from them.

**Authors** — add, edit, delete, with a photo from the media library. Deleting
warns which posts would lose their byline; those posts keep everything else and
render without an author until one is assigned.

**News tags** — the same, for events and news. Kept entirely separate from blog
categories, so renaming one can never reach the other.

Near-duplicates are collapsed in both lists: typing `beauty   innovation`
selects the existing **Beauty Innovation** rather than adding a second,
near-identical tab to the blog filter row.

---

## 5. The editor in detail

The article is **one continuous writing surface**, the way an email is. There
are no block cards, no type badges, no per-block move and duplicate buttons.
Writers do not think in blocks; they think in a document.

### Typing

| Key | What happens |
|---|---|
| **Enter** | Starts a new paragraph. Never inserts a line break — see below. |
| **Backspace** at the start of a line | Merges it into the paragraph above, caret landing at the join. |
| **Delete** at the end of a line | Pulls the next paragraph up. |
| **↑ / ↓** at the first/last line | Moves the caret into the block above or below, including out of a list. |

**Enter never inserts a newline.** A block stores a plain string and the
published page renders it as a single text node, so a soft line break would show
in the editor and vanish on the live site. Making Enter always start a new
paragraph is what keeps the editor honest about what will actually render.

### Shortcuts

Typed at the very start of an empty or plain paragraph:

| Type | Becomes |
|---|---|
| `## ` (or `# `, `### `) | A section heading |
| `- ` or `* ` | A bulleted list |
| `> ` | A pull quote |

Inside a list, **Enter** makes the next bullet and **Backspace** on an empty
last bullet turns it back into a paragraph — so a list can be started and
finished without touching the mouse.

### The toolbar

**Heading · List · Quote · Key takeaways · Image.** Each inserts after the block
your caret is in — unless that block is an empty paragraph, in which case it
replaces it, so reaching for the toolbar mid-draft never leaves a blank line
behind. **Image** opens the media library.

Lists, quotes, takeaway panels and images each show a small delete control on
hover; text is removed with Backspace like ordinary writing.

### Pasting

- **Several paragraphs** (separated by blank lines) arrive as separate
  paragraphs, not one wall of text. Pasting a drafted article from a document
  keeps its structure.
- **An image** is uploaded and inserted where the caret is.

### Pasted images are compressed for you

The upload cap is 300 KB and a screenshot is routinely several megabytes, so:

| Size | What happens |
|---|---|
| ≤ 300 KB | Uploaded as-is. |
| 300 KB – 2 MB | Resized and re-encoded to WebP until it fits, then uploaded. A **Compressing…** then **Uploading…** tag shows in the frame the picture will occupy. |
| > 2 MB | Refused with a message. Squeezing 300 KB out of a 900 KB paste is invisible; out of a 6 MB one it is not, and the editor should say so rather than publishing mush. |
| Animated GIF over the cap | Refused rather than compressed — re-encoding through a canvas keeps the first frame and throws the animation away. |

Choosing from the media library is unaffected: that path still refuses anything
over the cap outright.

### What the editor cannot do, and why

**There is no bold, italic or inline link.** A block stores a plain string, and
`components/blog/article-body.tsx` renders it as a React text node — there is
nowhere to put a mark. Adding them would mean either dropping the formatting on
save or teaching the published page to render HTML, which would put a hole in
the design system big enough for an article to look foreign.

There is likewise no free-form HTML. Every block maps onto a treatment the site
already has, so an article written a year from now still looks like the rest of
TribuCare. **The writer chooses *what* a passage is; the design system decides
how it looks.**

### What is stored

The document is an ordered `Block[]` — the same shape it has always been. The
editor is a writing surface over that array and nothing more, which is why
replacing it changed nothing about the published page.

| Block | Renders as |
|---|---|
| `lead` | The opening paragraph, one size up |
| `heading` | A section `h2` |
| `paragraph` | Body copy |
| `list` | Simple bullets |
| `quote` | The dark teal pull-quote panel |
| `takeaways` | The mint "Key Takeaways" panel |
| `image` | Full-width figure with an optional caption |

`components/blog/article-body.tsx` is the **single renderer** for both the
published page and the editor's preview. Change a treatment there and both move
together; there is no second implementation to keep in step.

---

## 6. How what you write reaches the live site

- **Posts live in the store as one JSON file each**, not in the codebase. The
  six articles once hard-coded in `content/blogs.ts` are copied in the first
  time the panel is opened, and that file remains only as the seed. Deleting
  every post does **not** bring them back.
- **The blog pages are cached and refreshed the moment something is published,
  updated or deleted** (`lib/cms/revalidate.ts`). No redeploy — publishing is
  live within seconds.
- **Drafts are invisible.** A draft URL 404s and the post appears in neither the
  index nor the sitemap.
- **Only one post can be featured.** Featuring one un-features the previous,
  because `/blog` promotes exactly one.
- **Events and news** derive past/upcoming from the date, so an event moves
  itself into the archive.
- **Careers** render as the cards in the Careers section on the homepage, and
  the apply button is omitted entirely until an apply URL is set — an empty one
  ships no dead link.

---

## 7. The security model

Five layers. Each assumes the one before it has already failed.

| Layer | Stops | Does not stop |
|---|---|---|
| Secret path | Scanners sweeping for `/admin` | Anyone told the URL |
| `noindex` + no `robots.txt` entry | Search engines and AI crawlers indexing the panel | Direct access |
| Shared password, HMAC-signed cookie | Anyone without the password | A shared or guessed password |
| Three-strike lockout | Brute force | A distributed attack from many addresses |
| Server-side session check on every page and route | Forged cookies, expired sessions | Nothing beyond that |

### Decisions worth knowing about

**`robots.txt` no longer names the panel.** It used to carry
`Disallow: /admin`. That file is world-readable and is the first thing a scanner
fetches, so the rule was an index of what to attack. Nothing was lost by
removing it: the pages send `noindex, nofollow, nocache`, and an un-authorised
request now gets a 404 anyway.

**`/admin` returns a 404, not a redirect and not a 401.** Both of those confirm
a panel exists. The 404 is the site's real one, rendered through the public
route tree, so it is indistinguishable from any other bad URL.

**The admin API moved under the secret path too.** Leaving it at
`/api/admin/login` meant a prober could confirm the panel existed by POSTing to
it. One secret, no guessable leftovers.

**The secret is never in the browser bundle.** `ADMIN_PATH` is deliberately not
`NEXT_PUBLIC_`: that would inline it into the JavaScript of every page on the
marketing site, including pages a stranger can read. The panel's layout reads it
on the server and passes it down through React context instead.

**The lockout fails open.** If Redis is unreachable, logins proceed unthrottled
rather than being refused. A storage outage should not be indistinguishable from
a lockout, because that failure mode locks the team out of their own site with
no way to tell why.

**Every API handler calls `requireSession()`.** The proxy's redirect is an
optimistic convenience, not the gate. The only handlers that do not are `login`
(which cannot) and `logout` (which need not). Anything else is a bug.

### What is still open

- **No individual accounts**, so no audit trail: the panel cannot say who
  deleted a post. Fixing that means real accounts or SSO.
- **No 2FA.** The password is the only factor.
- **A shared password** is only as good as the discipline around sharing it.
  Consider SSO (Google or GitHub, restricted to your domain) if the team grows —
  it brings identity, revocation and 2FA at once, and would replace most of
  `lib/cms/auth.ts` rather than extend it.
- **Uploads trust the client's declared content type.** Validating magic bytes
  server-side would make the allowlist real. Post-authentication hardening, not
  a way in.

---

## 8. Maintenance

### Rotating the password

Change `ADMIN_PASSWORD` in Vercel and redeploy. Everyone is signed out
immediately, because the session signing key derives from the password unless
`ADMIN_SESSION_SECRET` is set. Update `.env.local` to match, or local and
production drift apart and the failure looks like a wrong password.

### Rotating the secret path

Change `ADMIN_PATH` and redeploy. The old URL becomes a 404 at once. Tell the
team before you do it.

### Where the code is

```
lib/cms/
  types.ts        Post, News, Role, Block and MediaItem shapes
  format.ts       Pure helpers — safe to import from client components
  store.ts        Storage interface + Vercel Blob and filesystem implementations
  posts.ts        Blog CRUD, seeding, validation
  news.ts         Events & news CRUD
  roles.ts        Career roles CRUD
  categories.ts   Category list, rename, delete-with-usage-report
  news-tags.ts    The same, for the events & news tag list
  authors.ts      Author list; posts reference these by id
  media.ts        Uploads, plus the site's own artwork (listSiteMedia)
  compress.ts     Browser-side shrinking for pasted images
  auth.ts         Password check, signed session cookie, idle window
  gate.ts         Where the panel is mounted (ADMIN_PATH)
  rate-limit.ts   Login lockout, backed by Upstash
  session.ts      The server-side gate used by pages and API routes
  revalidate.ts   Cache refresh on publish
lib/i18n/
  admin.ts        The panel's language cookie
  admin-strings.ts The panel's own strings, EN + AR, one typed object
proxy.ts          Mounts the panel on the secret path, seals /admin,
                  slides the idle window on each authenticated request
scripts/
  unlock-login.mjs  Lifts a login block
app/(admin)/admin/  The panel (login sits outside the gated (panel) group)
app/api/admin/      Its API — every handler calls requireSession()
components/admin/
  shell.tsx         Sidebar, admin bar, sign out
  base-path.tsx     useAdminBase() / useAdminApi() — the secret path, client-side
  tab-session.tsx   Ends the session when the tab that opened it is gone
  doc-editor.tsx    The continuous writing surface
  media-picker.tsx  The library, as a page and as a dialog
  post-editor.tsx news-editor.tsx role-editor.tsx
  posts-table.tsx news-table.tsx roles-table.tsx
  settings/         Category, author and news-tag managers
```

### Rules for anyone changing the panel

- **Never hardcode `/admin` or `/api/admin` in a link or fetch.** Use
  `useAdminBase()` and `useAdminApi()` in client components, `adminBase()` in
  server ones. A hardcoded path lands on the 404 the moment `ADMIN_PATH` is set.
- **Never make `ADMIN_PATH` public.** No `NEXT_PUBLIC_`, and nothing that puts
  it in a client bundle shared with the marketing site.
- **Every new API handler starts with `requireSession()`.**
- **Call `revalidateBlog()` (or the news equivalent) after every write**, or the
  public pages keep serving the old copy until the cache window ages out.
- **The block model is the contract.** `article-body.tsx` renders both the live
  page and the preview; changing what a block means changes published articles.

### Swapping the storage later

Everything above `store.ts` speaks one interface (`list` / `read` / `put` /
`del`). Moving to Postgres means writing one more implementation and changing
`getStore()` — no page, route or component moves.

---

## 9. Troubleshooting

| Symptom | Cause and fix |
|---|---|
| The secret URL shows a 404 | `ADMIN_PATH` does not match the URL, or the deploy predates the variable. Redeploy; if it still fails, set a new `ADMIN_PATH` and use that. |
| "That password is not right" with the right password | Local and production `ADMIN_PASSWORD` have drifted, or the pasted value carries a trailing space or newline — the login does not trim. Values wrapped in quotes in `.env.local` have the quotes stripped by dotenv, so the password is what is *inside* them. |
| "Too many wrong passwords" | Three consecutive failures. `node scripts/unlock-login.mjs --all`. |
| Signed out constantly | Expected if you keep two tabs open — the second signs the first out. Also check whether an hour of idle passed. |
| The panel is empty but the site shows articles | The deployment has no Blob store. During a build the filesystem is writable, so posts are seeded and baked into the static pages; at request time the serverless filesystem has no `.cms-data/`, so the panel lists nothing. Connect Blob and redeploy. |
| Lockout not working in production | `KV_REST_API_URL` / `KV_REST_API_TOKEN` missing, or a Custom Prefix renamed them. It fails silently to in-memory counting. |
| Uploads rejected | Over 300 KB, or an unsupported type. SVG is refused on purpose. |
| A published change is not on the site | `revalidateBlog()` was not called by whatever wrote the record. |

---

## 10. Languages

The public site is bilingual — English at its existing URLs, Arabic under
`/ar/…` — and the panel has a language of its own.

**In the panel**, the globe in the admin bar and the **Language** panel in
Settings switch the interface between English and Arabic. It is a cookie, not a
URL, so it is per person: one editor can work in Arabic while another works in
English, on the same posts. Switching does not move you off the page you are on.

**Blog articles themselves are not translated.** A post written in the panel
appears on both `/blog` and `/ar/blog` in whatever language it was written in;
only the surrounding chrome changes. The **About the Taxonomy** checkboxes
decide which language sites list it, which is a placement decision, not a claim
about what language it is in.

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
keys and brand names inherit from English, which keeps both languages on the
same URLs and lets the language switch stay on the current page. Anything not
yet translated falls back to English rather than rendering blank.

### What is deliberately still in Latin script

Not everything that looks untranslated is a gap:

- **Brand and model names** — MLAY T14 Pro, Rejuran Healer, Altesse Cica
  Repairing Bundle. These are how the products are ordered, serviced and
  registered, and what is printed on the packaging.
- **Technical notation** — 755 nm, 2,500 W, 33G, Nd:YAG, PLLA, SPF 50+.
- **Standard designations** — CE, ISO 13485, FDA 510(k), MFDS. A standard's name
  is its identifier; only the descriptive line under each is translated.
- **The MLAY distributor seal.** It reproduces an official stamp, issued and
  read in the language of the agreement. Its accessible label *is* translated.
- **Blog articles.** Shown as written, per the scoping decision above.

### ⚠️ Before the Arabic site goes live

`content/ar/products-dermatology.ts` carries a notice worth repeating: the
dermatology product pages are regulated medical-device copy — indications,
wavelengths, injection depths, treatment protocols. Every number and unit is
preserved exactly from the English, but the translation has **not** been
reviewed by a clinician or a regulatory affairs officer. It should be. A
mistranslated indication is a different class of error from a mistranslated
headline.
