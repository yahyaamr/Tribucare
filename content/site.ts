/**
 * Single source of truth for all landing-page copy.
 *
 * SOURCING RULE: every factual claim below is traceable to the TribuCare
 * company-profile deck. Nothing here is invented — no certifications, awards,
 * customer counts, social accounts, or partnerships beyond what the deck states.
 * Anything the deck does not cover is left empty and rendered conditionally.
 */

export const company = {
  name: "TribuCare",
  legalParent: "Mondial Investissement Corporation (MIC)",
  tagline: "Advancing beauty. Empowering care.",
  description:
    "TribuCare is a healthcare and beauty company operating under Mondial Investissement Corporation. We connect global dermatology technologies, home-use beauty devices and clinically inspired skincare with professionals and consumers across Egypt and the MENA region.",
} as const;

/**
 * `icon` keys map to lucide components in the header, same as `coreValues`.
 * The header collapses inactive links to the icon alone, and the mobile menu
 * sets the same mark beside each label, so every one has to carry the meaning
 * of its label on its own: an atom for expertise — the science the three
 * verticals share, and a mark none of their own icons (stethoscope, zap,
 * droplet) in its drop-down repeat — a gem for the values the company holds
 * to, and the handshake this site already uses wherever it talks about
 * partnership.
 */
export const nav = [
  { label: "Home", href: "/", icon: "home" },
  {
    label: "Our Expertise",
    href: "/#expertise",
    icon: "atom",
    /**
     * The desktop pill carries a drop-down straight to the three verticals'
     * own pages. Nothing here is new wording: each `label` is that vertical's
     * own `label` in `verticals` below, and each `detail` is its `audience`
     * line. The drop-down names the three fields TribuCare works in rather
     * than the brands inside them, which is what the footer column and the
     * homepage's Expertise cards do too. `icon` keys resolve in the header the
     * same way the item's own does.
     */
    menu: [
      {
        label: "Professional Dermatology Solutions",
        detail: "Dermatologists · Clinics · Aesthetic centres",
        href: "/dermatology",
        icon: "stethoscope",
      },
      {
        label: "Home-Use Beauty Devices",
        detail: "Consumers · Retail · E-commerce",
        href: "/mlay",
        icon: "zap",
      },
      {
        label: "Medicated Skincare Products",
        detail: "Consumers · Pharmacy · Dermatology",
        href: "/altesse-soin",
        icon: "droplet",
      },
    ],
  },
  { label: "Core Values", href: "/#core-values", icon: "gem" },
  { label: "Events & News", href: "/events", icon: "calendar" },
  { label: "Blogs and Insights", href: "/blogs", icon: "scroll-text" },
  { label: "About", href: "/about", icon: "users" },
] as const;

export const hero = {
  eyebrow: "Healthcare & Beauty Group · Egypt & MENA",
  headlineLead: "Advancing beauty.",
  headlineAccent: "Empowering care.",
  subhead:
    "TribuCare connects trusted global technologies, professional dermatology solutions, beauty devices and clinically inspired skincare with consumers and professionals across Egypt and the MENA region.",
  primaryCta: { label: "Partner With Us", href: "/partner" },
  secondaryCta: { label: "About TribuCare", href: "/about" },
} as const;

/**
 * Mission & Vision. Unlike most of this file, this copy comes from a finished
 * section design supplied by the client rather than the company-profile deck —
 * it is approved wording, so reproduce it verbatim.
 *
 * `headline` splits into lead / accent / tail because the accent lands mid-
 * sentence in the vision and at the end in the mission.
 */
export const missionVision = {
  mission: {
    eyebrow: "Our Mission",
    headline: {
      lead: "Empowering confidence through innovative ",
      accent: "beauty technology.",
      tail: "",
    },
    body: "We partner with global innovators like MLAY to bring safe, effective, and easy-to-use beauty devices to every home in Egypt. Our mission is to make professional-grade beauty solutions accessible to all, enhancing self-care routines and everyday confidence.",
    values: [
      {
        icon: "target",
        title: "Purpose-Driven",
        body: "We exist to make advanced beauty technology simple, safe, and accessible for everyone.",
      },
      {
        icon: "users",
        title: "People First",
        body: "Our customers are at the heart of everything we do. Their confidence is our priority.",
      },
    ],
  },
  vision: {
    eyebrow: "Our Vision",
    headline: {
      lead: "Leading the future of ",
      accent: "beauty wellness",
      tail: " in every home.",
    },
    body: "We envision a future where cutting-edge beauty technology becomes a natural part of everyday life—helping people look and feel their best, anytime, anywhere. We aim to be Egypt's most trusted beauty tech partner.",
    values: [
      {
        icon: "gem",
        title: "Excellence",
        body: "We are committed to the highest standards in quality, innovation, and customer experience.",
      },
      {
        icon: "sprout",
        title: "Sustainable Impact",
        body: "We strive to create lasting value for our community and the beauty industry in Egypt.",
      },
    ],
  },
  /**
   * Centre visual, kept as two separate layers so each can be animated on its
   * own later. Both were exported from one shared crop box and therefore have
   * identical dimensions — stack them at the same size and origin and they
   * register exactly. Re-crop one without the other and the composite breaks.
   */
  media: {
    backdrop: { src: "/brand/mission-backdrop.webp" },
    figure: {
      src: "/brand/mission-figure.webp",
      alt: "A TribuCare team member in a pale blazer, arms folded, wearing the shield mark as a lapel pin.",
    },
    width: 1036,
    height: 1197,
  },
} as const;

