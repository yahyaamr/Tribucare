/**
 * Dermatology solutions — page copy and product catalogue.
 *
 * SOURCING RULE (same as content/site.ts, and stricter here).
 *
 * Everything in this file that makes a claim about a device or an injectable
 * has to come from the manufacturer or from TribuCare. Nothing about a product
 * is written from inference: not a specification, not a wavelength, not a
 * treatment indication, not a clinical benefit, and above all not a
 * certification. These are regulated medical products, and an invented "FDA
 * cleared" or an invented indication is not a copy problem, it is a safety and
 * compliance problem.
 *
 * So every product below carries the taxonomy TribuCare supplied — name, brand,
 * category, business line — and nothing else. Each remaining field is empty and
 * every consumer of it renders conditionally, so an unfilled product shows a
 * short honest page rather than a confident wrong one. Fill the fields in and
 * the sections appear on their own; no component needs touching.
 *
 * The brand-level descriptions ARE traceable — they come from `brandGroups` in
 * content/site.ts, which is the company profile deck. Note that AMI and Kiusera
 * do not appear in that deck at all, so they carry no description and no logo
 * until TribuCare supplies them.
 */

import { professionals, verticals } from "@/content/site";

export type Certificate = {
  /** e.g. "FDA", "CE", "ISO 13485". Exactly as issued — never inferred. */
  label: string;
  /** Registration or clearance reference, if there is one to quote. */
  reference?: string;
};

export type Spec = { label: string; value: string };

export type Product = {
  slug: string;
  name: string;
  /** Manufacturer. Matches a key in `brandLogos` where a logo exists. */
  brand: string;
  /** The category heading this sits under, as TribuCare grouped them. */
  category: string;
  line: "devices" | "injectables";

  /** One line for the card. Empty until supplied. */
  summary: string;
  /** Opening paragraph on the product page. Empty until supplied. */
  overview: string;
  features: string[];
  specs: Spec[];
  /** What it is indicated for. Manufacturer wording only. */
  applications: string[];
  benefits: string[];
  certificates: Certificate[];

  /** Cut-out product shot, per the image rules in AGENTS.md. */
  image: string;
  imageAlt: string;
  /** Additional stills. */
  gallery: string[];
  /** Self-hosted file or empty. Poster is required whenever this is set. */
  video: string;
  videoPoster: string;
};

/** Everything unsupplied, in one place, so a new product starts honest. */
const blank = {
  summary: "",
  overview: "",
  features: [] as string[],
  specs: [] as Spec[],
  applications: [] as string[],
  benefits: [] as string[],
  certificates: [] as Certificate[],
  image: "",
  imageAlt: "",
  gallery: [] as string[],
  video: "",
  videoPoster: "",
};

export const products: Product[] = [
  /* ---- 01 / Professional Aesthetic & Dermatology Devices ---------------- */
  {
    ...blank,
    slug: "ami-rex-an-dual",
    name: "AMI REX-AN DUAL",
    brand: "AMI",
    category: "Laser Hair Reduction",
    line: "devices",
  },
  {
    ...blank,
    slug: "ids-tridi",
    name: "IDS Tridi",
    brand: "IDS",
    category: "Laser Hair Reduction",
    line: "devices",
  },
  {
    ...blank,
    slug: "bvlaser-fractional-co2",
    name: "BVLASER Fractional CO2",
    brand: "BV Laser",
    category: "Fractional CO2 Laser",
    line: "devices",
  },
  {
    ...blank,
    slug: "ami-mt-smart",
    name: "AMI MT-SMART",
    brand: "AMI",
    category: "Microneedling RF",
    line: "devices",
  },

  /* ---- 02 / Professional Aesthetic Injectables -------------------------- */
  {
    ...blank,
    slug: "rejuran-healer",
    name: "Rejuran Healer",
    brand: "Rejuran",
    category: "REJURAN PN",
    line: "injectables",
  },
  {
    ...blank,
    slug: "rejuran-s",
    name: "Rejuran S",
    brand: "Rejuran",
    category: "REJURAN PN",
    line: "injectables",
  },
  {
    ...blank,
    slug: "rejuran-i",
    name: "Rejuran I",
    brand: "Rejuran",
    category: "REJURAN PN",
    line: "injectables",
  },
  {
    ...blank,
    slug: "kiusera-p",
    name: "Kiusera P",
    brand: "Kiusera",
    category: "Poly-L-Lactic Acid",
    line: "injectables",
  },
  {
    ...blank,
    slug: "kiusera-l",
    name: "Kiusera L",
    brand: "Kiusera",
    category: "Poly-L-Lactic Acid",
    line: "injectables",
  },
];

