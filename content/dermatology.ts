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
    image: "/brand/dermatology/ami-rex-an-main.webp",
    imageAlt: "AMI REX-AN DUAL Long-pulsed Nd:YAG and Alexandrite Laser System",
    gallery: [
      "/brand/dermatology/ami-rex-an-studio.jpg",
      "/brand/dermatology/ami-rex-an-studio-24.jpg",
      "/brand/dermatology/ami-rex-an-studio-19.jpg",
      "/brand/dermatology/ami-rex-an-studio-4.jpg",
    ],
    video: "",
    videoPoster: "",
  },
  {
    slug: "ids-tridi",
    name: "IDS Tridi",
    brand: "IDS",
    category: "Laser Hair Reduction",
    line: "devices",
    summary:
      "High-power 2,500W 3-Wave Diode Laser (755nm + 808nm + 1064nm) with Intelligent AI Parameter Optimization and Tridi UP skin revitalization.",
    overview:
      "The TRIDI 3-Wave Diode Laser from IDS is a next-generation hair removal and skin conditioning workstation. By delivering three synchronized wavelengths (755nm Alexandrite spectrum, 808nm Gold Standard Diode, and 1064nm Nd:YAG spectrum) simultaneously, TRIDI addresses the complete anatomical depth of hair follicles from superficial bulges to deep bulbs. Featuring an AI-powered Intelligent Hair Removal (IHR) interface, high-speed DynaMotion in-motion gliding at 10Hz, and the patented Tridi UP (Brightening, Tightening, Lifting) protocol, TRIDI combines speed, efficacy, and patient comfort.",
    features: [
      "Synchronized 3-Wave Technology (755nm + 808nm + 1064nm) emitted simultaneously",
      "2,500W Peak Optical Power with sub-millisecond to 100ms pulse durations",
      "Intelligent Hair Removal (IHR) with AI-guided parameter selection by anatomical zone, skin type, and gender",
      "Dual Operational Modes: Stacking Mode (Pulses 4/5/6) and high-speed DynaMotion Mode (10Hz)",
      "Integrated Sapphire Contact Cooling with continuous 1°C epidermal protection",
      "Tridi UP (BTL) Protocol: Non-invasive brightening, tightening, and dermal lifting",
      "Optional TriV Handpiece with collimated beam for localized vascular and telangiectasia treatment",
    ],
    specs: [
      { label: "Laser Type", value: "3-Wave Diode Laser (755 nm, 808 nm, 1064 nm)" },
      { label: "Peak Power", value: "2,500 W" },
      { label: "Repetition Rate", value: "1 – 10 Hz (DynaMotion Mode)" },
      { label: "Pulse Duration", value: "2 – 100 ms" },
      { label: "Spot Shapes & Sizes", value: "Square & Circle (12 × 24 mm, 12 × 12 mm, Ø6 mm)" },
      { label: "Cooling Tip Temperature", value: "Continuous Contact Cooling at 1°C" },
      { label: "Electrical Requirements", value: "230 V, Single Phase, 50/60 Hz" },
      { label: "Dimensions & Weight", value: "400 × 640 × 1000 mm, 70 kg" },
    ],
    applications: [
      "Full-body Hair Removal (Arms, beard, chest, axilla, groin, legs, and delicate zones)",
      "Tridi UP Skin Revitalization (Skin brightening, pore refinement, dermal tightening & lifting)",
      "Vascular Lesions (Telangiectasia, facial redness via optional TriV handpiece)",
    ],
    benefits: [
      "Safe and painless treatments with advanced 1°C continuous sapphire contact cooling",
      "Rapid treatment times covering full back or legs in under 15 minutes",
      "Effective across all Fitzpatrick skin types (I to VI) and fine, stubborn hairs",
      "Multi-purpose clinic ROI with both hair removal and Tridi UP skin tightening",
    ],
    certificates: [
      { label: "CE Certified", reference: "CE 0197 Medical Device Directive" },
      { label: "ISO 13485", reference: "International Quality Standard" },
      { label: "GMP Certified", reference: "Good Manufacturing Practice" },
    ],
    image: "/brand/dermatology/ids-tridi.webp",
    imageAlt: "IDS TRIDI 3-Wave Diode Laser Workstation",
    gallery: [
      "/brand/tridi_catalog_p1.png",
      "/brand/tridi_catalog_p2.png",
    ],
    video: "",
    videoPoster: "",
  },
  {
    slug: "bvlaser-fractional-co2",
    name: "BVLASER Fractional CO2",
    brand: "BV Laser",
    category: "Fractional CO2 Laser",
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
    image: "/brand/dermatology/bvlaser-co2-main.webp",
    imageAlt: "BVLASER Fractional CO2 Laser System",
    gallery: [
      "/brand/dermatology/bvlaser-co2-2.webp",
      "/brand/dermatology/bvlaser-co2-6.webp",
    ],
    video: "",
    videoPoster: "",
  },
  {
    slug: "ami-mt-smart",
    name: "AMI MT-SMART",
    brand: "AMI",
    category: "Microneedling RF",
    line: "devices",
    summary:
      "Precision Fractional Microneedle Radiofrequency system with vacuum-assisted delivery, adjustable needle depths (0.5–3.5mm), and bipolar/monopolar energy.",
    overview:
      "The AMI MT-SMART combines minimally invasive micro-needling with therapeutic RF energy delivered directly into the reticular dermis. Equipped with vacuum-assisted tip stabilization and high-precision motor control, it delivers targeted thermal coagulation zones at exact depths from 0.5mm to 3.5mm without epidermal thermal injury. Ideal for skin tightening, acne scar remodeling, pore refinement, and active acne reduction.",
    features: [
      "Vacuum-assisted suction handpiece for uniform needle penetration and minimal pain",
      "Adjustable penetration depth from 0.5 mm to 3.5 mm in 0.1 mm increments",
      "Dual RF modes: Bipolar RF for localized dermal tightening and Monopolar RF for deep tissue lifting",
      "Gold-plated insulated and non-insulated microneedle cartridges (25, 49, and 81 pins)",
      "Smart impedance feedback system for constant, reliable RF energy delivery",
    ],
    specs: [
      { label: "RF Frequency", value: "2 MHz (Bipolar & Monopolar)" },
      { label: "Max Power", value: "50 W" },
      { label: "Needle Depth", value: "0.5 mm – 3.5 mm (0.1 mm step adjustment)" },
      { label: "Cartridge Types", value: "25-pin, 49-pin, 81-pin (Insulated / Non-insulated)" },
      { label: "Suction Level", value: "1 – 4 Levels (Vacuum Assist)" },
      { label: "Display", value: "10.4-inch Color LCD Touch Screen" },
    ],
    applications: [
      "Acne Scar Revision and Texture Smoothing",
      "Non-surgical Facial Contouring and Jawline Tightening",
      "Enlarged Pores and Sebum Regulation",
      "Neck and Décolletage Skin Laxity",
      "Striae (Stretch Marks) and Post-surgical Scars",
    ],
    benefits: [
      "All-season, all-phototype safety with minimal risk of post-inflammatory hyperpigmentation",
      "Rapid patient recovery with 24-hour downtime",
      "Customizable treatment depth for delicate periorbital to thick cheek tissue",
    ],
    certificates: [
      { label: "CE Certified", reference: "Medical Device Certification" },
      { label: "ISO 13485", reference: "Quality Management" },
      { label: "MFDS Approved", reference: "South Korea" },
    ],
    image: "/brand/dermatology/ami-mt-smart.webp",
    imageAlt: "AMI MT-SMART Fractional Microneedle RF System",
    gallery: [
      "/brand/dermatology/ami-mt-smart.webp",
    ],
    video: "",
    videoPoster: "",
  },

  /* ---- 02 / Professional Aesthetic Injectables -------------------------- */
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
    image: "/brand/dermatology/rejuran-healer.webp",
    imageAlt: "Rejuran Healer 2% Polynucleotide Skin Booster Syringes and Packaging",
    gallery: [
      "/brand/dermatology/rejuran-healer.webp",
    ],
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
    image: "/brand/dermatology/rejuran-s.webp",
    imageAlt: "Rejuran S Acne Scar Polynucleotide Injectable",
    gallery: [
      "/brand/dermatology/rejuran-s.webp",
    ],
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
    image: "/brand/dermatology/rejuran-i.webp",
    imageAlt: "Rejuran I Eye Treatment Polynucleotide Injectable",
    gallery: [
      "/brand/dermatology/rejuran-i.webp",
    ],
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
    image: "/brand/dermatology/rejuran-hb-plus.webp",
    imageAlt: "Rejuran HB Plus Hydro Booster Injectable",
    gallery: [
      "/brand/dermatology/rejuran-hb-plus.webp",
    ],
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
    image: "/brand/dermatology/kiusera-p.webp",
    imageAlt: "Kiusera P Poly-L-Lactic Acid Collagen Stimulator Vial and Box",
    gallery: [
      "/brand/dermatology/kiusera-p.webp",
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
    image: "/brand/dermatology/kiusera-l.webp",
    imageAlt: "Kiusera L Liquid Poly-L-Lactic Acid Skin Booster Vial and Box",
    gallery: [
      "/brand/dermatology/kiusera-l.webp",
    ],
    video: "",
    videoPoster: "",
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

  /** Brands on this page. Keys match `brandLogos`. */
  brands: [
    "Zimmer Medical",
    "Rejuran",
    "beaumed",
    "IDS",
    "AGEX Beauty",
    "BV Laser",
    "AMI",
    "Kiusera",
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