export const verticals = [
  {
    number: "01",
    id: "professional",
    label: "Professional Dermatology Solutions",
    headline: "Technology for the clinic.",
    body: "As the exclusive agent in Egypt for globally recognised German, Italian and Korean brands, we deliver top-tier therapeutic and aesthetic technologies to dermatologists, clinics and aesthetic centres.",
    audience: "Dermatologists · Clinics · Aesthetic centres",
    /** The one list of this vertical's brands. Its page (/dermatology) reads
     *  it rather than keeping a copy, so the card and the page cannot drift —
     *  add or drop a brand here and both move. Keys match `brandLogos`. */
    brands: ["Zimmer Medical", "Rejuran", "beaumed", "AGEX Beauty", "BV Laser", "AMI"],
    cta: { label: "Dermatology solutions", href: "/dermatology" },
    image: {
      src: "/brand/derma-solutions-e10bb9cd.webp",
      alt: "A model in a cream suit leaning on an oversized Kiusera PLLA vial, beside a clinic laser system.",
      width: 1121,
      height: 1266,
      // Centred and full-width rather than parked in the corner. The file is
      // cropped just above the shoes, so the cut lands on the card's edge.
      // The box is shifted down by the 8% the others bleed off the top, plus
      // 1rem, so the whole head shows with a little air above it; the same
      // amount is clipped off the foot by the panel.
      frameClassName: "top-4 -bottom-[calc(8%+1rem)]",
      className: "object-bottom px-0 sm:px-0 lg:px-0",
    },
  },
  {
    number: "02",
    id: "devices",
    label: "Home-Use Beauty Devices",
    headline: "Salon-grade technology at home.",
    body: "In partnership with MLAY, TribuCare brings high-performance beauty tech to the Egyptian market — empowering consumers with salon-grade skincare and hair care, supported by flagship retail and nationwide e-commerce.",
    audience: "Consumers · Retail · E-commerce",
    /** Read by /mlay too — see the first vertical. */
    brands: ["MLAY"],
    cta: { label: "Discover MLAY", href: "/mlay" },
    image: {
      src: "/brand/laser-products.webp",
      alt: "An MLAY home-use laser hair-removal device, held in two hands.",
      width: 1006,
      height: 1467,
    },
  },
  {
    number: "03",
    id: "skincare",
    label: "Medicated Skincare Products",
    headline: "Formulated with dermatological science.",
    body: "Represented by our flagship brand Altesse Soin, we offer clinically inspired formulations that fuse advanced dermatological science with premium active ingredients.",
    audience: "Consumers · Pharmacy · Dermatology",
    /** Read by /altesse-soin too — see the first vertical. */
    brands: ["Altesse Soin"],
    cta: { label: "Discover Altesse Soin", href: "/altesse-soin" },
    image: {
      src: "/brand/altesse-soin-cutout.webp",
      alt: "Altesse Soin Sérénité whitening and hair-delaying deodorant, held in two hands with the cap lifted.",
      width: 855,
      height: 1526,
    },
  },
] as const;

/**
 * Partner and own-brand logo files, keyed by the exact `name` used in
 * `brandGroups` and `verticals[].brands` so both can look one up without
 * duplicating the brand list.
 *
 * Each was supplied on a white background; the stored WebP has that background
 * keyed out, so they sit on any light surface. Intrinsic dimensions are recorded
 * to keep next/image from guessing — render them at a fixed height and let the
 * width follow, since the aspect ratios run from 1.4:1 (IDS) to 7:1 (Rejuran).
 *
 * `light` is only present where a mark has to sit on a dark ground. Altesse Soin
 * is pure monochrome black, so its variant is the same artwork knocked out white
 * rather than a recolour.
 */
export const brandLogos: Record<
  string,
  { src: string; width: number; height: number; light?: string }
> = {
  "Zimmer Medical": {
    src: "/brand/logos/zimmer-ba4144a7.webp",
    width: 551,
    height: 132,
  },
  Rejuran: { src: "/brand/logos/rejuran-c8cf46fa.webp", width: 392, height: 56 },
  beaumed: { src: "/brand/logos/beaumed-044d29dd.webp", width: 735, height: 132 },
  IDS: { src: "/brand/logos/ids.webp", width: 185, height: 128 },
  // Supplied white; `src` is the same artwork recoloured black for the white
  // surfaces it mostly sits on, and the supplied white file is its `light`.
  "AGEX Beauty": {
    src: "/brand/logos/agex-0866fe37.webp",
    width: 305,
    height: 132,
    light: "/brand/logos/agex-light-60246ad7.webp",
  },
  "BV Laser": { src: "/brand/logos/bv-laser-c8d1f1a1.webp", width: 199, height: 41 },
  AMI: { src: "/brand/logos/ami-782cd02e.webp", width: 534, height: 343 },
  Kiusera: { src: "/brand/logos/kiusera.webp", width: 450, height: 86 },
  MLAY: { src: "/brand/logos/mlay.webp", width: 705, height: 118 },
  "Altesse Soin": {
    src: "/brand/logos/altesse-soin.webp",
    width: 187,
    height: 43,
    light: "/brand/logos/altesse-soin-light.webp",
  },
};

