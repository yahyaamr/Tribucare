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

  /** One line for the card. */
  summary: string;
  /** Opening paragraph on the product page. */
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

export const products: Product[] = [
  /* ---- 01 / Professional Aesthetic & Dermatology Devices ---------------- */
  {
    slug: "ami-rex-an-dual",
    name: "AMI REX-AN DUAL",
    brand: "AMI",
    category: "Laser Hair Reduction",
    line: "devices",
    summary:
      "Dual-wavelength long-pulsed Alexandrite (755nm) & Nd:YAG (1064nm) laser system with simultaneous emission, top-hat beam, and dual cooling for high-efficiency hair reduction and vascular treatments.",
    overview:
      "The REX-AN DUAL, developed by AMI in South Korea, is a premium long-pulsed laser platform combining 755nm Alexandrite and 1064nm Nd:YAG wavelengths. Engineered for clinical versatility, it features simultaneous dual-wavelength emission to target hairs of varying thicknesses, depths, and colors in a single pass. With both Zoom and Cartridge handpieces and dual Gas/Air cooling with high-capacity 900g refillable canisters supporting up to 25,000 shots, REX-AN DUAL delivers unmatched clinical safety, patient comfort, and operational efficiency.",
    features: [
      "Simultaneous Dual Wavelength (755nm & 1064nm) emission for multi-depth follicular destruction",
      "Top-Hat Beam Profile providing uniform energy distribution without thermal hot spots",
      "Two interchangeable Handpiece options: Zoom Handpiece (3–22mm) and Cartridge Handpiece",
      "Dual Cooling System: Long-lasting Cryo-Gas (900g, 25,000 shots) & external Air cooling",
      "High repetition rate up to 7Hz (3Hz rapid clinical hair removal protocol)",
      "High energy output: Max 90J @ 1064nm and Max 60J @ 755nm with fluence up to 1273 J/cm²",
      "532nm aiming beam (<5mW) for sub-millimeter precision targeting",
    ],
    specs: [
      { label: "Laser Medium", value: "Nd:YAG (1064 nm) & Alexandrite (755 nm)" },
      { label: "Max Energy", value: "90 J @ 1064 nm / 60 J @ 755 nm" },
      { label: "Max Fluence", value: "1273 J/cm² @ 1064 nm / 849 J/cm² @ 755 nm" },
      { label: "Pulse Duration", value: "0.5 – 100 ms" },
      { label: "Spot Size", value: "3, 5, 7, 10, 12, 15, 18, 20, 22 mm (Zoom / Cartridge)" },
      { label: "Repetition Rate", value: "1 – 7 Hz" },
      { label: "Cooling System", value: "Cryo-Gas (900g, 25,000 shots) & Air Cooling (CRYO-ZET compatible)" },
      { label: "Aiming Beam", value: "532 nm (< 5 mW)" },
      { label: "Dimensions & Weight", value: "920 × 420 × 970 mm, 105 kg" },
    ],
    applications: [
      "Hair Removal (Dark/light, thick/fine hair across Fitzpatrick skin types I–VI)",
      "Pigmented Lesions (Freckles, seborrheic keratosis, epidermal/dermal dyschromia)",
      "Vascular Lesions (Telangiectasia, spider veins, facial flushing, rosacea, hemangioma, nevus flammeus)",
      "Dermal Rejuvenation & Skin Laxity Improvement",
      "Inflammatory Acne Management",
    ],
    benefits: [
      "Treats all skin phototypes and hair colors with zero downtime",
      "Significantly reduced treatment time with 3Hz continuous emission",
      "Lowest consumable running cost with large-capacity 900g refillable cryo canister",
      "Consistent, predictable clinical endpoints with uniform top-hat energy delivery",
    ],
    certificates: [
      { label: "CE Medical", reference: "European Medical Device Directive" },
      { label: "ISO 13485", reference: "Medical Device Quality Management" },
      { label: "MFDS Clearance", reference: "Ministry of Food and Drug Safety, Korea" },
    ],
    image: "/brand/dermatology/ami-rex-an-dual-01.webp",
    imageAlt: "AMI REX-AN DUAL Long-pulsed Nd:YAG and Alexandrite Laser System",
    gallery: [
      "/brand/dermatology/ami-rex-an-dual-02.webp",
      "/brand/dermatology/ami-rex-an-dual-03.webp",
      "/brand/dermatology/ami-rex-an-dual-04.webp",
      "/brand/dermatology/ami-rex-an-dual-05.webp",
      "/brand/dermatology/ami-rex-an-dual-06-wide.webp",
    ],
    video: "",
    videoPoster: "",
  },
  {
    slug: "bvlaser-fractional-co2",
    name: "BVLASER Fractional CO2",
    brand: "BV Laser",
    category: "Tightening and Resurfacing",
    line: "devices",
    summary:
      "Medical-grade 10,600nm Fractional CO2 laser with multi-mode scanning, ultra-pulse ablation, and surgical precision for deep resurfacing and scar remodeling.",
    overview:
      "The BVLASER Fractional CO2 Laser delivers precise 10,600nm micro-thermal treatment zones (MTZ) to stimulate deep neocollagenesis while leaving surrounding tissue intact for rapid re-epithelialization. Equipped with an advanced galvano-scanner offering multiple geometric scan shapes and an ultra-pulse surgical mode, it represents the gold standard for severe acne scarring, rhytids, photo-aged skin rejuvenation, and surgical excision.",
    features: [
      "10,600nm High-Purity CO2 Laser Tube with stable RF excitation",
      "Advanced Galvano-Scanner with variable shapes (Square, Circle, Triangle, Hexagon, Ellipse, Line)",
      "Triple Operating Modes: Fractional Scanning, Ultra-Pulse Surgical, and Rejuvenation mode",
      "Adjustable MTZ density, dot pitch, and pulse energy for tailored ablation depth",
      "7-joint balanced articulated optical arm with 360° rotational freedom",
      "Red 635nm diode aiming beam for accurate micro-beam positioning",
    ],
    specs: [
      { label: "Wavelength", value: "10,600 nm (Fractional CO2)" },
      { label: "Output Power", value: "40 W / 60 W (RF Metal Tube)" },
      { label: "Scan Patterns", value: "Square, Rectangle, Circle, Triangle, Hexagon, Ellipse, Line" },
      { label: "Scan Size", value: "0.1 × 0.1 mm to 20 × 20 mm (Continuous adjust)" },
      { label: "Pulse Energy", value: "1 mJ – 100 mJ per dot" },
      { label: "Pulse Duration", value: "0.1 – 10 ms" },
      { label: "Beam Delivery", value: "7-Joint Articulated Optical Arm" },
      { label: "Aiming Beam", value: "635 nm Diode Laser (< 5 mW)" },
    ],
    applications: [
      "Atrophic and Hypertrophic Acne Scars",
      "Surgical and Traumatic Scars",
      "Deep Periorbital and Perioral Wrinkles",
      "Full Face Skin Resurfacing and Pore Reduction",
      "Benign Epidermal Lesions (Syringoma, seborrheic keratosis, warts, moles)",
      "Striae Distensae (Stretch Marks)",
    ],
    benefits: [
      "Dramatic single-session dermal remodeling with controlled fractional thermal injury",
      "Fast patient recovery times with micro-fractional spacing",
      "Versatile clinical utility spanning medical dermatology, surgical excision, and aesthetics",
    ],
    certificates: [
      { label: "CE Medical", reference: "Medical Device Directive 93/42/EEC" },
      { label: "ISO 13485", reference: "Quality Management System" },
      { label: "FDA 510(k)", reference: "Device Clearance" },
    ],
    image: "/brand/dermatology/bvlaser-fractional-co2-01.webp",
    imageAlt: "BVLASER Fractional CO2 Laser System",
    gallery: [
      "/brand/dermatology/bvlaser-fractional-co2-04-wide.webp",
    ],
    video: "",
    videoPoster: "",
  },
  {
    slug: "rejuran-healer",
    name: "Rejuran Healer",
    brand: "Rejuran",
    category: "REJURAN PN",
    line: "injectables",
    summary:
      "Flagship 2% Polynucleotide (PN) cellular skin healer from wild salmon DNA for comprehensive dermal matrix regeneration and skin barrier repair.",
    overview:
      "Rejuran Healer is the globally acclaimed Korean biostimulatory injectable developed by PharmaResearch using patented DOT™ (DNA Optimizing Technology). Formulated with 2% highly purified Polynucleotides (PN) extracted from wild salmon DNA, Rejuran Healer activates endogenous Fibroblast Growth Factors (FGF), stimulates de novo collagen and elastin synthesis, normalizes skin thickness, and restores compromised dermal microenvironments without artificial volumizing.",
    features: [
      "Contains 2% PN (Polynucleotide) with high molecular weight DNA polymers",
      "Patented DOT™ (DNA Optimizing Technology) ensuring 100% biocompatibility and zero immune rejection",
      "Stimulates fibroblast proliferation, Type I/III collagen, and extracellular matrix (ECM) synthesis",
      "Thickens thin, fragile dermal architecture and reinforces the stratum corneum barrier",
      "Packaging: 2.0 mL pre-filled syringe × 2 per box (Total 4.0 mL)",
    ],
    specs: [
      { label: "Active Ingredient", value: "Polynucleotide (PN) 20 mg/mL (2%)" },
      { label: "Origin", value: "Purified Wild Salmon DNA (PharmaResearch Korea)" },
      { label: "Packaging", value: "2.0 mL × 2 Syringes per box (33G ultra-fine needles included)" },
      { label: "Injection Layer", value: "Intradermal / Papillary Dermis" },
      { label: "Recommended Protocol", value: "3 – 4 sessions spaced 3 – 4 weeks apart; maintenance every 6 months" },
    ],
    applications: [
      "Full Face Dermal Matrix Rejuvenation & Thin Skin Thickening",
      "Loss of Skin Elasticity, Firmness, and Fine Line Reduction",
      "Impaired Skin Barrier Restoration after Laser / Peel procedures",
      "Pore Refinement, Sebum Balancing, and Tone Brightening",
      "Neck, Décolletage, and Back of Hands Rejuvenation",
    ],
    benefits: [
      "True cellular anti-ageing by repairing damaged DNA pathways rather than temporary space-filling",
      "Proven clinical improvement in skin hydration (+14.7%), elasticity (+21.8%), and epidermal thickness",
      "Synergistic recovery booster when combined with fractional laser and microneedling",
    ],
    certificates: [
      { label: "MFDS Approved", reference: "Medical Device Class 4, South Korea" },
      { label: "CE Marked", reference: "Medical Device Directive" },
      { label: "EDA Registered", reference: "Egyptian Drug Authority" },
    ],
    image: "/brand/dermatology/rejuran-healer-01.webp",
    imageAlt: "Rejuran Healer 2% Polynucleotide Skin Booster Syringes and Packaging",
    gallery: [],
    video: "",
    videoPoster: "",
  },
  {
    slug: "rejuran-s",
    name: "Rejuran S",
    brand: "Rejuran",
    category: "REJURAN PN",
    line: "injectables",
    summary:
      "High-viscosity 2% Polynucleotide formulation engineered specifically for localized depressed scars, acne scars, and structural tissue repair.",
    overview:
      "Rejuran S is a specialized formulation of 2% Polynucleotides developed with high viscosity to scaffold and fill depressed dermal tissue. Designed specifically for targeted scar revision (rolling, boxcar, and post-surgical scars), Rejuran S creates a supportive regenerative scaffold beneath depressed tissue, accelerating fibroblast recruitment and endogenous extracellular matrix reconstruction.",
    features: [
      "High-viscosity 2% Polynucleotide (PN) gel optimized for focal scar subcision and filling",
      "Scaffolds atrophic dermal defects to elevate depressed acne scar bases",
      "Accelerates wound healing and breaks down fibrotic tethering when combined with subcision",
      "Packaging: 1.0 mL pre-filled syringe per box",
    ],
    specs: [
      { label: "Active Ingredient", value: "Polynucleotide (PN) 20 mg/mL (2% High Viscosity)" },
      { label: "Packaging", value: "1.0 mL × 1 Syringe per box" },
      { label: "Needle Gauge", value: "33G / 34G" },
      { label: "Target Area", value: "Focal atrophic acne scars, surgical scars, chickenpox marks" },
      { label: "Injection Technique", value: "Direct linear / serial puncture into scar bed with optional subcision" },
    ],
    applications: [
      "Atrophic Acne Scars (Rolling, Boxcar, and Ice-pick scars)",
      "Post-Traumatic and Post-Surgical Depressed Scars",
      "Deep localized facial indentations and structural skin defects",
    ],
    benefits: [
      "Permanent tissue reconstruction through natural collagen synthesis rather than dissolvable fillers",
      "Rapid smoothing of skin surface irregularities and scar margins",
      "Safe for all skin types with no risk of post-inflammatory erythema",
    ],
    certificates: [
      { label: "MFDS Approved", reference: "Medical Device, South Korea" },
      { label: "CE Certified", reference: "European Conformity" },
      { label: "EDA Registered", reference: "Egyptian Drug Authority" },
    ],
    image: "/brand/dermatology/rejuran-s-01.webp",
    imageAlt: "Rejuran S Acne Scar Polynucleotide Injectable",
    gallery: [],
    video: "",
    videoPoster: "",
  },
  {
    slug: "rejuran-i",
    name: "Rejuran I",
    brand: "Rejuran",
    category: "REJURAN PN",
    line: "injectables",
    summary:
      "Low-viscosity 2% Polynucleotide formulation tailored for delicate peri-orbital skin, crow's feet, under-eye hollowing, and dark circles.",
    overview:
      "Rejuran I ('Eye') is an ultra-fine, low-viscosity Polynucleotide (PN) formulation engineered specifically for the thinnest and most delicate skin around the eyes. Because peri-orbital skin is prone to lumpiness with standard injectables, Rejuran I's micro-fluidity spreads effortlessly across the superficial papillary dermis without swelling or papule persistence, rebuilding thin eye skin, reducing crow's feet, and brightening dark circles.",
    features: [
      "Low-viscosity 2% Polynucleotide formula designed specifically for thin peri-orbital anatomy",
      "Zero Tyndall effect, zero bluish discoloration, and minimal risk of post-treatment edema",
      "Strengthens micro-vascular support to improve under-eye dark circles and vascular pooling",
      "Packaging: 1.0 mL pre-filled syringe with ultra-thin 34G Nanoneedle",
    ],
    specs: [
      { label: "Active Ingredient", value: "Polynucleotide (PN) 20 mg/mL (2% Low Viscosity)" },
      { label: "Packaging", value: "1.0 mL × 1 Syringe per box" },
      { label: "Needle Gauge", value: "34G Ultra-fine Nanoneedle" },
      { label: "Target Area", value: "Periorbital zone (Under-eye tear trough, crow's feet, upper eyelids)" },
      { label: "Recommended Protocol", value: "3 sessions spaced 3 – 4 weeks apart" },
    ],
    applications: [
      "Periorbital Fine Lines and Crow's Feet Wrinkles",
      "Under-Eye Skin Thinning, Crepiness, and Loss of Elasticity",
      "Dark Circles caused by thin transparent skin and micro-circulation stasis",
      "Superficial Forehead Lines and delicate Neck rings",
    ],
    benefits: [
      "Restores skin thickness and bounce in fragile eye areas where conventional fillers carry risk",
      "Virtually painless injection with ultra-fine 34G needle and smooth injection force",
      "Fast resolution of injection papules within 12–24 hours",
    ],
    certificates: [
      { label: "MFDS Approved", reference: "Medical Device, South Korea" },
      { label: "CE Certified", reference: "European Conformity" },
      { label: "EDA Registered", reference: "Egyptian Drug Authority" },
    ],
    image: "/brand/dermatology/rejuran-i-01.webp",
    imageAlt: "Rejuran I Eye Treatment Polynucleotide Injectable",
    gallery: [],
    video: "",
    videoPoster: "",
  },
  {
    slug: "rejuran-hb-plus",
    name: "Rejuran HB Plus",
    brand: "Rejuran",
    category: "REJURAN PN",
    line: "injectables",
    summary:
      "Hydro-Booster combining Polynucleotides (PN), Hyaluronic Acid (HA), and 0.3% Lidocaine for cellular recovery and pain-free deep hydration.",
    overview:
      "Rejuran HB Plus (Hydro Booster) is a dual-action biostimulant that pairs 1% Polynucleotide (PN) cellular repair with 1% cross-linked Hyaluronic Acid (HA) and 0.3% Lidocaine HCl. This synergistic combination provides instant multi-depth hydration and luminosity while simultaneously stimulating long-term fibroblast collagen production, with significantly reduced injection discomfort.",
    features: [
      "Dual Synergy: PN (1%) for cellular DNA regeneration + HA (1%) for instant dermal hydro-plumping",
      "Contains 0.3% Lidocaine HCl to ensure virtually painless treatment experience",
      "Instant glow and hydration within 48 hours, followed by continuous collagen synthesis",
      "Packaging: 1.0 mL pre-filled syringe per box",
    ],
    specs: [
      { label: "Active Ingredients", value: "Polynucleotide (PN) 10 mg/mL + Hyaluronic Acid 10 mg/mL + Lidocaine 0.3%" },
      { label: "Packaging", value: "1.0 mL × 1 Syringe per box" },
      { label: "Injection Layer", value: "Superficial to Mid Dermis" },
      { label: "Recommended Protocol", value: "3 sessions spaced 3 – 4 weeks apart" },
    ],
    applications: [
      "Dehydrated, dull, and stressed facial skin",
      "Fine surface lines, rough skin texture, and photodamage",
      "Post-laser hydration recovery",
    ],
    benefits: [
      "50%+ reduction in injection pain compared to conventional non-lidocaine PN injectables",
      "Dual immediate and progressive anti-ageing efficacy",
    ],
    certificates: [
      { label: "MFDS Approved", reference: "Medical Device, South Korea" },
      { label: "CE Certified", reference: "European Conformity" },
    ],
    image: "/brand/dermatology/rejuran-hb-plus-01.webp",
    imageAlt: "Rejuran HB Plus Hydro Booster Injectable",
    gallery: [],
    video: "",
    videoPoster: "",
  },
  {
    slug: "kiusera-p",
    name: "Kiusera P",
    brand: "Kiusera",
    category: "Poly-L-Lactic Acid",
    line: "injectables",
    summary:
      "Biodegradable Poly-L-Lactic Acid (PLLA) powder collagen biostimulator for progressive volumetric restoration and deep structural contouring.",
    overview:
      "Kiusera P is a next-generation Poly-L-Lactic Acid (PLLA) powder collagen stimulator manufactured by Beaumed in South Korea. Utilizing uniform spherical PLLA micro-particles (150mg per vial), Kiusera P stimulates endogenous neocollagenesis over 12 to 24 months, restoring lost structural volume in hollow temples, sunken cheeks, and undefined jawlines without artificial puffiness.",
    features: [
      "High-purity spherical PLLA micro-particles with controlled degradation kinetics",
      "Stimulates endogenous Type I and Type III collagen for natural, anatomical volumization",
      "Sustained clinical longevity lasting up to 24 months",
      "Uniform micro-particle size distribution minimizes risk of nodule or granuloma formation",
    ],
    specs: [
      { label: "Active Composition", value: "Poly-L-Lactic Acid (PLLA) 150 mg + CMC + Mannitol" },
      { label: "Packaging", value: "Sterile Lyophilized Powder 1 Vial per box" },
      { label: "Reconstitution", value: "Reconstitute with Sterile Water for Injection (SWFI) & 2% Lidocaine" },
      { label: "Injection Depth", value: "Deep Dermis / Subcutaneous Plane using 25G/27G Cannula" },
      { label: "Longevity", value: "Up to 24 Months" },
    ],
    applications: [
      "Facial Lipoatrophy, Sunken Temples, and Midface Volume Loss",
      "Nasolabial Folds, Deep Marionette Lines, and Jawline Definition",
      "Neck Laxity, Décolletage Crepiness, and Dorsal Hand Rejuvenation",
    ],
    benefits: [
      "Progressive, authentic volumization that moves naturally with facial expressions",
      "Longest lasting biostimulatory injectable on the market (2+ years)",
      "100% biodegradable into natural lactic acid, CO2, and water",
    ],
    certificates: [
      { label: "CE Certified", reference: "Medical Device Certification" },
      { label: "ISO 13485", reference: "Quality Management Standard" },
      { label: "MFDS Approved", reference: "South Korea" },
    ],
    image: "/brand/dermatology/kiusera-p-01.webp",
    imageAlt: "Kiusera P Poly-L-Lactic Acid Collagen Stimulator Vial and Box",
    gallery: [
      "/brand/dermatology/kiusera-p-02.webp",
    ],
    video: "",
    videoPoster: "",
  },
  {
    slug: "kiusera-l",
    name: "Kiusera L",
    brand: "Kiusera",
    category: "Poly-L-Lactic Acid",
    line: "injectables",
    summary:
      "Liquid-phase Poly-L-Lactic Acid (PLLA) skin booster for intensive dermal redensification, pore tightening, and fine line smoothing.",
    overview:
      "Kiusera L is an innovative liquid-formulation Poly-L-Lactic Acid (PLLA) skin booster developed by Beaumed. Engineered for intradermal and mesotherapy delivery, Kiusera L diffuses evenly throughout the reticular dermis to dramatically increase skin thickness, improve dermal elasticity, and tighten dilated pores across the full face and neck.",
    features: [
      "Liquid suspension PLLA formulation ready for mesotherapy and micro-injection",
      "Accelerates widespread superficial neocollagenesis for improved skin bounce and glow",
      "Enhances dermal density without altering natural facial contours or facial weight",
      "Packaging: 10.0 mL sterile vial per box",
    ],
    specs: [
      { label: "Active Formulation", value: "Solubilized PLLA Liquid Polymer Complex (10 mL)" },
      { label: "Packaging", value: "10.0 mL Sterile Glass Vial per box" },
      { label: "Target Depth", value: "Intradermal / Superficial Reticular Dermis" },
      { label: "Technique", value: "Multi-puncture mesotherapy, micro-cannula, or microneedling assist" },
      { label: "Treatment Course", value: "3 sessions at 4-week intervals" },
    ],
    applications: [
      "Crepey, thin, and fragile facial and neck skin",
      "Superficial fine lines, horizontal neck rings, and chest wrinkles",
      "Enlarged pores, uneven skin texture, and loss of firmness",
    ],
    benefits: [
      "Zero downtime skin redensification without volumetric enlargement",
      "Continuous structural collagen stimulation over 12+ months",
      "Excellent adjunct treatment alongside energy-based laser and RF procedures",
    ],
    certificates: [
      { label: "CE Certified", reference: "Medical Device Directive" },
      { label: "ISO 13485", reference: "Quality Management Standard" },
    ],
    image: "/brand/dermatology/kiusera-l-01.webp",
    imageAlt: "Kiusera L Liquid Poly-L-Lactic Acid Skin Booster Vial and Box",
    gallery: [
      "/brand/dermatology/kiusera-l-02.webp",
    ],
    video: "",
    videoPoster: "",
  },
  /* ---- beaumed · PDNA ----------------------------------------------------
     From beaumed's PDNA sheets: "What is PDNA", the PDNA protocol table and
     the product comparison. Only SiiLK PDNA Platinum is carried; Lexna PDNA
     and haPN 70 are on the same sheets and were left out on purpose. No
     certificates are listed on the sheets, so none are claimed here.
     ------------------------------------------------------------------------ */
  {
    slug: "siilk-pdna-platinum",
    name: "SiiLK PDNA Platinum",
    brand: "beaumed",
    category: "Polynucleotide (PDNA)",
    line: "injectables",
    summary:
      "PolyNucleotide (PDNA 4 mg/mL) with hyaluronic acid, glutathione, tranexamic acid and peptides with growth factors, for wrinkles, acne scars, hydration, skin whitening, melasma and skin elasticity.",
    overview:
      "SiiLK PDNA Platinum combines PDNA (PolyNucleotide 4 mg/mL) with hyaluronic acid (5 mg/mL), glutathione (2 mg/mL), tranexamic acid (2 mg/mL) and peptides with growth factors. PolyNucleotide, derived from salmon DNA, promotes skin regeneration and enhances the elasticity of skin tissue. It is compatible with human DNA, and is safe and effective for the human body. Delivered into the dermis by direct injection or MTS, for the face, neck, décolleté and any area with a skin concern.",
    features: [
      "PDNA (PolyNucleotide) 4 mg/mL, derived from salmon DNA",
      "HA (Hyaluronic Acid) 5 mg/mL",
      "Glutathione 2 mg/mL and Tranexamic Acid 2 mg/mL",
      "Peptides with growth factors",
      "Packaging: 3 mL × 5 vials",
    ],
    specs: [
      { label: "Composition", value: "PDNA 4 mg/mL · HA 5 mg/mL · Glutathione 2 mg/mL · Tranexamic Acid 2 mg/mL · Peptides with Growth Factors" },
      { label: "Package", value: "3 mL × 5 vials" },
      { label: "Method", value: "Direct injection (30G–34G needle) or MTS (meso injector, meso roller)" },
      { label: "Layer", value: "Dermis" },
      { label: "Injection Depth", value: "Direct: 0.5–1 mm (superficial dermis) · MTS: 0.25–0.5 mm" },
      { label: "Injection Spacing", value: "Direct: 0.5–2 cm apart · MTS: 0.1–0.5 cm apart" },
      { label: "Dose", value: "Direct: 0.02–0.05 mL per point · MTS: desired amount" },
      { label: "Treatment Course", value: "One vial per treatment, every 2 weeks, for 3 to 5 treatments" },
      { label: "Treatment Areas", value: "Face, neck, décolleté and any area with a skin concern" },
    ],
    applications: [
      "Wrinkles improvement",
      "Skin curing and restructuring",
      "Acne scars",
      "Hydration and moisture",
      "Skin whitening",
      "Treating melasma",
      "Skin elasticity and regeneration",
    ],
    benefits: [
      "Promotes skin regeneration and collagen production",
      "Enhances the elasticity of skin tissue",
      "Helps restore damaged cells and tissue",
      "Visible results may appear 3–4 weeks after the procedure; the best results show once the full course is complete",
    ],
    certificates: [],
    image: "/brand/dermatology/siilk-pdna-platinum-03.webp",
    imageAlt: "SiiLK PDNA Platinum vial and box",
    gallery: [
      "/brand/dermatology/siilk-pdna-platinum-01.webp",
    ],
    video: "",
    videoPoster: "",
  },
  /* ---- GENEXIA · Pharmabeau ----------------------------------------------
     From Pharmabeau's GENEXIA brochure: the overview, "Why Plant-Derived
     Exosomes?", the highlights, "How GENEXIA Works", the protocol, the
     how-to-use steps and the packing info. TribuCare sells V1 (the powder)
     and V2 (the activator) together as one pack, and the Skin and Hair uses
     share one preparation, so this is one product carrying both protocols.
     No certificates are listed, so none are claimed.
     ------------------------------------------------------------------------ */
  {
    slug: "genexia",
    name: "GENEXIA",
    brand: "GENEXIA",
    category: "Plant-Derived Exosomes",
    line: "injectables",
    summary:
      "Plant-derived exosome solution for skin and scalp regeneration, sold as a V1 powder and V2 activator pack that delivers purified exosomes deep into the skin.",
    overview:
      "GENEXIA is a safe and innovative exosome-based skin revitalizing solution. It enhances skin regeneration and scalp health by delivering purified exosomes and active ingredients deep into the skin. Its nano-size vesicles, derived from plant stem cells, play an important role in accelerating cell repair, improving skin elasticity and restoring a healthy skin balance. Exosomes carry bioactive molecules — DNA, RNA and proteins — and act as intercellular signalling mediators: they penetrate the skin surface, activate fibroblasts, and stimulate collagen and elastin production while reducing inflammation and strengthening hydration, for healthy, firm and smooth skin.",
    features: [
      "Plant-derived exosomes: nano-size vesicles from plant stem cells",
      "Formulated with Lactobacillus, Sodium DNA and Peptides",
      "Rich in functional bioactives: antioxidants and growth factors",
      "Two-vial pack: V1 powder (35 mg) and V2 activator (5.0 mL)",
      "One preparation for both skin and scalp treatment",
      "Delivered with an MTS device (meso injector or meso roller)",
    ],
    specs: [
      { label: "Active", value: "Plant-derived exosomes · Lactobacillus · Sodium DNA · Peptides" },
      { label: "Package", value: "V1 powder 35 mg × 1 vial · V2 activator 5.0 mL × 1 vial" },
      { label: "Preparation", value: "Inject the V2 activator into the V1 powder vial and shake gently for 2 minutes until fully dissolved" },
      { label: "Device", value: "Meso injector or meso roller" },
      { label: "Depth", value: "0.25–0.5 mm" },
      { label: "Spacing", value: "0.1–0.5 cm" },
      { label: "Dose", value: "0.02–0.05 mL" },
      { label: "Interval · Skin", value: "Every week for the first 2 sessions, then every 2 weeks for the next 2" },
      { label: "Interval · Hair", value: "Every 2 weeks for at least 3 months" },
      { label: "Treatment Areas", value: "Skin: face, neck · Hair: hair loss areas" },
    ],
    applications: [
      "Cell regeneration: stimulates new cell growth for healthier, revitalized skin",
      "Skin barrier repair: strengthens the skin's defense and moisture retention",
      "Anti-inflammatory action: soothes irritation and reduces redness or swelling",
      "Hair follicle activation: energizes follicles to support hair growth",
      "Skin elasticity, scalp health and a healthy skin balance",
    ],
    benefits: [
      "High safety and biocompatibility: minimizes the risk of immune response and disease transmission",
      "Sustainable and ethical: a natural supply from plants",
      "Stimulates collagen and elastin production",
      "High-purity exosome delivery deep into the skin",
    ],
    certificates: [],
    image: "/brand/dermatology/genexia-v1-v2-01.webp",
    imageAlt: "GENEXIA V1 exosome powder and V2 activator vials",
    gallery: [],
    video: "",
    videoPoster: "",
  },
];

