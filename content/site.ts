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
 * of its label on its own: the three stacked verticals for expertise, a gem for
 * the values the company holds to, and the handshake this site already uses
 * wherever it talks about partnership.
 */
export const nav = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Our Expertise", href: "/#expertise", icon: "layers" },
  { label: "Core Values", href: "/#core-values", icon: "gem" },
  { label: "Partnerships", href: "/#partner", icon: "handshake" },
  { label: "Blog", href: "/blog", icon: "newspaper" },
] as const;

export const hero = {
  eyebrow: "Healthcare & Beauty Group · Egypt & MENA",
  headlineLead: "Advancing beauty.",
  headlineAccent: "Empowering care.",
  subhead:
    "TribuCare connects trusted global technologies, professional dermatology solutions, beauty devices and clinically inspired skincare with consumers and professionals across Egypt and the MENA region.",
  primaryCta: { label: "Explore Our Brands", href: "#brands" },
  secondaryCta: { label: "About TribuCare", href: "#about" },
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
    brands: ["Zimmer Medical", "Rejuran", "beaumed", "IDS", "AGEX Beauty", "BV Laser"],
    cta: { label: "Professional solutions", href: "/dermatology" },
    image: {
      src: "/brand/derma-solutions.webp",
      alt: "A clinic laser system alongside a Rejuran polynucleotide box and syringe, with a South Korean flag and a smiling model.",
      width: 1250,
      height: 1253,
    },
  },
  {
    number: "02",
    id: "devices",
    label: "Home-Use Beauty Devices",
    headline: "Salon-grade technology at home.",
    body: "In partnership with MLAY, TribuCare brings high-performance beauty tech to the Egyptian market — empowering consumers with salon-grade skincare and hair care, supported by flagship retail and nationwide e-commerce.",
    audience: "Consumers · Retail · E-commerce",
    brands: ["MLAY"],
    cta: { label: "Discover MLAY", href: "#brands" },
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
    brands: ["Altesse Soin"],
    cta: { label: "Discover Altesse Soin", href: "#brands" },
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
 * width follow, since the aspect ratios run from 1.4:1 (IDS) to 6:1 (MLAY).
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
    src: "/brand/logos/zimmer-medical.webp",
    width: 393,
    height: 146,
  },
  Rejuran: { src: "/brand/logos/rejuran.webp", width: 568, height: 99 },
  beaumed: { src: "/brand/logos/beaumed.webp", width: 450, height: 86 },
  IDS: { src: "/brand/logos/ids.webp", width: 185, height: 128 },
  "AGEX Beauty": {
    src: "/brand/logos/agex-beauty.webp",
    width: 254,
    height: 83,
  },
  "BV Laser": { src: "/brand/logos/bv-laser.webp", width: 595, height: 125 },
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
  secondaryCta: { label: "Explore Our Brands", href: "#brands" },
} as const;

/**
 * TODO — supply real values before launch.
 * The company profile provided did not include a contact slide, so nothing is
 * invented here. Each field renders only when filled in.
 */
export const contact: {
  email: string;
  phone: string;
  address: string;
  /** Only add entries with real, verified URLs. */
  social: { label: string; href: string }[];
} = {
  email: "",
  phone: "",
  address: "",
  social: [],
};

export const footerNav = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/#about" },
      { label: "Our Expertise", href: "/#expertise" },
      { label: "Events & News", href: "/#events" },
      { label: "Insights & Blog", href: "/blog" },
      { label: "Partnerships", href: "/#partner" },
    ],
  },
  {
    title: "Our Brands",
    links: [
      { label: "Professional Solutions", href: "#brands" },
      { label: "MLAY", href: "#brands" },
      { label: "Altesse Soin", href: "#brands" },
    ],
  },
  {
    title: "Expertise",
    links: [
      { label: "Professional Dermatology", href: "/dermatology" },
      { label: "Home-Use Beauty Devices", href: "#expertise" },
      { label: "Medicated Skincare", href: "#expertise" },
      { label: "Medical Training", href: "#professionals" },
    ],
  },
] as const;