export const brandGroups = [
  {
    id: "professional",
    /** Left panel of the group. Empty renders the site placeholder — see
     *  `ImageFallback`. Supply a .webp and describe it in `alt`. */
    image: { src: "/brand/brands-dermatology.webp", alt: "Rejuran Skin Barrier sun stick and sunscreen tube on a teal ground, beside a textured exfoliant swatch and a smooth cream swatch." },
    kicker: "01 / Professional Dermatology",
    title: "Represented in Egypt",
    note: "TribuCare is the exclusive agent in Egypt for these brands.",
    items: [
      { name: "Zimmer Medical", origin: "Germany", role: "Aesthetic and medical technology." },
      {
        name: "Rejuran",
        origin: "South Korea",
        role: "Pioneering PN injectables for skin regeneration and anti-ageing, with clinically proven results.",
      },
      {
        name: "beaumed",
        origin: "South Korea",
        role: "Professional injectable solutions for skin rejuvenation, contouring and medical aesthetics.",
      },
      { name: "IDS", origin: "South Korea", role: "Aesthetic and medical solutions." },
      { name: "AGEX Beauty", origin: "Italy", role: "Aesthetic and medical solutions." },
      { name: "BV Laser", origin: "China", role: "Laser and light-based aesthetic systems." },
    ],
  },
  {
    id: "devices",
    image: { src: "/brand/brands-mlay.webp", alt: "A rose-gold MLAY handheld laser hair-removal device resting on rope netting over rippling blue water, with seashells and a starfish around it." },
    kicker: "02 / Home Beauty Technology",
    title: "Distributed nationwide",
    note: "TribuCare is the exclusive official distributor of MLAY in Egypt.",
    items: [
      {
        name: "MLAY",
        origin: "China",
        role: "The leading Chinese brand in home-use laser hair-removal devices.",
      },
    ],
  },
  {
    id: "skincare",
    image: { src: "/brand/brands-altesse.webp", alt: "Five altesse roll-on deodorants — Aurora, Délice, Sérénité, Félicité and Belle Vie — each tied with a pale blue ribbon on a light blue ground." },
    kicker: "03 / Medicated Skincare",
    title: "Our own brand",
    note: "Altesse Soin is TribuCare's flagship skincare brand.",
    items: [
      {
        name: "Altesse Soin",
        origin: "TribuCare",
        role: "Clinically inspired formulations combining dermatological science with premium active ingredients.",
      },
    ],
  },
] as const;

export const altesseLines = [
  { name: "Cica", role: "Calming & soothing routine" },
  { name: "Lustré", role: "Whitening routine" },
  { name: "Réservoir", role: "Hydrating routine" },
  { name: "Sunissime", role: "Sun care" },
  { name: "Deodorants", role: "Whitening & hair delaying" },
] as const;

export const mlayChannels = {
  flagship: ["City Stars", "Mall of Arabia", "Mall of Tanta", "San Stefano Mall"],
  retail: ["Amazon", "Noon", "Jumia", "Major pharmacy chains"],
} as const;

/**
 * Core values, carried over verbatim from TribuCare's previous website — the
 * client confirmed the wording is current, so it supersedes the deck-derived
 * "why partner with us" pillars that used to sit here.
 *
 * These now render as the horizontal card rail beneath the reach figures: the
 * numbers say how big the operation is, the values say how it is run, and the
 * two read as one argument rather than two sections making it separately.
 */
export const coreValues = {
  eyebrow: "Core Values & Support",
  headlineLead: "Core values &",
  headlineAccent: "professional support.",
  intro: "The principles that guide everything we do, and how we empower the physicians and dermatologists who use our technologies.",
  /** `icon` keys map to lucide components in the Core Values section, chosen to
   *  match the marks the previous site used for each value. */
  items: [
    {
      icon: "heart",
      title: "Customer Obsession",
      body: "Staying in sync with trends and evolving consumer needs.",
    },
    {
      icon: "handshake",
      title: "Ethical Commitment",
      body: "Reflected in both product development and responsible marketing.",
    },
    {
      icon: "lightbulb",
      title: "Creative Innovation",
      body: "Driving novelty in design and promotional strategies.",
    },
    {
      icon: "target",
      title: "Lean Efficiency",
      body: "Optimizing costs and managing complex multi-channel operations wisely.",
    },
    {
      icon: "users",
      title: "Collaborative Spirit",
      body: "Fostering teamwork across all departments.",
    },
    {
      icon: "zap",
      title: "Agility & Responsiveness",
      body: "Adapting quickly to growth and market shifts.",
    },
    {
      icon: "award",
      title: "Professional Excellence",
      body: "Achieved through continuous learning and smart process refinement.",
    },
    {
      icon: "shield-check",
      title: "Trust & Integrity",
      body: "Building long-term confidence through reliable partnerships.",
    },
    {
      icon: "graduation-cap",
      title: "Continuous Medical Education",
      body: "Ongoing programmes that keep practitioners current with the technologies and protocols they work with.",
    },
    {
      icon: "user-check",
      title: "Hands-on Training",
      body: "Practical, device-level training delivered by specialised trainers rather than sales staff.",
    },
    {
      icon: "life-buoy",
      title: "Technical & After-Sales Support",
      body: "A dedicated team maintaining uptime and performance across installed systems.",
    },
    {
      icon: "book-open",
      title: "Product Education",
      body: "Clear clinical and product information for the teams recommending and applying our brands.",
    },
  ],
} as const;

