/**
 * Altesse Soin Medicated Skincare — data and product catalogue.
 * Sourced directly from TribuCare flagship skincare brand documentation and official altessesoin.com catalog.
 * Uses 100% authentic photography from official store CDNs.
 */

export type AltesseProduct = {
  slug: string;
  name: string;
  brand: "Altesse Soin";
  line: "cica" | "brightening" | "reservoir" | "sunissime" | "deodorants" | "accessories";
  lineLabel: string;
  category: string;
  summary: string;
  image: string;
  url: string;
};

export const altesseProductLines = [
  {
    id: "cica",
    number: "01",
    label: "Cica Barrier Repair & Calming Protocols",
    blurb:
      "Formulated with therapeutic concentrations of Centella Asiatica (Cica), Madecassoside, and bio-identical Ceramides to soothe irritated, red, or post-procedure skin and restore epidermal resilience.",
  },
  {
    id: "brightening",
    number: "02",
    label: "Lustré Radiance & Hyperpigmentation Regimens",
    blurb:
      "Advanced multi-target brightening protocols combining Vitamin C, Niacinamide, and botanical antioxidants to fade stubborn sun spots, unify tone, and reveal natural dermal luminescence.",
  },
  {
    id: "reservoir",
    number: "03",
    label: "Réservoir Peptides & Ceramides Hydration Protocols",
    blurb:
      "Multi-molecular Hyaluronic Acid, Polyglutamic Acid, and restorative Ceramides delivering sustained 72-hour moisture that plumps dehydration lines without oiliness.",
  },
  {
    id: "sunissime",
    number: "04",
    label: "Sunissime Daily Photoprotection SPF 50+",
    blurb:
      "High-performance broad-spectrum UVA/UVB and HEV Blue Light defense formulated with antioxidant complexes, offering an invisible, non-greasy matte finish in intense sun.",
  },
  {
    id: "deodorants",
    number: "05",
    label: "Whitening & Hair-Delaying Deodorant Roll-Ons",
    blurb:
      "Aluminum-free brightening roll-on deodorants with natural plant-derived hair-growth retarding complexes and 48-hour gentle odor control in signature fragrances.",
  },
  {
    id: "accessories",
    number: "06",
    label: "Luxury Travel Pouches & Vanity Essentials",
    blurb:
      "High-durability cosmetic travel cases with transparent view panels designed to store and protect active skincare routines on the go.",
  },
] as const;