/**
 * The two business lines, in the order TribuCare states them. Headings are
 * derived from the catalogue rather than restated, so a product can never
 * appear under a heading it does not belong to. `groupBy` picks which field
 * those headings come from: devices read by function, injectables by brand.
 */
export const productLines = [
  {
    id: "devices" as const,
    number: "01",
    label: "Professional Aesthetic & Dermatology Devices",
    groupBy: "category" as const,
    blurb:
      "Energy-based systems for dermatologists, clinics and aesthetic centres, installed and supported by our own field engineers.",
  },
  {
    id: "injectables" as const,
    number: "02",
    label: "Professional Aesthetic Injectables",
    groupBy: "brand" as const,
    blurb:
      "Regenerative and volumising injectables supplied to licensed practitioners, with protocol training delivered alongside.",
  },
];

/** Headings for a line, in catalogue order, with their products. */
export function categoriesFor(line: "devices" | "injectables") {
  const inLine = products.filter((p) => p.line === line);
  const key = productLines.find((l) => l.id === line)?.groupBy ?? "category";
  const order: string[] = [];
  for (const p of inLine) if (!order.includes(p[key])) order.push(p[key]);
  return order.map((category) => ({
    category,
    items: inLine.filter((p) => p[key] === category),
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

  /** Brands on this page. Keys match `brandLogos`. */
  brands: [
    "Zimmer Medical",
    "Rejuran",
    "beaumed",
    "AGEX Beauty",
    "BV Laser",
    "AMI",
    "GENEXIA",
  ],

  /**
   * Hero visual. Taken from the homepage's own Professional Dermatology card
   * rather than restated, so the section a visitor clicked from and the page
   * they land on show the same thing — and so replacing the shot in one place
   * changes both.
   */
  image: verticals[0].image,

  /**
   * Hero slideshow. The shot above cross-fades through these in order. The hero
   * reads the length, so adding or removing one needs no code change, and a
   * single slide simply renders as a still.
   *
   * Slide one is framed to sit flush on the section's bottom edge; two and three
   * are wider crops that park against the same corner with headroom above.
   */
  heroSlides: [
    {
      src: "/brand/dermatology/derma-hero-1.webp",
      alt: "A clinic laser system beside a smiling model, with a South Korean flag.",
      width: 1362,
      height: 1155,
    },
    {
      src: "/brand/dermatology/derma-hero-rejuran.webp",
      alt: "A Rejuran Healer firming cream tube and cartons.",
      width: 1024,
      height: 1536,
      // Cut-out product shots — scaled up and pulled in from the section's
      // bottom-right corner (which they scale from), then pushed down so the
      // cluster only ever runs off the section's bottom edge, never the sides.
      imageClassName:
        "lg:origin-bottom-right lg:-translate-x-[38px] lg:translate-y-[240px] lg:scale-[1.1]",
    },
    {
      src: "/brand/dermatology/derma-hero-agex.webp",
      alt: "A line-up of AGEX Beauty professional skincare bottles and cartons.",
      width: 1024,
      height: 1536,
      imageClassName:
        "lg:origin-bottom-right lg:-translate-x-[38px] lg:translate-y-[240px] lg:scale-[1.1]",
    },
  ],

  /** Hero promo video. Empty until supplied; the hero renders without it. */
  video: "",
  videoPoster: "",
  videoTitle: "TribuCare dermatology solutions",

  /**
   * Trust block, sitting between the catalogue and the events rail. Deliberately
   * qualitative — the deck carries no clinic counts, hospital names or customer
   * numbers, so none are stated here. Every claim below is one the deck already
   * makes: exclusive agency for registered European and Korean manufacturers,
   * clinical training with delivery, and local field engineering.
   */
  trusted: {
    eyebrow: "Trusted in Practice",
    headlineLead: "Specified by the clinics",
    headlineAccent: "and hospitals that run them daily.",
    intro:
      "Our systems and injectables work in dermatology clinics, aesthetic centres and hospital departments across Egypt \u2014 chosen by practitioners who stake their results on them, and kept running by the same team that installed them.",
    points: [
      {
        icon: "shield-check",
        title: "Clinically specified",
        body: "Every system we carry is a registered medical device from a German, Italian or Korean manufacturer, selected against the protocols practitioners here actually run.",
      },
      {
        icon: "graduation-cap",
        title: "Trained before it is used",
        body: "No device leaves without clinical training. Our trainers run the first sessions in the clinic so the team is confident from day one.",
      },
      {
        icon: "life-buoy",
        title: "Supported for its lifetime",
        body: "Field engineers, consumables and spare parts are held locally, so a system stays in service instead of waiting on a shipment.",
      },
    ],
    settingsLabel: "In daily use across",
    settings: [
      "Dermatology clinics",
      "Hospital dermatology departments",
      "Aesthetic centres",
      "Plastic surgery practices",
      "Laser centres",
      "Medical spas",
    ],
  },

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