/**
 * Events & News.
 *
 * ⚠️ PLACEHOLDER CONTENT — every entry below is invented to make the layout
 * legible while the real listings are gathered. This is the one deliberate
 * exception to the sourcing rule at the top of this file. Each item carries
 * `placeholder: true` so the whole set can be found and swapped in one pass;
 * delete the flag as each real event lands, and delete this notice once none
 * remain.
 *
 * `icon` keys map to lucide components in the Events section.
 * `status` drives the badge tone: "upcoming" reads warm, "past" reads quiet.
 */
export const events = {
  eyebrow: "Events & News",
  headlineLead: "Where TribuCare",
  headlineAccent: "shows up.",
  intro:
    "Congresses, hands-on training days, brand launches and regional exhibitions — the calendar behind the education and support our partners rely on.",
  cta: { label: "See all events", href: "/events" },
  items: [
    {
      placeholder: true,
      icon: "graduation-cap",
      status: "upcoming",
      type: "Training Day",
      title: "Rejuran injection protocol workshop",
      image: "/brand/blog/polynucleotide-boosters.webp",
      date: "September 2026",
      location: "Cairo, Egypt",
      body: "A hands-on session for dermatologists covering patient selection, technique and post-treatment care across the Rejuran line.",
    },
    {
      placeholder: true,
      icon: "presentation",
      status: "upcoming",
      type: "Congress",
      title: "MENA Dermatology & Aesthetics Congress",
      image: "/brand/blog/aesthetic-trends-mena.webp",
      date: "October 2026",
      location: "Dubai, UAE",
      body: "TribuCare exhibits alongside its device partners, with live demonstrations of the professional laser and body-contouring platforms.",
    },
    {
      placeholder: true,
      icon: "sparkles",
      status: "upcoming",
      type: "Brand Launch",
      title: "Altesse Soin seasonal line launch",
      image: "/brand/blog/cica-skincare.webp",
      date: "November 2026",
      location: "Mall of Arabia, Giza",
      body: "In-store launch event introducing the newest medicated skincare range to consumers and pharmacy partners.",
    },
    {
      placeholder: true,
      icon: "store",
      status: "past",
      type: "Retail",
      title: "MLAY flagship opening — San Stefano",
      image: "/brand/blog/home-beauty-device.webp",
      date: "May 2026",
      location: "Alexandria, Egypt",
      body: "The fourth flagship branch opened with live device demonstrations and consultations across the full home-use beauty range.",
    },
    {
      placeholder: true,
      icon: "microscope",
      status: "past",
      type: "Symposium",
      title: "Clinical evidence symposium",
      image: "/brand/blog/zimmer-cryotherapy.webp",
      date: "March 2026",
      location: "Cairo, Egypt",
      body: "A physician-led review of published outcomes for the technologies TribuCare represents across its dermatology vertical.",
    },
    {
      placeholder: true,
      icon: "handshake",
      status: "past",
      type: "Partnership",
      title: "Distribution agreement announced",
      image: "/brand/blog/medical-education.webp",
      date: "January 2026",
      location: "Egypt & MENA",
      body: "TribuCare extended its regional distribution footprint with a new European device manufacturer joining the portfolio.",
    },
  ],
} as const;

/**
 * Filter chips on /events, derived from the events themselves rather than
 * restated — a new `type` above shows up as a filter with no second edit, and
 * a type that stops being used stops being offered.
 */
export const eventCategories = [
  "All Events",
  ...Array.from(new Set(events.items.map((event) => event.type))),
];

export const professionals = {
  eyebrow: "Professional Network",
  headline: "We don't just distribute products.",
  headlineAccent: "We support the professionals who use them.",
  body: "Our relationship with a clinic does not end at delivery. TribuCare works alongside physicians and dermatologists with structured education, hands-on training and technical support that keeps advanced technology performing in practice.",
  capabilities: [
    {
      title: "Continuous medical education",
      body: "Ongoing programmes that keep practitioners current with the technologies and protocols they work with.",
    },
    {
      title: "Hands-on training",
      body: "Practical, device-level training delivered by specialised trainers rather than sales staff.",
    },
    {
      title: "Technical & after-sales support",
      body: "A dedicated team maintaining uptime and performance across installed systems.",
    },
    {
      title: "Product education",
      body: "Clear clinical and product information for the teams recommending and applying our brands.",
    },
  ],
} as const;

export const reach = [
  {
    value: 40,
    prefix: "",
    suffix: "+",
    label: "Years of group experience",
    detail: "Through MIC, with roots in healthcare, chemicals, printing and packaging.",
  },
  {
    value: 100,
    prefix: "",
    suffix: "+",
    label: "Professionals",
    detail: "Across marketing, sales, technical support, medical training, e-commerce and operations.",
  },
  {
    value: 100,
    prefix: "EGP ",
    suffix: "M+",
    label: "Annual revenue, MLAY line",
    detail: "Generated by the home-use beauty device business in Egypt.",
  },
  {
    value: 8,
    prefix: "",
    suffix: "",
    label: "Brands represented",
    detail: "German, Italian, Korean and Chinese partners, plus our own flagship skincare brand.",
  },
] as const;