export const altesseProducts: AltesseProduct[] = [
  // Line 01: Cica Routine
  {
    slug: "repairing-bundle",
    name: "Altesse Cica Repairing Bundle (3-Step Routine)",
    brand: "Altesse Soin",
    line: "cica",
    lineLabel: "Complete Routine",
    category: "Cica Routine",
    summary:
      "A complete 3-step calming routine (Mild Foaming Cleanser, Regenerating Serum, Repairing Gel Cream) to soothe irritation, reduce redness, and reinforce the skin barrier.",
    image: "/brand/altesse/altesse-cica-bundle-real.webp",
    url: "https://altessesoin.com/products/repairing-bundle",
  },
  {
    slug: "altesse-cica-mild-foaming-cleanser-180ml",
    name: "Altesse Cica Mild Foaming Cleanser (180ml)",
    brand: "Altesse Soin",
    line: "cica",
    lineLabel: "Cleanser",
    category: "Cica Routine",
    summary:
      "Purifies pores and removes urban pollution without stripping natural moisture, leaving sensitive skin feeling fresh, soft, and balanced.",
    image: "/brand/altesse/altesse-cica-mild-foaming-cleanser-180ml.webp",
    url: "https://altessesoin.com/products/altesse-cica-mild-foaming-cleanser-180ml",
  },
  {
    slug: "altesse-cica-regenerating-serum-30ml",
    name: "Altesse Cica Regenerating Serum (30ml)",
    brand: "Altesse Soin",
    line: "cica",
    lineLabel: "Active Serum",
    category: "Cica Routine",
    summary:
      "Concentrated Centella Asiatica serum that reinforces barrier lipids against daily environmental stressors and accelerates post-treatment skin recovery.",
    image: "/brand/altesse/altesse-cica-regenerating-serum-30ml.webp",
    url: "https://altessesoin.com/products/altesse-cica-regenerating-serum-30ml",
  },
  {
    slug: "altesse-cica-repairing-gel-cream-50ml",
    name: "Altesse Cica Repairing Gel Cream (50ml)",
    brand: "Altesse Soin",
    line: "cica",
    lineLabel: "Barrier Cream",
    category: "Cica Routine",
    summary:
      "Ultra-lightweight soothing gel cream that delivers 24-hour hydration without oiliness, calming active redness and restoring dermal suppleness.",
    image: "/brand/altesse/altesse-cica-repairing-gel-cream-50ml.webp",
    url: "https://altessesoin.com/products/altesse-cica-repairing-gel-cream-50ml",
  },

  // Line 02: Brightening Regimens
  {
    slug: "brightening-bundle",
    name: "Altesse Lustré Brightening Bundle (3-Step Routine)",
    brand: "Altesse Soin",
    line: "brightening",
    lineLabel: "Complete Routine",
    category: "Brightening Routine",
    summary:
      "A clinical 3-step brightening protocol formulated to fade hyperpigmentation, refine pore texture, and impart a luminous, even-toned complexion.",
    image: "/brand/altesse/brightening-bundle.webp",
    url: "https://altessesoin.com/products/brightening-bundle",
  },
  {
    slug: "lustre-foaming-cleanser",
    name: "Lustré Vitamin C Niacinamide Cleanser (180ml)",
    brand: "Altesse Soin",
    line: "brightening",
    lineLabel: "Brightening Cleanser",
    category: "Brightening Routine",
    summary:
      "Exfoliates dull surface cells gently with mild amino acids and Vitamin C while maintaining essential moisture and antioxidant protection.",
    image: "/brand/altesse/lustre-vitamin-c-niacinamide-mild-foaming-cleanser-180ml.webp",
    url: "https://altessesoin.com/products/lustre-vitamin-c-niacinamide-mild-foaming-cleanser-180ml",
  },
  {
    slug: "lustre-brightening-serum",
    name: "Lustré Vitamin C Niacinamide Serum (30ml)",
    brand: "Altesse Soin",
    line: "brightening",
    lineLabel: "Corrective Serum",
    category: "Brightening Routine",
    summary:
      "Visibly fades stubborn dark spots, unifies skin tone, and creates an inner luminous glow with high-potency Niacinamide and active Vitamin C.",
    image: "/brand/altesse/lustre-vitamin-c-niacinamide-brightening-serum-30ml.webp",
    url: "https://altessesoin.com/products/lustre-vitamin-c-niacinamide-brightening-serum-30ml",
  },
  {
    slug: "lustre-brightening-gel-cream",
    name: "Lustré Vit C Niacinamide Brightening Gel Cream (50ml)",
    brand: "Altesse Soin",
    line: "brightening",
    lineLabel: "Radiance Seal",
    category: "Brightening Routine",
    summary:
      "Provides long-lasting hydration while preventing future pigmentation and environmental dullness without sticky or greasy residue.",
    image: "/brand/altesse/altesse-lustre-vit-c-niacinamide-brightening-gel-cream-50ml.webp",
    url: "https://altessesoin.com/products/altesse-lustre-vit-c-niacinamide-brightening-gel-cream-50ml",
  },

  // Line 03: Réservoir Hydration
  {
    slug: "reservoir-kit",
    name: "Altesse Réservoir Hydration Protocol Kit",
    brand: "Altesse Soin",
    line: "reservoir",
    lineLabel: "Complete Protocol",
    category: "Hydration Routine",
    summary:
      "Complete 3-step dermal hydration system engineered to deeply replenish parched, dehydrated skin and lock in moisture for 72 hours.",
    image: "/brand/altesse/reservoir-kit-hydration-rotten-3pcs.webp",
    url: "https://altessesoin.com/products/reservoir-kit-hydration-rotten-3pcs",
  },
  {
    slug: "reservoir-foam-cleanser",
    name: "Réservoir Hydrating Foam Cleanser (180ml)",
    brand: "Altesse Soin",
    line: "reservoir",
    lineLabel: "Hydrating Wash",
    category: "Hydration Routine",
    summary:
      "Purifies pores while flooding skin with refreshing moisture, preventing transepidermal water loss from the very first cleanse.",
    image: "/brand/altesse/reservoir-hydrating-foam-cleanser-180ml.webp",
    url: "https://altessesoin.com/products/reservoir-hydrating-foam-cleanser-180ml",
  },
  {
    slug: "reservoir-hydrating-serum",
    name: "Réservoir Peptides Ceramides Hydrating Serum (30ml)",
    brand: "Altesse Soin",
    line: "reservoir",
    lineLabel: "Plumping Serum",
    category: "Hydration Routine",
    summary:
      "Multi-molecular Hyaluronic Acid and Peptides that penetrate deep into the dermal matrix to plump fine lines and restore bounce and firmness.",
    image: "/brand/altesse/altesse-reservoir-peptides-ceramides-hyderating-serum-30ml.webp",
    url: "https://altessesoin.com/products/altesse-reservoir-peptides-ceramides-hyderating-serum-30ml",
  },
  {
    slug: "reservoir-hydrating-gel-cream",
    name: "Réservoir Peptides Ceramides Gel Cream (50ml)",
    brand: "Altesse Soin",
    line: "reservoir",
    lineLabel: "Moisture Barrier",
    category: "Hydration Routine",
    summary:
      "Forms a breathable moisture shield that prevents dehydration all day while soothing stressed skin barrier lipids.",
    image: "/brand/altesse/reservoir-peptides-ceramides-hydrating-gel-cream-50ml.webp",
    url: "https://altessesoin.com/products/reservoir-peptides-ceramides-hydrating-gel-cream-50ml",
  },

  // Line 04: Sunissime Photoprotection
  {
    slug: "sunissime-anti-aging-spf50",
    name: "Sunissime Anti-Aging Daily Sunscreen SPF50+ (50ml)",
    brand: "Altesse Soin",
    line: "sunissime",
    lineLabel: "Daily Sun Shield",
    category: "Sun Care",
    summary:
      "Broad-spectrum UVA/UVB and Blue Light SPF50+ protection formulated with antioxidant shields to prevent photo-induced wrinkles and sun spots.",
    image: "/brand/altesse/sunissime-anti-aging-daily-sunscreen-spf50-50ml.webp",
    url: "https://altessesoin.com/products/sunissime-anti-aging-daily-sunscreen-spf50-50ml",
  },
  {
    slug: "sunissime-hydrating-spf50",
    name: "Sunissime Hydrating Daily Sunscreen SPF50+ (50ml)",
    brand: "Altesse Soin",
    line: "sunissime",
    lineLabel: "Hydrating Sun Shield",
    category: "Sun Care",
    summary:
      "Zero white-cast, ultra-lightweight moisturizing sunscreen gel that sits invisibly on skin and hydrates throughout hot weather.",
    image: "/brand/altesse/sunissime-hydrating-daily-sunscreen-spf50-50ml.webp",
    url: "https://altessesoin.com/products/sunissime-hydrating-daily-sunscreen-spf50-50ml",
  },

  // Line 05: Roll-on Deodorants
  {
    slug: "deodorant-serenite",
    name: "Whitening & Hair-Delaying Deodorant — Sérénité (50ml)",
    brand: "Altesse Soin",
    line: "deodorants",
    lineLabel: "Roll-On Deodorant",
    category: "Roll-On Deodorants",
    summary:
      "Signature fresh clean fragrance with 48h odor protection and a plant-based complex that delays hair regrowth and brightens underarm tone.",
    image: "/brand/altesse/altesse-whitening-and-hair-delaying-roll-on-deodorant-serenite-50ml.webp",
    url: "https://altessesoin.com/products/altesse-whitening-and-hair-delaying-roll-on-deodorant-serenite-50ml",
  },
  {
    slug: "deodorant-aurora",
    name: "Whitening & Hair-Delaying Deodorant — Aurora (50ml)",
    brand: "Altesse Soin",
    line: "deodorants",
    lineLabel: "Roll-On Deodorant",
    category: "Roll-On Deodorants",
    summary:
      "Enriched with a delicate floral blossom scent, soothing botanicals, and gentle brightening actives for sensitive skin.",
    image: "/brand/altesse/whitening-and-hair-delaying-roll-on-deodorant-aurora-50ml.webp",
    url: "https://altessesoin.com/products/whitening-and-hair-delaying-roll-on-deodorant-aurora-50ml",
  },
  {
    slug: "deodorant-felicite",
    name: "Whitening & Hair-Delaying Deodorant — Félicité (50ml)",
    brand: "Altesse Soin",
    line: "deodorants",
    lineLabel: "Roll-On Deodorant",
    category: "Roll-On Deodorants",
    summary:
      "Energizing citrus bergamot notes with targeted anti-pigmentation actives that keep underarm skin fresh, smooth, and unified.",
    image: "/brand/altesse/whitening-and-hair-delaying-roll-on-deodorant-felicite-50ml.webp",
    url: "https://altessesoin.com/products/whitening-and-hair-delaying-roll-on-deodorant-felicite-50ml",
  },
  {
    slug: "deodorant-belle-vie",
    name: "Whitening & Hair-Delaying Deodorant — Belle Vie (50ml)",
    brand: "Altesse Soin",
    line: "deodorants",
    lineLabel: "Roll-On Deodorant",
    category: "Roll-On Deodorants",
    summary:
      "Sweet vanilla soothing aroma providing 48-hour perspiration control while nourishing skin lipids without aluminum salts.",
    image: "/brand/altesse/whitening-and-hair-delaying-roll-on-deodorant-belle-vie-50ml.webp",
    url: "https://altessesoin.com/products/whitening-and-hair-delaying-roll-on-deodorant-belle-vie-50ml",
  },
  {
    slug: "deodorant-delicat",
    name: "Whitening & Hair-Delaying Deodorant — Délicat (50ml)",
    brand: "Altesse Soin",
    line: "deodorants",
    lineLabel: "Roll-On Deodorant",
    category: "Roll-On Deodorants",
    summary:
      "Powder soft, hypo-allergenic formula specifically created for easily irritated underarms, calming post-waxing or post-shaving sensitivity.",
    image: "/brand/altesse/whitening-and-hair-delaying-roll-on-deodorant-delicat-50ml.webp",
    url: "https://altessesoin.com/products/whitening-and-hair-delaying-roll-on-deodorant-delicat-50ml",
  },
  {
    slug: "daily-duo-deodorant",
    name: "Altesse Daily Duo Deodorant Set",
    brand: "Altesse Soin",
    line: "deodorants",
    lineLabel: "Value Bundle",
    category: "Roll-On Deodorants",
    summary:
      "Curated 2-pack roll-on set providing long-term hair-delaying care and daily odor control for continuous home and gym use.",
    image: "/brand/altesse/daily-duo.webp",
    url: "https://altessesoin.com/products/daily-duo",
  },

  // Line 06: Accessories
  {
    slug: "altesse-mint-beauty-bag",
    name: "Altesse Mint Beauty Travel Pouch 💚",
    brand: "Altesse Soin",
    line: "accessories",
    lineLabel: "Beauty Accessory",
    category: "Travel Essentials",
    summary:
      "Stylish fresh mint cosmetic pouch with transparent top cover for quick visual access to your full skincare regimen during daily travel.",
    image: "/brand/altesse/altesse-mint-bag-real.webp",
    url: "https://altessesoin.com/products/altesse-mint-beauty-bag-",
  },
  {
    slug: "altesse-pink-beauty-bag",
    name: "Altesse Soft Pink Beauty Travel Pouch 🎀",
    brand: "Altesse Soin",
    line: "accessories",
    lineLabel: "Beauty Accessory",
    category: "Travel Essentials",
    summary:
      "Elegant soft pink beauty bag crafted from durable, easy-to-clean materials for compact vanity organization and on-the-go skincare storage.",
    image: "/brand/altesse/altesse-pink-bag-real.webp",
    url: "https://altessesoin.com/products/altesse-soft-pink-beauty-bag-",
  },
];

export function altesseCategoriesFor(lineId: string) {
  const lineProducts = altesseProducts.filter((p) => p.line === lineId);
  const categories = Array.from(new Set(lineProducts.map((p) => p.category)));
  return categories.map((cat) => ({
    category: cat,
    items: lineProducts.filter((p) => p.category === cat),
  }));
}

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
