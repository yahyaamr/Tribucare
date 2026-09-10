# TribuCare — Project Overview

## Who they are

**TribuCare** is a healthcare and beauty company operating under **Mondial
Investissement Corporation (MIC)**, its legal parent. MIC brings 40+ years of
group experience, with roots in healthcare, chemicals, printing and
packaging.

**Tagline:** "Advancing beauty. Empowering care."

**Description:** TribuCare connects global dermatology technologies,
home-use beauty devices and clinically inspired skincare with professionals
and consumers across **Egypt and the MENA region**.

**Scale (from the company profile):**
- 40+ years of group experience (via MIC)
- 100+ professionals across marketing, sales, technical support, medical
  training, e-commerce and operations
- EGP 100M+ annual revenue from the MLAY home-device line alone
- 8 brands represented (German, Italian, Korean and Chinese partners, plus
  their own flagship skincare brand)
- 35+ field sales reps covering all governorates of Egypt

**Internal teams:** Digital Marketing, Sales Force (nationwide), Technical
Support (device calibration & maintenance), Medical Training (physician
certification & protocols), E-commerce, and Operations (logistics & supply
chain).

## What they do — three business verticals

### 1. Professional Dermatology Solutions
TribuCare is the **exclusive agent in Egypt** for globally recognised German,
Italian and Korean brands, delivering therapeutic and aesthetic technologies
to dermatologists, clinics and aesthetic centres.

**Brands represented:**
| Brand | Origin | Role |
|---|---|---|
| Zimmer Medical | Germany | Aesthetic and medical technology |
| Rejuran | South Korea | PN injectables for skin regeneration and anti-ageing |
| beaumed | South Korea | Injectable solutions for rejuvenation, contouring, medical aesthetics |
| IDS | South Korea | Aesthetic and medical solutions |
| AGEX Beauty | Italy | Aesthetic and medical solutions |
| BV Laser | China | Laser and light-based aesthetic systems |
| AMI | South Korea | Laser platforms (e.g. hair reduction) |
| Kiusera | — | Poly-L-Lactic Acid / injectables |

**Product catalogue:** 12 professional devices/injectables across five
categories — Fractional CO2 Laser, Laser Hair Reduction, Microneedling RF,
Poly-L-Lactic Acid, and REJURAN PN. Each product page includes overview,
features, full technical specs, applications, benefits, certificates (CE,
ISO 13485, MFDS, etc.) and a **per-device request form**.

TribuCare also runs a structured professional-support programme around these
devices: continuous medical education, hands-on device-level training
(delivered by specialised trainers, not sales staff), technical & after-sales
support, and clinical/product education for the teams recommending and
applying the brands.

### 2. Home-Use Beauty Devices — MLAY
In partnership with **MLAY** — "the leading Chinese brand in home-use laser
hair-removal devices" — TribuCare is the **exclusive official distributor of
MLAY in Egypt**, bringing salon-grade beauty tech to consumers via flagship
retail and nationwide e-commerce.

**Retail footprint:**
- Flagship stores: City Stars, Mall of Arabia, Mall of Tanta, San Stefano
  Mall
- E-commerce: Amazon, Noon, Jumia, and major pharmacy chains

**Product catalogue:** 15 products across two lines — IPL Hair Removal &
Skin Rejuvenation Handsets (flagship, e.g. MLAY T14 Pro AI Smart IPL) and
Specialized Replacement Lamps & Precision Lenses.

### 3. Medicated Skincare — Altesse Soin
**Altesse Soin** is TribuCare's own flagship skincare brand — clinically
inspired formulations combining dermatological science with premium active
ingredients.

**Product lines (23 products total):**
1. **Cica** — barrier repair & calming (Centella Asiatica, Madecassoside,
   Ceramides)
2. **Lustré** — brightening / hyperpigmentation (Vitamin C, Niacinamide)
3. **Réservoir** — hydration (Hyaluronic Acid, Polyglutamic Acid, Ceramides)
4. **Sunissime** — SPF 50+ daily photoprotection (UVA/UVB + HEV Blue Light)
5. **Deodorants** — aluminum-free whitening & hair-delaying roll-ons
6. **Accessories** — travel pouches & vanity essentials

## Mission & Vision

**Mission:** "Empowering confidence through innovative beauty technology."
Partnering with global innovators like MLAY to bring safe, effective,
easy-to-use beauty devices to every home in Egypt. Pillars: Purpose-Driven,
People First.

**Vision:** "Leading the future of beauty wellness in every home." Aiming to
be Egypt's most trusted beauty-tech partner. Pillars: Excellence,
Sustainable Impact.

## Core Values & Professional Support

Twelve stated values guide the company and its clinical partnerships:
Customer Obsession, Ethical Commitment, Creative Innovation, Lean Efficiency,
Collaborative Spirit, Agility & Responsiveness, Professional Excellence,
Trust & Integrity, Continuous Medical Education, Hands-on Training,
Technical & After-Sales Support, and Product Education.

## Who they partner with

TribuCare positions itself for five audiences: global brand partners,
dermatologists & physicians, clinics & aesthetic centres, retail partners,
and distributors — inviting them to "build what's next in beauty and
healthcare" via a dedicated Partnerships page and contact form.

---

# The Website