export const teams = [
  {
    id: "marketing",
    name: "Digital Marketing Team",
    role: "Driving our online presence and brand growth.",
    badge: "Brand Growth",
    icon: "Megaphone",
    highlight: "Digital Strategy & Campaign Execution",
  },
  {
    id: "sales",
    name: "Sales Force",
    role: "Covering all regions of Egypt with a strong field presence.",
    badge: "Nationwide Coverage",
    icon: "TrendingUp",
    highlight: "Clinics, Pharmacies & Retail Distribution",
  },
  {
    id: "support",
    name: "Technical Support Team",
    role: "Ensuring after-sales service and customer satisfaction.",
    badge: "After-Sales Care",
    icon: "Wrench",
    highlight: "Device Calibration & Technical Maintenance",
  },
  {
    id: "training",
    name: "Medical Training Team",
    role: "Specialized experts who continuously train doctors on device usage and injectables.",
    badge: "Clinical Education",
    icon: "Stethoscope",
    highlight: "Physician Certification & Protocols",
  },
  {
    id: "ecommerce",
    name: "E-commerce Team",
    role: "Managing online sales channels & digital partnerships.",
    badge: "Digital Channels",
    icon: "ShoppingBag",
    highlight: "D2C Platforms & Marketplace Growth",
  },
  {
    id: "operations",
    name: "Operations Team",
    role: "Overseeing logistics, supply chain, and business operations.",
    badge: "Supply Chain",
    icon: "Truck",
    highlight: "End-to-End Fulfillment & Warehousing",
  },
] as const;

/** Placeholder copy — replace with the questions the commercial team actually
 *  fields before launch. */
export const faq = {
  eyebrow: "Frequently Asked",
  headlineLead: "Questions we hear",
  headlineAccent: "from our partners.",
  intro:
    "Short answers on distribution, registration, training, and after-sales support. Can't find what you need? Our team replies within two working days.",
  cta: { label: "Talk to our team", href: "/partner" },
  items: [
    {
      q: "Which markets does TribuCare cover?",
      a: "We operate as an exclusive agent across Egypt, with active distribution and registration partnerships throughout the wider MENA region.",
    },
    {
      q: "How do you support brands entering the Egyptian market?",
      a: "We handle regulatory registration, market positioning, commercial launch, and ongoing channel management — from clinics and pharmacies through to e-commerce.",
    },
    {
      q: "Do you provide training for clinics and physicians?",
      a: "Yes. Our medical education team runs certification programmes, hands-on device protocols, and continuing support for every technology we represent.",
    },
    {
      q: "What after-sales service do you offer on devices?",
      a: "Every device is backed by our technical support team, covering installation, calibration, spare parts, and preventive maintenance nationwide.",
    },
    {
      q: "Can I stock TribuCare brands in my pharmacy or retail chain?",
      a: "We work with pharmacy groups, retail chains, and distributors. Reach out with your coverage and we will map the portfolio that fits your customers.",
    },
    {
      q: "How long does product registration usually take?",
      a: "Timelines vary by category and dossier readiness. Our regulatory team scopes a realistic schedule during the first assessment call.",
    },
  ],
} as const;

/**
 * Success partners — a logo strip near the foot of the homepage and of each
 * vertical's page (`<SuccessPartners page>`). The header is shared; each page
 * has its own list of names, and an empty list renders no section at all.
 *
 * Names key into `partnerLogos` below, the same way `brandLogos` works for the
 * brands TribuCare represents. A partner is not a represented brand, so the
 * two registries stay apart. A name with no registered mark renders as text.
 */
export const successPartners: {
  eyebrow: string;
  headlineLead: string;
  headlineAccent: string;
  intro: string;
  lists: Record<"home" | "dermatology" | "mlay" | "altesse", readonly string[]>;
} = {
  eyebrow: "Success Partners",
  headlineLead: "Growing together",
  headlineAccent: "with the partners we trust.",
  intro: "The organisations TribuCare works alongside.",
  lists: {
    home: [
      "Khalifa Pharmacies",
      "El Khabiry Pharmacy",
      "Source Beauty",
      "Myli",
      "Misr Pharmacies",
      "Amazon",
      "B.TECH",
      "Belbaa Pharmacies",
      "Nour Pharmacies",
      "noon",
      "Raya",
      "El Ezaby Pharmacy",
      "El Tayeby Pharmacies",
      "El Beisy Pharmacies",
      "Dao Derma Skin Clinic",
      "International Medical Center",
      "Palestinian Red Crescent Society",
      "Scar Clinic",
      "ZO Skin Centre",
    ],
    dermatology: [
      "Dao Derma Skin Clinic",
      "International Medical Center",
      "Palestinian Red Crescent Society",
      "Scar Clinic",
      "ZO Skin Centre",
      "Kobri El Kobba Medical Complex",
    ],
    mlay: [],
    altesse: [],
  },
};

/** Partner marks, keyed by name. Explicit width/height, rendered at a shared
 *  height — the brand-mark rule. Taken from the Success Partners strip on
 *  tribucare.com (the Shopify store), with the white ground around each mark
 *  cut to transparent so none reads as a box on the section's tint.
 *  `scale` enlarges a mark that reads small at the shared height (the round
 *  seals). */
export const partnerLogos: Record<
  string,
  { src: string; width: number; height: number; scale?: number }
