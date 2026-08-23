/**
 * MLAY Home-Use Beauty Technology — data and product catalogue.
 * Sourced directly from TribuCare official distributor catalog and store listings.
 * Uses 100% authentic photography from official store CDNs.
 */

export type MlayProduct = {
  slug: string;
  name: string;
  brand: "MLAY";
  line: "handsets" | "accessories";
  lineLabel: string;
  category: string;
  summary: string;
  image: string;
  url: string;
};

export const mlayProductLines = [
  {
    id: "handsets",
    number: "01",
    label: "IPL Hair Removal & Skin Rejuvenation Handsets",
    blurb:
      "Clinical-grade optical hair reduction systems equipped with sapphire ice-cooling contact plates, multi-wavelength filtration, and intelligent skin tone calibration for painless home sessions.",
  },
  {
    id: "accessories",
    number: "02",
    label: "Specialized Replacement Lamps & Precision Lenses",
    blurb:
      "Interchangeable precision optical filters engineered for targeted anatomical areas — facial contours, bikini line, acne clearance, and dermal collagen renewal.",
  },
] as const;

export const mlayProducts: MlayProduct[] = [
  // Line 01: Handsets
  {
    slug: "mlay-t14-pro",
    name: "MLAY T14 Pro AI Smart IPL & Rejuvenation",
    brand: "MLAY",
    line: "handsets",
    lineLabel: "Flagship Laser",
    category: "Hair Removal Handsets",
    summary:
      "Next-generation flagship system featuring 1,000,000 flashes, AI smart skin tone sensor, continuous 5°C contact cooling, and 0.5s auto-glide continuous flash mode.",
    image: "/brand/mlay/mlay-t14-pro-real.webp",
    url: "https://www.tribucare.com/products/mlay-t14-pro-hair-removal-elegant-black",
  },
  {
    slug: "mlay-t14a-black",
    name: "MLAY T14A Ice-Cooling IPL Handset",
    brand: "MLAY",
    line: "handsets",
    lineLabel: "Laser Handset",
    category: "Hair Removal Handsets",
    summary:
      "High-speed 500,000 flash IPL device with instant contact ice-cooling conduction, 5 energy levels, and ergonomic grip in premium finish.",
    image: "/brand/mlay/mlay-t14-black.webp",
    url: "https://www.tribucare.com/products/mlay-t14a-hair-removal-elegant-black",
  },
  {
    slug: "mlay-t4-ice-touch",
    name: "MLAY T4 Hair Removal with Ice-Cooling Touch",
    brand: "MLAY",
    line: "handsets",
    lineLabel: "Laser Handset",
    category: "Hair Removal Handsets",
    summary:
      "Painless hair removal system featuring an instant cooling ceramic window, high-capacity quartz lamp, and 5 adjustable power settings.",
    image: "/brand/mlay/mlay-t4-real.webp",
    url: "https://www.tribucare.com/products/mlay-t4-hair-removal-with-ice-cooling-touch",
  },
  {
    slug: "mlay-t10a-precision",
    name: "MLAY T10A Precision Cooling Laser",
    brand: "MLAY",
    line: "handsets",
    lineLabel: "Compact Laser",
    category: "Hair Removal Handsets",
    summary:
      "Compact ergonomic IPL handset with integrated cold sapphire plate designed for precise handling around facial contours and sensitive body zones.",
    image: "/brand/mlay/mlay-t10-real.webp",
    url: "https://www.tribucare.com/products/mlay-t10a-hair-removal-black-copy",
  },
  {
    slug: "mlay-t3-multi-function",
    name: "MLAY T3 3-in-1 Hair Removal & Acne Treatment",
    brand: "MLAY",
    line: "handsets",
    lineLabel: "3-in-1 Workstation",
    category: "Hair Removal Handsets",
    summary:
      "Versatile home workstation with interchangeable specialty lamp heads for long-term hair removal (HR), skin rejuvenation (SR), and acne clearance (AC).",
    image: "/brand/mlay/mlay-t3-real.webp",
    url: "https://www.tribucare.com/products/mlay-t3-hair-removal-skin-rejuvenation-acne-treatment",
  },

  // Line 02: Replacement Lamps & Lenses
  {
    slug: "mlay-t14-bikini-lamp",
    name: "MLAY Bikini Precision Lamp (T14 / T14 Pro)",
    brand: "MLAY",
    line: "accessories",
    lineLabel: "Precision Lamp",
    category: "Replacement Lamps & Lenses",
    summary:
      "Narrow-window optical replacement head designed specifically for sensitive bikini contours with focused optical energy delivery.",
    image: "/brand/mlay/mlay-t14-bikini-lamp.webp",
    url: "https://www.tribucare.com/products/mlay-bikini-lamp-for-t14-pro",
  },
  {
    slug: "mlay-t14-face-lamp",
    name: "MLAY Facial Precision Lamp (T14 / T14 Pro)",
    brand: "MLAY",
    line: "accessories",
    lineLabel: "Facial Lamp",
    category: "Replacement Lamps & Lenses",
    summary:
      "Small-aperture optical window for delicate facial areas, upper lip, chin, and cheekbones with specialized photofiltration.",
    image: "/brand/mlay/mlay-t14-face-lamp.webp",
    url: "https://www.tribucare.com/products/mlay-face-lamp-for-t14-pro",
  },
  {
    slug: "mlay-t14-underarm-lamp",
    name: "MLAY Underarm Precision Lamp (T14 / T14 Pro)",
    brand: "MLAY",
    line: "accessories",
    lineLabel: "Precision Lens",
    category: "Replacement Lamps & Lenses",
    summary:
      "Specialized concave treatment lens optimized for underarm curvature and uneven skin contact, ensuring full optical contact.",
    image: "/brand/mlay/mlay-t14-underarm-lamp.webp",
    url: "https://www.tribucare.com/products/mlay-underarm-lamp-for-t14-pro",
  },
  {
    slug: "mlay-t14-body-lamp",
    name: "MLAY Wide Body Lamp (T14 / T14 Pro)",
    brand: "MLAY",
    line: "accessories",
    lineLabel: "Body Lamp",
    category: "Replacement Lamps & Lenses",
    summary:
      "Wide-aperture replacement lamp providing broad optical coverage for fast, efficient leg and arm hair removal sessions.",
    image: "/brand/mlay/mlay-t14-body-lamp.webp",
    url: "https://www.tribucare.com/products/mlay-body-lamp-for-t14-pro",
  },
  {
    slug: "mlay-t14-sr-lamp",
    name: "MLAY Skin Rejuvenation (SR) Lamp (T14 / T14 Pro)",
    brand: "MLAY",
    line: "accessories",
    lineLabel: "Therapeutic Lamp",
    category: "Replacement Lamps & Lenses",
    summary:
      "530nm wavelength filter stimulating dermal collagen and elastin synthesis to improve skin elasticity, pore tone, and smoothness.",
    image: "/brand/mlay/mlay-t14-sr-lamp.webp",
    url: "https://www.tribucare.com/products/mlay-ac-lamp-for-t14-pro-copy",
  },
  {
    slug: "mlay-t14-ac-lamp",
    name: "MLAY Acne Clearance (AC) Lamp (T14 / T14A)",
    brand: "MLAY",
    line: "accessories",
    lineLabel: "Therapeutic Lamp",
    category: "Replacement Lamps & Lenses",
    summary:
      "Targeted optical spectrum destroying acne-causing bacteria and calming inflammation on facial skin and upper back.",
    image: "/brand/mlay/mlay-lamp-face.webp",
    url: "https://www.tribucare.com/products/mlay-ac-lamp-for-t14a",
  },
  {
    slug: "mlay-t3-body-lens",
    name: "MLAY Body Hair Removal Lens (T3)",
    brand: "MLAY",
    line: "accessories",
    lineLabel: "T3 Lamp Cartridge",
    category: "Replacement Lamps & Lenses",
    summary:
      "High-output quartz flash cartridge providing 500,000 pulses for comprehensive full-body hair reduction on T3 workstations.",
    image: "/brand/mlay/mlay-t3-body-lamp.webp",
    url: "https://www.tribucare.com/products/mlay-egypt-body-lens-for-t3-ipl-device",
  },
  {
    slug: "mlay-t3-sr-lens",
    name: "MLAY Skin Rejuvenation Lens (T3)",
    brand: "MLAY",
    line: "accessories",
    lineLabel: "T3 Lamp Cartridge",
    category: "Replacement Lamps & Lenses",
    summary:
      "Dedicated photo-rejuvenation cartridge for fine line smoothing and dermal tone revival on T3 devices.",
    image: "/brand/mlay/mlay-t3-sr-lamp.webp",
    url: "https://www.tribucare.com/products/mlay-egypt-skin-rejuvination-lens-for-t3-ipl-device",
  },
  {
    slug: "mlay-t3-ac-lens",
    name: "MLAY Acne Clearance Lens (T3)",
    brand: "MLAY",
    line: "accessories",
    lineLabel: "T3 Lamp Cartridge",
    category: "Replacement Lamps & Lenses",
    summary:
      "Anti-inflammatory phototherapy replacement cartridge designed to clarify active breakouts on T3 systems.",
    image: "/brand/mlay/mlay-t3-ac-lamp.webp",
    url: "https://www.tribucare.com/products/mlay-egypt-acne-clearance-lens-for-t3-ipl-device",
  },
];

export function mlayCategoriesFor(lineId: string) {
  const lineProducts = mlayProducts.filter((p) => p.line === lineId);
  const categories = Array.from(new Set(lineProducts.map((p) => p.category)));
  return categories.map((cat) => ({
    category: cat,
    items: lineProducts.filter((p) => p.category === cat),
  }));
}

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