/**
 * The two business lines, in the order TribuCare states them. Categories are
 * derived from the catalogue rather than restated, so a product can never
 * appear under a heading it does not belong to.
 */
export const productLines = [
  {
    id: "devices" as const,
    number: "01",
    label: "Professional Aesthetic & Dermatology Devices",
    blurb:
      "Energy-based systems for dermatologists, clinics and aesthetic centres, installed and supported by our own field engineers.",
  },
  {
    id: "injectables" as const,
    number: "02",
    label: "Professional Aesthetic Injectables",
    blurb:
      "Regenerative and volumising injectables supplied to licensed practitioners, with protocol training delivered alongside.",
  },
];

/** Category headings for a line, in catalogue order, with their products. */
export function categoriesFor(line: "devices" | "injectables") {
  const inLine = products.filter((p) => p.line === line);
  const order: string[] = [];
  for (const p of inLine) if (!order.includes(p.category)) order.push(p.category);
  return order.map((category) => ({
    category,
    items: inLine.filter((p) => p.category === category),
  }));
}

export function productBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

/* -------------------------------------------------------------------------
   Page copy. Structural framing only — it describes how TribuCare works, which
   the deck does cover, and makes no claim about any individual product.
   ------------------------------------------------------------------------- */

export const dermatology = {
  eyebrow: "Dermatology Solutions",
  headlineLead: "Technology for the",
  headlineAccent: "clinic.",
  /** Verbatim from `verticals[0].body` in content/site.ts. */
  intro:
    "As the exclusive agent in Egypt for globally recognised German, Italian and Korean brands, we deliver top-tier therapeutic and aesthetic technologies to dermatologists, clinics and aesthetic centres.",
  audience: "Dermatologists · Clinics · Aesthetic centres",

  /** Brands on this page. Keys match `brandLogos`; AMI and Kiusera have none
   *  yet and fall back to their name, which `BrandLogo` already handles. */
  brands: [
    "Zimmer Medical",
    "Rejuran",
    "beaumed",
    "IDS",
    "AGEX Beauty",
    "BV Laser",
  ],

  /**
   * Hero visual. Taken from the homepage's own Professional Dermatology card
   * rather than restated, so the section a visitor clicked from and the page
   * they land on show the same thing — and so replacing the shot in one place
   * changes both.
   */
  image: verticals[0].image,

  /** Hero promo video. Empty until supplied; the hero renders without it. */
  video: "",
  videoPoster: "",
  videoTitle: "TribuCare dermatology solutions",

  catalogue: {
    eyebrow: "Product Catalogue",
    headlineLead: "Two lines,",
    headlineAccent: "one support team.",
    intro:
      "Every system and every injectable below is backed by the same field engineers, trainers and clinical support that come with it.",
  },

  /** Reuses the deck's own support capabilities rather than restating them. */
  support: {
    eyebrow: professionals.eyebrow,
    headline: professionals.headline,
    headlineAccent: professionals.headlineAccent,
    body: professionals.body,
    capabilities: professionals.capabilities,
  },
} as const;

/* -------------------------------------------------------------------------
   Requests
   ------------------------------------------------------------------------- */

export const requestKinds = [
  {
    id: "demo" as const,
    label: "Request a demo",
    blurb: "See the system in your own clinic, run by our clinical trainer.",
    icon: "monitor-play",
  },
  {
    id: "quotation" as const,
    label: "Request a quotation",
    blurb: "Pricing, configuration and lead time for your practice.",
    icon: "file-text",
  },
  {
    id: "support" as const,
    label: "Request a technical support visit",
    blurb: "A field engineer on site for installation, service or calibration.",
    icon: "wrench",
  },
];

export type RequestKind = (typeof requestKinds)[number]["id"];