> = {
  "Khalifa Pharmacies": { src: "/brand/partners/khalifa-2b73e734.webp", width: 421, height: 132 },
  "El Khabiry Pharmacy": { src: "/brand/partners/el-khabiry-882ba2d6.webp", width: 200, height: 132 },
  "Source Beauty": { src: "/brand/partners/source-beauty-871d6682.webp", width: 423, height: 132 },
  "Myli": { src: "/brand/partners/myli-de74149d.webp", width: 165, height: 83 },
  "Misr Pharmacies": { src: "/brand/partners/misr-pharmacies-b0d676e7.webp", width: 430, height: 132 },
  "Amazon": { src: "/brand/partners/amazon-902a30fd.webp", width: 393, height: 132 },
  "B.TECH": { src: "/brand/partners/btech-be8f54bc.webp", width: 308, height: 54, scale: 0.85 },
  "Belbaa Pharmacies": { src: "/brand/partners/belbaa-86d6c915.webp", width: 163, height: 132 },
  "Nour Pharmacies": { src: "/brand/partners/nour-aba0e594.webp", width: 149, height: 132 },
  "noon": { src: "/brand/partners/noon-91c2f3d0.webp", width: 300, height: 113 },
  "Raya": { src: "/brand/partners/raya-f5f43472.webp", width: 351, height: 95, scale: 0.85 },
  "El Ezaby Pharmacy": { src: "/brand/partners/el-ezaby-55481f95.webp", width: 381, height: 132 },
  "El Tayeby Pharmacies": { src: "/brand/partners/el-tayeby-8a645fcf.webp", width: 350, height: 132 },
  "El Beisy Pharmacies": { src: "/brand/partners/el-beisy-f49ed12b.webp", width: 284, height: 132 },
  "Dao Derma Skin Clinic": { src: "/brand/partners/dao-derma-6fab8846.webp", width: 231, height: 132 },
  "International Medical Center": { src: "/brand/partners/international-medical-center-694c0f98.webp", width: 123, height: 132, scale: 1.43 },
  "Palestinian Red Crescent Society": { src: "/brand/partners/palestinian-red-crescent-89efb8c6.webp", width: 131, height: 132, scale: 1.3 },
  "Scar Clinic": { src: "/brand/partners/scar-clinic-53c40eab.webp", width: 269, height: 132 },
  "ZO Skin Centre": { src: "/brand/partners/zo-skin-centre-ebc0f049.webp", width: 1036, height: 93 },
  "Kobri El Kobba Medical Complex": { src: "/brand/partners/kobri-el-kobba-medical-complex-aa15dc11.webp", width: 140, height: 132, scale: 1.3 },
};

export const partner = {
  eyebrow: "Partnerships",
  headline: "Let's build what's next in beauty and healthcare.",
  body: "Whether you are a global brand looking for a regional partner, a clinic seeking advanced technology, or a distributor building a portfolio — we should talk.",
  audiences: [
    "Global brand partners",
    "Dermatologists & physicians",
    "Clinics & aesthetic centres",
    "Retail partners",
    "Distributors",
  ],
  primaryCta: { label: "Partner With Us", href: "/partner" },
  secondaryCta: { label: "About TribuCare", href: "/about" },
  /**
   * The /partner hero's visual. Not used by the homepage's Partner section,
   * which is centred type on a dark ground and carries no figure.
   *
   * Same two-layer construction as `missionVision.media`, and deliberately the
   * same shield backdrop file: the figure was composited onto that image's
   * 1036×1197 crop box, so `object-contain` resolves both to one size and
   * origin and they register exactly. Re-export the figure at any other
   * dimensions and it slides out of the shield.
   */
  media: {
    backdrop: { src: "/brand/mission-backdrop.webp" },
    figure: {
      src: "/brand/partners-figure.webp",
      alt: "Two professionals in business dress shaking hands, one holding a laptop.",
    },
    width: 1036,
    height: 1197,
  },
} as const;

/**
 * TODO — supply real values before launch.
 * The company profile provided did not include a contact slide, so nothing is
 * invented here. Each field renders only when filled in.
 */
/**
 * The four figures across the top of /partner. Moved out of the route file for
 * the same reason as the pillars below: copy in a component cannot be
 * translated.
 */
export const partnerStats = [
  {
    kicker: "MIC Heritage",
    kickerTone: "text-signal-600",
    value: "40+ Years",
    detail: "Group legacy in healthcare & industrial investments.",
  },
  {
    kicker: "Workforce",
    kickerTone: "text-brand-600",
    value: "100+ Pros",
    detail: "Across 6 specialised divisions nationwide.",
  },
  {
    kicker: "Field Presence",
    kickerTone: "text-signal-600",
    value: "35+ Sales Reps",
    detail: "Full coverage across all governorates of Egypt.",
  },
  {
    kicker: "Exclusive Agency",
    kickerTone: "text-brand-600",
    value: "8 Global Brands",
    detail: "German, Italian, Korean & Chinese leaders.",
  },
] as const;

/**
 * Partnership pillars, one per audience on /partner.
 *
 * Moved here out of `app/(site)/[lang]/partner/pillars.tsx`, where they were
 * written directly into the component. Copy in a component cannot be
 * translated and breaks this file's role as the single source of truth — see
 * the sourcing rule at the top.
 *
 * `icon` keys resolve to lucide components in the section, as everywhere else.
 */
