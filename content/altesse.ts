/**
 * Altesse Soin Medicated Skincare — data and product catalogue.
 * Sourced directly from TribuCare flagship skincare brand documentation and official altessesoin.com catalog.
 * Uses 100% authentic photography from official store CDNs.
 */

import type { BrandCollection } from "./collections";

export type { BrandCollection };

/**
 * The Altesse Soin catalogue, as the categories the store sells it in.
 *
 * One card per entry in the `altessesoin.com` Categories menu, in its order —
 * the handles here are the ones its own navigation links to. The badge carries
 * the store's own label so a reader knows exactly which category they land in;
 * the title and blurb stay the fuller description of the range.
 *
 * Two menu entries are deliberately absent. "All Products" duplicates every
 * other card, as it does on the MLAY page. "Accessories" — the travel
 * pouches and vanity cases — was dropped: the page is a skincare
 * catalogue, and the one non-skincare card read as an outlier in it.
 */
export const altesseCollections: BrandCollection[] = [
  {
    slug: "cica",
    brand: "Altesse Soin",
    badge: "Cica: Repair & Protect",
    name: "Cica Barrier Repair & Calming Protocols",
    summary:
      "Formulated with therapeutic concentrations of Centella Asiatica (Cica), Madecassoside, and bio-identical Ceramides to soothe irritated, red, or post-procedure skin and restore epidermal resilience.",
    store: "altessesoin.com",
    image: "/brand/altesse/altesse-cica-bundle-real.webp",
    url: "https://altessesoin.com/collections/cica-1",
  },
  {
    slug: "brightening",
    brand: "Altesse Soin",
    badge: "Lustré: Brightens & Even",
    name: "Lustré Radiance & Hyperpigmentation Regimens",
    summary:
      "Advanced multi-target brightening protocols combining Vitamin C, Niacinamide, and botanical antioxidants to fade stubborn sun spots, unify tone, and reveal natural dermal luminescence.",
    store: "altessesoin.com",
    image: "/brand/altesse/brightening-bundle.webp",
    url: "https://altessesoin.com/collections/lustre",
  },
  {
    slug: "reservoir",
    brand: "Altesse Soin",
    badge: "Rèservoir: Hydrate & Firm",
    name: "Réservoir Peptides & Ceramides Hydration Protocols",
    summary:
      "Multi-molecular Hyaluronic Acid, Polyglutamic Acid, and restorative Ceramides delivering sustained 72-hour moisture that plumps dehydration lines without oiliness.",
    store: "altessesoin.com",
    image: "/brand/altesse/reservoir-kit-hydration-rotten-3pcs.webp",
    url: "https://altessesoin.com/collections/reservoir",
  },
  {
    slug: "sunissime",
    brand: "Altesse Soin",
    badge: "Sunissime: Sunscreen",
    name: "Sunissime Daily Photoprotection SPF 50+",
    summary:
      "High-performance broad-spectrum UVA/UVB and HEV Blue Light defense formulated with antioxidant complexes, offering an invisible, non-greasy matte finish in intense sun.",
    store: "altessesoin.com",
    image: "/brand/altesse/sunissime-hydrating-daily-sunscreen-spf50-50ml.webp",
    url: "https://altessesoin.com/collections/sunissime",
  },
  {
    slug: "deodorants",
    brand: "Altesse Soin",
    badge: "Deodorants",
    name: "Whitening & Hair-Delaying Deodorant Roll-Ons",
    summary:
      "Aluminum-free brightening roll-on deodorants with natural plant-derived hair-growth retarding complexes and 48-hour gentle odor control in signature fragrances.",
    store: "altessesoin.com",
    image: "/brand/altesse/daily-duo.webp",
    url: "https://altessesoin.com/collections/rollon",
  },
  {
    slug: "travel-size",
    brand: "Altesse Soin",
    badge: "Travel Size Products",
    name: "Travel Size Foaming Cleansers",
    summary:
      "The Cica, Lustré and Réservoir foaming cleansers in 30ml format — the same formulations in cabin-friendly sizes, for travel or for trying a routine before committing to it.",
    store: "altessesoin.com",
    image: "/brand/altesse/altesse-cica-mild-foaming-cleanser-30ml.webp",
    url: "https://altessesoin.com/collections/travel-size-items",
  },
];