A Next.js marketing site with a single, strict design system (documented in
`AGENTS.md`) — every new page/section/card must be visually indistinguishable
from existing ones, built by copying the closest existing component rather
than improvising.

## Site structure

| Route | Purpose |
|---|---|
| `/` | Homepage — hero (Partner With Us / About TribuCare), mission & vision, three-vertical expertise, reach stats, core values, events & news carousel, teams, careers, blog rail, FAQ, partnerships close |
| `/about` | About page — team hero, figures, mission & vision, story and leadership (the last two still marked as drafts) |
| `/dermatology` | Professional dermatology catalogue (12 devices/injectables), with the live events rail |
| `/dermatology/[slug]` | Individual product page with specs, gallery + request form |
| `/mlay` | MLAY home-use beauty device catalogue (15 products) |
| `/altesse-soin` | Altesse Soin skincare catalogue (23 products, 6 lines) |
| `/partner` | Partnership pitch, stats, pillars, and a partner enquiry form |
| `/blogs`, `/blogs/[slug]` | Blogs and Insights — written in the admin panel (`/blog` redirects here) |
| `/events`, `/events/[slug]` | Events & News — written in the admin panel; the next upcoming item leads automatically (`/news` redirects here) |
| `/ar/…` | Every route above, in Arabic |
| *secret path* | The admin panel — blogs, events & news, careers, media, settings. Not at `/admin`, which returns the site's 404; served from `ADMIN_PATH`. |

**Header:** Home · Our Expertise ▾ · Core Values · Events & News · Blogs and
Insights · About. *Our Expertise* opens a drop-down straight to the three
verticals' pages — Dermatology Solutions, MLAY, Altesse Soin — on desktop as
the header bar stretching, and on phones and tablets as a sub-list inside the
menu.

**Footer:** brand block and socials, then two link columns (Company incl. FAQ;
Our Brands), the copyright line and the studio credit ("Designed and developed
by Web and Value" → webandvalue.com).

## Blog

Written and published in the admin panel. Seeded with 7 posts across 4
categories: Beauty Innovation, Clinical Practice, Dermatology & Tech, Skincare
Science — Rejuran/polynucleotide boosters, MENA aesthetic trends, Cica
skincare, home beauty devices, Zimmer cryotherapy, medical education. A post
can be *featured* to lead `/blogs`.

## Events & News

Written and published in the admin panel as one record type (an announcement
simply has no venue). The same items appear on `/events`, in the homepage
carousel and on the `/dermatology` rail, each card linking to its page. The
index leads with the **next upcoming** event, or failing that the newest —
there is no manual "feature" switch. The store was seeded from the six
placeholder listings that used to be hard-coded; replace them in the panel.

## Performance

The public pages are statically cached and regenerated when something is
published (and hourly as a backstop), so a visit is served from the edge and
back/forward navigation restores instantly. Lighthouse on a mobile profile
sits in the mid-90s for performance with 100 for best practices and SEO.

## Design system highlights

- **Tokens:** deep teal ground (`brand-900/950`), primary `brand-600`, soft
  tints (`brand-50/100/200`), cyan accent (`circuit-300-500`), orange accent
  (`signal-300-600`). Never raw hex, never pure black.
- **Type:** Outfit (display/headlines), Figtree (body), Geist Mono (eyebrow
  labels only).
- **Canonical card:** `components/blog/post-card.tsx` — the pattern every
  content card (blog, event, future types) must follow exactly: white
  `card-surface`, `h-52` media band, floating category badge, meta row,
  title, excerpt, footer.
- **Motion:** one house easing curve, no bespoke cubic-beziers; every
  animation respects `prefers-reduced-motion`.
- **Sections:** alternate `ground-light` / `ground-deep` backgrounds down the
  page; consistent `py-24 md:py-32` rhythm, `<Shell>` for gutters.

## Content architecture (source of truth)

All copy lives in typed `content/*.ts` files, imported into presentational
components — never hardcoded in JSX:
- `content/site.ts` — core company/homepage copy (644 lines)
- `content/dermatology.ts` — professional device/injectable catalogue (675
  lines)
- `content/mlay.ts` — MLAY product catalogue (316 lines)
- `content/altesse.ts` — Altesse Soin product catalogue (448 lines)
- `content/blogs.ts` — blog posts & categories (225 lines)

**Sourcing discipline:** every factual claim is traceable to TribuCare's
company-profile deck or manufacturer documentation — no invented
certifications, specs, awards, customer counts, or partnerships. Anything
not covered by source material is left empty and renders conditionally
(e.g. `contact` details — email/phone/address/social — are currently blank
pending real values).

## What's not yet filled in

- **Contact details** (`content/site.ts`): email, phone and address are
  intentionally empty — the source deck had no contact slide. The three social
  links (LinkedIn, Facebook, Instagram) were supplied by TribuCare and are live.
- **About page**: the story paragraphs and the leadership section are marked
  as drafts on the page itself until the real copy and people are supplied.
- **Careers**: the three roles are agreed stand-ins, and the apply URL is
  empty so no apply button renders yet.
- **Events & News**: the seeded records are the former placeholders; replace
  them in the panel. The static six in `content/site.ts` remain only as the
  fallback for an unreachable store.
- **FAQ**: placeholder Q&A pending the commercial team's actual most-asked
  questions.