export const partnerPillars = [
  {
    id: "global",
    icon: "globe",
    title: "Global Brand Partners",
    subtitle: "Exclusive Agency & Regional Market Entry",
    description:
      "We serve as the exclusive agent in Egypt for world-leading German, Italian, and Korean medical aesthetics and skincare brands, navigating registration, market positioning, and commercial launch.",
    highlights: [
      "Regulatory Clearance",
      "Strategic Brand Positioning",
      "Nationwide Distribution",
    ],
  },
  {
    id: "physicians",
    icon: "stethoscope",
    title: "Dermatologists & Physicians",
    subtitle: "Clinical Masterclasses & Certified Education",
    description:
      "Our relationship with physicians extends far beyond product supply. We provide hands-on clinical workshops, anatomical mapping, and injection protocols led by certified trainers.",
    highlights: [
      "Continuous Medical Education",
      "Device Masterclasses",
      "Protocol Support",
    ],
  },
  {
    id: "clinics",
    icon: "building",
    title: "Clinics & Aesthetic Centres",
    subtitle: "Advanced Technology & 24/7 Technical Service",
    description:
      "Equipping aesthetic clinics with cutting-edge energy-based systems (Zimmer, Rejuran, BV Laser), supported by rapid-response field engineers maintaining zero downtime.",
    highlights: [
      "24/7 Technical Uptime",
      "Preventive Maintenance",
      "Clinical Integration",
    ],
  },
  {
    id: "retail",
    icon: "shopping-bag",
    title: "Retail & E-commerce Partners",
    subtitle: "Flagship Retail & Multi-Channel Scale",
    description:
      "Distributing consumer beauty tech (MLAY) and skincare across flagship shopping malls (City Stars, Mall of Arabia) and leading online channels (Amazon, Noon, Jumia).",
    highlights: [
      "Flagship Mall Outlets",
      "Top Marketplace Growth",
      "D2C Fulfillment",
    ],
  },
  {
    id: "distributors",
    icon: "truck",
    title: "Regional Distributors",
    subtitle: "MENA Supply Chain & Inventory Fulfillment",
    description:
      "Building strategic distribution networks across North Africa and the Middle East backed by Mondial Investissement Corporation's 40+ year operational heritage.",
    highlights: [
      "MENA Logistics Network",
      "Warehousing Scale",
      "Strategic Growth",
    ],
  },
] as const;

export const contact: {
  email: string;
  phone: string;
  address: string;
  /**
   * Only add entries with real, verified URLs.
   *
   * These three were supplied directly by TribuCare rather than taken from the
   * company-profile deck, which carries no contact slide — so they are the one
   * exception to the sourcing rule at the top of this file, and the reason it
   * is noted here rather than left to be rediscovered.
   *
   * Stored as absolute URLs, canonicalised: the tracking and redirect junk the
   * links arrive with (`?feedView=all`, `?_rdc=1&_rdr#`, the `web.` Facebook
   * host) is stripped, because it is per-session state from whoever copied the
   * address out of their browser and means nothing to a visitor.
   *
   * Labels are brand names, so they stay Latin in both locales — see the
   * do-not-translate list in AGENTS.md. There is no `contact` override in
   * content/ar/, which is what makes that happen. They are not rendered as
   * text: the footer draws the mark and uses the label as the link's
   * accessible name.
   *
   * `icon` maps to a component in `components/brand/social-marks.tsx`, the same
   * key-to-component indirection `nav` and `coreValues` use — lucide has no
   * brand icons, so those three marks are drawn there rather than imported.
   */
  social: { label: string; href: string; icon: string }[];
} = {
  email: "cx@tribucare.com",
  // Spaced for reading only. The footer strips the spaces back out to build the
  // `tel:` href, so what is dialled is the number exactly as TribuCare gave it.
  phone: "0100 215 9168",
  address: "",
  social: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/tribu-care/",
      icon: "linkedin",
    },
    {
      label: "Facebook",
      href: "https://www.facebook.com/medvaldermatology",
      icon: "facebook",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/tribucare.eg/",
      icon: "instagram",
    },
  ],
};

/**
 * The main office, and where it is on a map.
 *
 * Supplied directly by TribuCare, like `contact.social` above — the
 * company-profile deck carries no contact slide, so these are the second
 * exception to the sourcing rule at the top of this file.
 *
 * `mapUrl` is the share link TribuCare gave for the place; `lat`/`lng` are the
 * coordinates that link resolves to, kept as numbers because the embedded map
 * is built from them rather than from the short URL — a `maps.app.goo.gl`
 * address is a redirect, and an iframe cannot follow one.
 *
 * `icon` resolves in `components/distribution/channel-card.tsx`, the card the
 * Partnerships page renders this through.
 */
export const contactOffice = {
  icon: "building",
  title: "Main Office",
  body: "The sixth part, building 115, Zahraa Al-Maadi, Industrial Zone, Cairo, Egypt.",
  mapUrl: "https://maps.app.goo.gl/Ph36Cr46tHhpFErQ8",
  lat: 29.9621842,
  lng: 31.3197374,
  image: {
    src: "/brand/tribucare-office.webp",
    alt: "The TribuCare building in Zahraa Al-Maadi, Cairo, seen from the street.",
  },
} as const;

export const footerNav = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Events & News", href: "/events" },
      { label: "Blogs and Insights", href: "/blogs" },
      { label: "FAQ", href: "/#faq" },
      { label: "Partnerships", href: "/partner" },
      { label: "Contact", href: "/partner#contact" },
    ],
  },
  {
    title: "Our Expertise",
    links: [
      { label: "Professional Dermatology Solutions", href: "/dermatology" },
      { label: "Home-Use Beauty Devices", href: "/mlay" },
      { label: "Medicated Skincare Products", href: "/altesse-soin" },
    ],
  },
] as const;

/**
 * Careers.
 *
 * PLACEHOLDER — unlike everything above, the three roles below are NOT from the
 * company-profile deck. They are stand-ins agreed with the client until the real
 * openings are supplied, and `applyUrl` is empty until the external recruitment
 * system's URL is known. Replace both before this goes live; the section renders
 * the CTA conditionally, so an empty `applyUrl` leaves the button out rather
 * than shipping a dead link.
 *
 * `icon` keys map to lucide components in the Careers section, same as `teams`.
 */