export const altesse = {
  eyebrow: "Medicated Skincare Products",
  headlineLead: "Formulated with",
  headlineAccent: "dermatological science.",
  intro:
    "Altesse Soin is TribuCare's flagship in-house skincare brand, engineering clean, clinically validated formulations tailored specifically to the unique environmental stressors and skin phototypes of Egypt and the Middle East.",
  audience: "Dermatologists · Pharmacies · Daily Skincare Rituals",
  brands: ["Altesse Soin"],
  image: {
    src: "/brand/altesse-soin-cutout.webp",
    alt: "Altesse Soin medicated skincare held in hands.",
    width: 855,
    height: 1526,
  },

  catalogue: {
    eyebrow: "Skincare Catalogue",
    headlineLead: "Targeted routines,",
    headlineAccent: "pure pharmaceutical actives.",
    intro:
      "Every Altesse Soin routine is designed as a synergistic 3-step ritual (Cleanse, Treat, Hydrate) that strengthens the moisture barrier while addressing specific concerns like sensitivity, dullness, and dehydration.",
  },

  moments: {
    eyebrow: "Clinical & Community Presence",
    headlineLead: "Where Altesse Soin",
    headlineAccent: "connects with skin professionals.",
    intro:
      "From clinical symposium presentations to doctor workshops and consumer masterclasses, see how Altesse Soin empowers healthy skin across Egypt.",
    items: [
      {
        icon: "presentation",
        status: "upcoming",
        type: "Medical Congress",
        title: "Cairo Derma Congress",
        image: "/brand/cairo-derma-booth.webp",
        date: "Annual Symposium",
        location: "Cairo (InterContinental Citystars)",
        body: "Presenting clinical barrier restoration data for Centella Asiatica and Madecassoside protocols in post-laser recovery.",
      },
      {
        icon: "microscope",
        status: "upcoming",
        type: "Scientific Panel",
        title: "Sharm Derma Scientific Meeting",
        image: "/brand/community-workshop.webp",
        date: "Specialized Workshop",
        location: "Alexandria (Four Seasons)",
        body: "Dermatologist panel discussion on climate-adapted non-greasy formulations for Mediterranean and arid climates.",
      },
      {
        icon: "store",
        status: "upcoming",
        type: "Official Store",
        title: "Official Online Boutique",
        image: "/brand/retail-network.webp",
        date: "24/7 Online Access",
        location: "Nationwide Doorstep Delivery",
        body: "Fast, temperature-controlled delivery across all Egyptian governorates directly from our central medical warehouse.",
      },
      {
        icon: "sparkles",
        status: "upcoming",
        type: "Industry Insight",
        title: "MENA Beauty & Derma Trends",
        image: "/brand/mena-trends.webp",
        date: "Annual Review",
        location: "Egypt & Regional Markets",
        body: "Showcasing local clinical formulation excellence and consumer adoption of minimalist 3-step daily regimens.",
      },
    ],
  },

  /**
   * Distribution. Mirrors `mlay.distribution` in content/mlay.ts exactly in
   * shape — the two sections share <ChannelCard> — with the channels rewritten
   * for a skincare line: it reaches the market through dermatologists and
   * pharmacies first, where the MLAY line leads with mall counters.
   *
   * States only routes the deck already describes. No partner counts, no door
   * counts, no named malls.
   */
  distribution: {
    eyebrow: "Our Distribution Partners",
    headlineLead: "One brand, every counter",
    headlineAccent: "that reaches Egyptian skin.",
    intro:
      "Altesse Soin is TribuCare’s own line, so we take it the whole way — recommended in the clinic, stocked in the pharmacy, listed on the national marketplaces and sold direct — with one formulation team and one support team behind every unit.",
    channels: [
      {
        icon: "hospital",
        title: "Dermatologists & clinics",
        body: "Our medical team introduces the routines to dermatologists directly, so what a patient is told to use is what the pharmacy can hand them.",
      },
      {
        icon: "pill",
        title: "Pharmacy chains",
        body: "Major pharmacy groups carry the line, putting Altesse Soin on the shelf where customers already buy their skincare.",
      },
      {
        icon: "shopping-cart",
        title: "National marketplaces",
        body: "Official listings on the country’s major e-commerce platforms, so a routine ordered anywhere in Egypt arrives genuine and in date.",
      },
      {
        icon: "globe",
        title: "The TribuCare store",
        body: "Our own storefront carries the full catalogue direct, with the complete three-step rituals kept together rather than split across listings.",
      },
    ],
    channelsLabel: "Where you will find Altesse Soin",
    /**
     * The routes above, named. Deliberately NOT `mlayChannels` — those are the
     * MLAY line's flagship mall counters, and Altesse Soin does not reach the
     * market through them. This list restates the four channel cards above and
     * claims nothing they do not.
     */
    places: [
      "Dermatology clinics",
      "Major pharmacy chains",
      "Amazon",
      "Noon",
      "Jumia",
      "The TribuCare store",
    ],
    partner: {
      label: "Partner with us",
      body: "Pharmacy groups, clinic chains and e-commerce operators who want to carry Altesse Soin deal with the brand owner directly: official stock, one price list, clinical and merchandising support, and a team that answers for the formulation itself.",
      cta: { label: "Become a distribution partner", href: "/partner" },
    },
  },

  support: {
    eyebrow: "Our Formulation Standard",
    headline: "Clinical efficacy,",
    headlineAccent: "uncompromising safety.",
    body: "Every formula is developed under rigorous dermatological oversight to guarantee visible clinical improvements without irritation, comedogenicity, or harsh chemical additives.",
    capabilities: [
      {
        title: "100% Clean Pharmaceutical Actives",
        body: "Formulated with pure Centella Asiatica, Niacinamide, bio-identical Ceramides, and Multi-Hyaluronic Acid at validated dosages.",
      },
      {
        title: "Climate-Adapted Weightless Textures",
        body: "Engineered specifically for hot, sunny, and humid climates to absorb instantly without leaving a greasy film or clogging pores.",
      },
      {
        title: "Dermatologist Tested & Approved",
        body: "Tested on sensitive skin profiles to ensure zero irritation, hypoallergenic safety, and optimal barrier compatibility.",
      },
      {
        title: "Official Direct Boutique",
        body: "Guaranteed authentic, fresh formulation batches with dedicated customer support directly via altessesoin.com.",
      },
    ],
  },
} as const;
