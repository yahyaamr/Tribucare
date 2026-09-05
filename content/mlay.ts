/**
 * MLAY Home-Use Beauty Technology — data and product catalogue.
 * Sourced directly from TribuCare official distributor catalog and store listings.
 * Uses 100% authentic photography from official store CDNs.
 */

import type { BrandCollection } from "./collections";

export type { BrandCollection };

/**
 * The MLAY catalogue, as the collections the store actually sells it in.
 *
 * One card per device series plus one for accessories, mirroring the
 * `tribucare.com` menu exactly — the handles here are the ones its own
 * navigation links to. Each series collection holds the handset in every
 * colourway together with the precision lamps that fit it, so a reader who
 * lands there sees the device and its consumables in one place; the page no
 * longer has to carry a card per lamp to say so.
 */
export const mlayCollections: BrandCollection[] = [
  {
    slug: "t14-pro-series",
    brand: "MLAY",
    badge: "T14 Pro Series",
    name: "MLAY T14 Pro AI Smart IPL & Rejuvenation",
    summary:
      "Flagship system with 1,000,000 flashes, an AI smart skin tone sensor and continuous 5°C contact cooling. Four colourways, with the matching precision lamps.",
    store: "tribucare.com",
    image: "/brand/mlay/mlay-t14-pro-real.webp",
    url: "https://www.tribucare.com/collections/t14-pro-series",
  },
  {
    slug: "t14-series",
    brand: "MLAY",
    badge: "T14 Series",
    name: "MLAY T14A Ice-Cooling IPL Handset",
    summary:
      "High-speed 500,000-flash IPL with instant contact ice-cooling conduction and 5 energy levels. Five colourways, with the matching precision lamps.",
    store: "tribucare.com",
    image: "/brand/mlay/mlay-t14-black.webp",
    url: "https://www.tribucare.com/collections/mlay-t14-series",
  },
  {
    slug: "t10-series",
    brand: "MLAY",
    badge: "T10 Series",
    name: "MLAY T10A Precision Cooling Laser",
    summary:
      "Compact ergonomic handset with an integrated cold sapphire plate, made for precise handling around facial contours and sensitive body zones. In rose gold and black.",
    store: "tribucare.com",
    image: "/brand/mlay/mlay-t10-real.webp",
    url: "https://www.tribucare.com/collections/t10-series",
  },
  {
    slug: "t4-series",
    brand: "MLAY",
    badge: "T4 Series",
    name: "MLAY T4 Hair Removal with Ice-Cooling Touch",
    summary:
      "Painless hair removal with an instant-cooling ceramic window, a high-capacity quartz lamp and 5 adjustable power settings.",
    store: "tribucare.com",
    image: "/brand/mlay/mlay-t4-real.webp",
    url: "https://www.tribucare.com/collections/mlay-t4-series",
  },
  {
    slug: "t3-series",
    brand: "MLAY",
    badge: "T3 Series",
    name: "MLAY T3 3-in-1 Hair Removal & Acne Treatment",
    summary:
      "Home workstation with interchangeable lamp heads for hair removal, skin rejuvenation and acne clearance — the handset and all five cartridges together.",
    store: "tribucare.com",
    image: "/brand/mlay/mlay-t3-real.webp",
    url: "https://www.tribucare.com/collections/mlay-t3-series",
  },
  {
    slug: "accessories",
    brand: "MLAY",
    badge: "Accessories",
    name: "Replacement Lamps & Precision Lenses",
    summary:
      "Every replacement lamp and precision lens in one place — facial, bikini, underarm, beard, body, skin rejuvenation and acne clearance heads for T14 Pro, T14A and T3 handsets.",
    store: "tribucare.com",
    image: "/brand/mlay/mlay-t14-body-lamp.webp",
    url: "https://www.tribucare.com/collections/accessories",
  },
];