export const careers = {
  eyebrow: "Careers",
  headlineLead: "Build the next chapter",
  headlineAccent: "with our tribe.",
  intro:
    "We are growing across Egypt and the MENA region, and we are looking for people who want to work at the meeting point of healthcare, technology and beauty.",
  applyUrl: "",
  cta: { label: "View all available jobs" },
  roles: [
    {
      id: "sales-specialist",
      icon: "TrendingUp",
      title: "Sales Specialist",
      department: "Sales Force",
      type: "Full-time",
      location: "Egypt",
      blurb:
        "Own a territory across clinics, pharmacies and retail partners, and carry our brands to the practitioners who use them every day.",
    },
    {
      id: "technical-support-specialist",
      icon: "Wrench",
      title: "Technical Support Specialist",
      department: "Technical Support",
      type: "Full-time",
      location: "Cairo, Egypt",
      blurb:
        "Install, service and troubleshoot professional dermatology devices, and keep our partners' clinics running without downtime.",
    },
    {
      id: "operations-manager",
      icon: "Truck",
      title: "Operations Manager",
      department: "Operations & Logistics",
      type: "Full-time",
      location: "Cairo, Egypt",
      blurb:
        "Run the supply chain behind the portfolio — planning, warehousing and distribution across the regions we serve.",
    },
  ],
} as const;

/**
 * The About page.
 *
 * ⚠️ PARTIALLY UNWRITTEN. The sourcing rule at the top of this file applies
 * here as strictly as anywhere: the hero, the parent-company line and the
 * figures on this page are all from the deck, and the mission, vision and
 * reach numbers are reused from the exports above rather than restated, so
 * they cannot drift.
 *
 * `story.paragraphs` and `leadership` are NOT written. They say so on the page
 * rather than guessing at a founding narrative, a milestone or a quote — an
 * invented company history is the exact failure the sourcing rule exists to
 * prevent, and this site deploys straight to production. Replace the strings
 * marked PLACEHOLDER below with the real copy and delete `placeholder: true`;
 * the draft notice disappears with it.
 *
 * `leadership.people` is empty on purpose. It renders nothing at all until
 * somebody is added, so the section cannot ship a half-built team grid.
 */
export const about = {
  eyebrow: "About TribuCare",
  headlineLead: "A healthcare and beauty group,",
  headlineAccent: "built for the region it serves.",
  /** Reused verbatim from `company.description` — one source, one wording. */
  intro: company.description,
  /** The same figures the homepage shows, referenced rather than restated so
   *  the two can never disagree. */
  stats: reach,
  parentNote: `Operating under ${company.legalParent}.`,

  /**
   * The hero composite — the same two-layer construction the Mission & Vision
   * section and the Partner page use, and the same motion, but its own pair of
   * files rather than the shared shield.
   *
   * The other two pages set one figure against a shield that towers over it.
   * Here the team leads and the mark sits behind them, so the two are exported
   * at a different relative scale — the team larger, the shield smaller, and
   * the shield dropped so it tucks behind the group rather than crowning it —
   * onto a landscape 1993×1055 box of their own. Both come from that box,
   * which is what makes `object-contain` resolve them to the same size and
   * origin; re-export either alone and the mark slides off the group.
   *
   * `mission-backdrop.webp` is deliberately untouched: it is shared by the
   * homepage and the Partner page, and rescaling it for this one would move
   * the figure in both.
   *
   * The hash in each filename is what makes a re-export actually ship.
   * `next/image` caches by URL, as does every CDN and browser in front of it,
   * so overwriting a path that has already been served leaves the old pixels
   * in place — and when only one half of a registered pair goes stale, the two
   * stop lining up, which is a broken composite rather than an old one. A
   * query string would say the same thing more cheaply, but `next/image`
   * refuses one on a local path unless `images.localPatterns` is configured,
   * and adding that blocks every *other* local image on the site unless it is
   * listed too. So the URL changes when the bytes do: re-export, take the new
   * name, and no cache anywhere can serve the previous pair.
   */
  media: {
    backdrop: { src: "/brand/about-hero-mark.d939e64d.webp" },
    figure: {
      src: "/brand/about-hero-team.c997bee6.webp",
      alt: "The TribuCare team standing together in professional and clinical dress.",
    },
    width: 1993,
    height: 1055,
  },

  story: {
    eyebrow: "Our Story",
    headline: "How TribuCare came to be",
    placeholder: true,
    paragraphs: [
      "PLACEHOLDER — the founding story has not been written yet. Replace this with how TribuCare started, who started it, and what gap in the Egyptian market it was built to close.",
      "PLACEHOLDER — the second paragraph is reserved for how the company grew into the three lines it runs today: professional dermatology technology, home-use beauty devices, and clinically inspired skincare.",
    ],
  },

  leadership: {
    eyebrow: "Leadership",
    headline: "The people behind the group",
    placeholder: true,
    body: "PLACEHOLDER — replace with a short introduction to the leadership team, and add each person below. Until somebody is added, no cards are rendered.",
    /** Empty until real people are supplied. Names, roles and photographs are
     *  exactly the kind of detail that must never be invented. */
    people: [] as ReadonlyArray<{
      name: string;
      role: string;
      photo: string;
    }>,
  },
} as const;