export const mlay = {
  eyebrow: "Home-Use Beauty Devices",
  headlineLead: "Salon-grade technology,",
  headlineAccent: "at home.",
  intro:
    "In exclusive partnership with MLAY, TribuCare brings clinical-performance IPL hair removal and skin rejuvenation devices into Egyptian homes — supported by official manufacturer warranty, dedicated clinical advisors, and premier retail presence.",
  audience: "Consumers · Retail · E-commerce · Flagship Malls",
  brands: ["MLAY"],
  image: {
    src: "/brand/laser-products.webp",
    alt: "MLAY home-use laser device held in two hands.",
    width: 1006,
    height: 1467,
  },

  /**
   * Hero seal. Says only what the page already says elsewhere — the exclusive
   * agency — with no appointment date, certificate number or issuing body,
   * none of which the deck carries.
   */
  seal: {
    arcTop: "OFFICIAL DISTRIBUTOR",
    arcBottom: "ARAB REPUBLIC OF EGYPT",
    mark: "MLAY",
    subline: "Exclusive Agent",
    /** Read out to assistive tech in place of the drawn rings. */
    ring: "Official distributor, Arab Republic of Egypt",
  },

  catalogue: {
    eyebrow: "Device Catalogue",
    headlineLead: "Proven technology,",
    headlineAccent: "engineered for comfort.",
    intro:
      "Every MLAY device combines clinical optical energy with advanced thermal dissipation and sapphire cooling — making salon-standard results achievable at home with zero downtime.",
  },

  retail: {
    eyebrow: "Premier Retail Presence",
    headlineLead: "Experience MLAY",
    headlineAccent: "in leading malls across Egypt.",
    intro:
      "Visit our dedicated flagship displays in Egypt's premier shopping destinations to experience live device demonstrations and receive personalised guidance from trained beauty specialists.",
    items: [
      {
        icon: "store",
        status: "upcoming",
        type: "Flagship Mall",
        title: "City Stars Mall Display",
        image: "/brand/retail-network.webp",
        date: "Open Daily 10 AM – 11 PM",
        location: "Cairo (Phase 1, Level 3)",
        body: "Explore the complete MLAY lineup with hands-on live demonstrations, cooling touch trials, and instant official warranty registration.",
      },
      {
        icon: "sparkles",
        status: "upcoming",
        type: "Flagship Mall",
        title: "Mall of Arabia Beauty Hub",
        image: "/brand/community-workshop.webp",
        date: "Open Daily 10 AM – 11 PM",
        location: "Giza (Gate 17, Ground Floor)",
        body: "Try our latest T14 Pro and T16 fast-flash devices in person with dedicated beauty advisors to determine your optimal energy routine.",
      },
      {
        icon: "store",
        status: "upcoming",
        type: "Official Store",
        title: "Mall of Tanta Flagship",
        image: "/brand/mena-trends.webp",
        date: "Open Daily 10 AM – 11 PM",
        location: "Tanta (Main Boulevard)",
        body: "Serving the Nile Delta with authentic MLAY devices, replacement lamp cartridges, and direct local technical support.",
      },
      {
        icon: "store",
        status: "upcoming",
        type: "Official Store",
        title: "San Stefano Grand Plaza",
        image: "/brand/cairo-derma-booth.webp",
        date: "Open Daily 10 AM – 11 PM",
        location: "Alexandria (Level 2)",
        body: "Providing full device collections, replacement lamp cartridges, and expert guidance for seaside skin protection and treatment.",
      },
    ],
  },

  /**
   * Distribution. Names only the channels the deck already states — the four
   * flagship malls and the marketplaces and pharmacy chains listed in
   * `mlayChannels` in content/site.ts, which the section reads directly rather
   * than restating here. No partner counts, no store numbers, no named chains.
   */
  distribution: {
    eyebrow: "Our Distribution Partners",
    headlineLead: "One agent behind",
    headlineAccent: "every channel in Egypt.",
    intro:
      "As MLAY’s exclusive agent, TribuCare runs the brand end to end — flagship mall counters, the national marketplaces, pharmacy chains and our own store — with one warranty and one support team behind every unit sold.",
    channels: [
      {
        icon: "store",
        title: "Flagship mall counters",
        body: "Dedicated MLAY displays in Egypt’s leading malls, staffed by trained beauty advisors who run live demonstrations.",
      },
      {
        icon: "shopping-cart",
        title: "National marketplaces",
        body: "Official listings on the country’s major e-commerce platforms, so a device ordered anywhere in Egypt arrives genuine.",
      },
      {
        icon: "pill",
        title: "Pharmacy chains",
        body: "Major pharmacy groups carry the line, putting MLAY on the shelf where customers already buy their skincare.",
      },
      {
        icon: "globe",
        title: "The TribuCare store",
        body: "Our own storefront carries the full catalogue direct, on the same warranty and the same local technical service.",
      },
    ],
    channelsLabel: "Where you will find MLAY",
    partner: {
      label: "Partner with us",
      body: "Retailers, pharmacy groups and e-commerce operators who want to carry MLAY deal with a single Egyptian agent: official stock, one price list, marketing and merchandising support, and a local service centre standing behind every unit you sell.",
      cta: { label: "Become a distribution partner", href: "/partner" },
    },
  },

  support: {
    eyebrow: "The TribuCare Guarantee",
    headline: "Complete support,",
    headlineAccent: "from unboxing to lasting results.",
    body: "Purchasing an official MLAY device through TribuCare guarantees genuine manufacturer hardware, certified safety standards, and dedicated local customer care throughout your journey.",
    capabilities: [
      {
        title: "Official 1-Year Warranty",
        body: "Full hardware replacement and repair coverage handled locally through TribuCare's authorized Cairo technical service centre.",
      },
      {
        title: "Dedicated Protocol Advisors",
        body: "Direct WhatsApp consultation with trained beauty advisors to guide energy selection, session schedules, and treatment safety.",
      },
      {
        title: "100% Genuine Replacement Parts",
        body: "Continuous stock of authentic replacement lamps, precision lenses, and power adapters ready for immediate dispatch.",
      },
      {
        title: "Express Nationwide Delivery",
        body: "Secure, tracked doorstep delivery across all Egyptian governorates within 24 to 48 hours with cash-on-delivery options.",
      },
    ],
  },
} as const;
