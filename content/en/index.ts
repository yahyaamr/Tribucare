import * as site from "../site";
import * as derm from "../dermatology";
import * as altesse from "../altesse";
import * as mlay from "../mlay";

/**
 * The English content bundle — data only, no helpers.
 *
 * A barrel over the existing `content/*.ts` files rather than a rewrite of
 * them: those hold copy that has been checked against the company deck, and
 * moving 7,000 words to satisfy a new folder shape would put the one thing the
 * sourcing rule at the top of `content/site.ts` protects at risk.
 *
 * What is genuinely new is `meta` and `ui` below — strings that used to be
 * hardcoded in the root layout and inside components, and had to be named
 * before they could be translated at all.
 */

const meta = {
  title:
    "TribuCare — Healthcare & Beauty Group | Dermatology, Beauty Tech & Skincare",
  ogTitle: "TribuCare — Advancing beauty. Empowering care.",
  category: "Healthcare & Beauty",
  keywords: [
    "TribuCare",
    "healthcare and beauty company",
    "professional dermatology solutions",
    "medical aesthetics Egypt",
    "home-use beauty devices",
    "beauty technology MENA",
    "medicated skincare",
    "Altesse Soin",
    "MLAY Egypt",
  ],
};

/** Chrome rather than copy: button labels, empty states, aria-labels. */
const ui = {
  skipToContent: "Skip to content",
  languageSwitch: "Switch to Arabic",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  partnerCta: "Partner With Us",
  homeAria: "TribuCare — home",
  primaryNav: "Primary",
  primaryNavMobile: "Primary — mobile",

  /**
   * Section headers that were written into the components rather than into
   * `content/*.ts`. They read as copy, so they belong with copy — and until
   * they were named here they could not be translated at all.
   */
  sections: {
    reach: {
      headlineLead: "Scale that a global brand",
      headlineAccent: "can build a region on.",
      intro:
        "Four flagship branches in Egypt's leading malls, national e-commerce coverage and a team deep enough to support all three verticals at once.",
    },
    teamsNote:
      "Dedicated experts in medical dermatology, device logistics, clinical education, and retail distribution across Egypt & MENA.",
    flagshipBranches: "Flagship branches",
    retailEcommerce: "Retail & e-commerce",
    railHint: "Drag or scroll for more →",
    brandsWeRepresent: "Brands we represent",
    officialBrandPartner: "Official Brand Partner",
    ownFlagshipBrand: "Own Flagship Brand",
    partnerPage: {
      eyebrow: "Strategic Partnerships",
      headlineLead: "Let's build what's next in",
      headlineAccent: "beauty & healthcare.",
      selectCategory:
        "Select a category to see how we collaborate with your organisation.",
    },
    expertise: {
      eyebrow: "Our Expertise",
      headlineLead: "One company.",
      headlineAccent: "Three connected verticals.",
      intro:
        "Dermatology technology, home beauty devices and medicated skincare are not three separate businesses. They are one route to market — the same clinical knowledge, distribution infrastructure and support teams applied at every level of the category.",
    },
    brands: {
      eyebrow: "Brand Ecosystem",
      headlineLead: "Global expertise.",
      headlineAccent: "Local reach.",
      intro:
        "TribuCare is not a single-brand company. It is the platform that brings specialised brands — represented and owned — to professionals and consumers across the region.",
      annualRevenue: "annual revenue from this line",
      flagshipBrand: "TribuCare flagship brand",
    },
    teams: {
      eyebrow: "Our Team",
      headlineLead: "Our success is powered by",
      headlineAccent: "a dynamic team of over 100 professionals",
      intro:
        "Across multiple specialised departments, each team forms an essential connection point between globally renowned healthcare brands and the practitioners, clinics, and consumers we serve nationwide.",
      railLabel: "TribuCare divisions",
      /* The featured card beside the division grid. These three lived in
         `teams.tsx` as literals, which is why they stayed English on the
         Arabic build — a hardcoded string has nowhere to be translated. */
      featuredBadge: "100+ Professionals",
      featuredTitle: "TribuCare Healthcare & Beauty Team",
      featuredAlt: "The TribuCare team",
    },
    blog: {
      eyebrow: "Insights & News",
      headlineLead: "Latest Clinical &",
      headlineAccent: "Beauty Tech Insights",
      intro:
        "Stay informed with dermatological whitepapers, formulation science breakdowns, and market intelligence from TribuCare's specialists.",
      cta: "Explore TribuCare Blog & Insights",
      stepperLabel: "Latest insights",
    },
    newsletter: {
      eyebrow: "Newsletter",
      headline: "Stay updated with clinical & beauty tech insights",
      body: "Quarterly dermatological whitepapers, brand launch announcements and medical training schedules, straight to your inbox.",
      emailLabel: "Work email",
      emailPlaceholder: "Enter your work email...",
      subscribe: "Subscribe",
      sending: "Sending…",
    },
  },

  footer: {
    /** `{parent}` is substituted with `company.legalParent`. */
    operatingUnder: "A healthcare and beauty company operating under {parent}.",
    /** `{year}` and `{name}`. */
    copyright: "© {year} {name}. All rights reserved.",
    trademarks:
      "All partner brand names and marks are the property of their respective owners.",
  },

  blog: {
    metaTitle: "Insights & News",
    metaDescription:
      "Clinical insights, formulation breakthroughs, device innovations and market intelligence from TribuCare's medical advisory team.",
    ogTitle: "TribuCare Insights — Dermatology, Skincare & Beauty Tech",
    eyebrow: "TribuCare Insights",
    headlineLead: "Advancing Dermatology,",
    headlineAccent: "Skincare & Beauty Tech",
    intro:
      "Explore clinical insights, formulation breakthroughs, device innovations, and market intelligence from TribuCare's medical advisory team.",
    allArticles: "All Articles",
    searchLabel: "Search articles and topics",
    searchPlaceholder: "Search articles & topics...",
    filterLabel: "Filter articles by category",
    featuredBadge: "Featured Article",
    readArticle: "Read Article",
    latestArticles: "Latest Articles",
    showingOne: "Showing 1 article",
    showingMany: "Showing {count} articles",
    emptyTitle: "No articles found matching your criteria",
    emptyBody:
      "Try resetting your category filter or adjusting your search keywords.",
    resetFilters: "Reset filters",
    backToArticles: "Back to Articles",
    exploreAll: "Explore All Articles",
    relatedEyebrow: "Related Reading",
    relatedHeadline: "More insights from TribuCare",
    viewAll: "View all articles",
    read: "Read",
    keyTakeaways: "Key Takeaways",
    quoteAttribution: "TribuCare Clinical Editorial",
    minRead: "min read",
  },

  /**
   * The news surfaces. A separate table from `blog` on purpose: the two pages
   * are edited, tagged and read separately, and sharing one dictionary is how
   * a change meant for news ends up on the blog.
   */
  news: {
    metaTitle: "News",
    metaDescription:
      "Announcements, brand launches, partnerships and company updates from TribuCare across Egypt and the MENA region.",
    ogTitle: "TribuCare News — Announcements & Company Updates",
    eyebrow: "TribuCare Newsroom",
    headlineLead: "Announcements,",
    headlineAccent: "launches & updates.",
    intro:
      "Brand launches, partnerships, training milestones and company updates from across TribuCare.",
    allNews: "All News",
    searchLabel: "Search news",
    searchPlaceholder: "Search news...",
    filterLabel: "Filter news by tag",
    featuredBadge: "Featured",
    readItem: "Read more",
    latestNews: "Latest News",
    showingOne: "Showing 1 item",
    showingMany: "Showing {count} items",
    emptyTitle: "No news found matching your criteria",
    emptyBody: "Try resetting the tag filter or adjusting your search keywords.",
    resetFilters: "Reset filters",
    /** Shown when the newsroom has nothing published at all — a different
     *  situation from a filter matching nothing, and a different message. */
    noneTitle: "Nothing here yet",
    noneBody: "TribuCare news and announcements will appear here.",
    backToNews: "Back to News",
    relatedEyebrow: "More from the newsroom",
    relatedHeadline: "Recent TribuCare news",
    viewAll: "View all news",
  },
  /** Page-level UI strings that were hardcoded in the route files. */
  pages: {
    exploreCatalogue: "Explore the catalogue",
    talkToTeam: "Talk to our team",
    shopStore: "Shop on TribuCare Store",
    flagshipSkincare: "Our Flagship Skincare",
    exclusiveAgent: "Exclusive Agent in Egypt",
    backToDermatology: "Back to Dermatology Solutions",
    representedBy: "Represented in Egypt by TribuCare",
    fullSpecsTitle: "Full specifications available on request",
    fullSpecsBody:
      "Detailed technical documentation and clinical information for",
    lineDevice: "Device",
    lineInjectable: "Injectable",
    requestCta: "Request a demo, quote or support visit",
    blockOverview: "Overview",
    blockFeatures: "Key features",
    blockSpecs: "Specifications",
    blockApplications: "Clinical applications",
    blockBenefits: "Benefits",
    blockGallery: "Gallery",
    partnershipModels: "Partnership Models",
    moreFromLine: "More from this line",
    otherDevices: "Other devices we supply",
    otherInjectables: "Other injectables we supply",
    requestEyebrow: "Get in touch",
    requestBody:
      "Choose what you need and our clinical team will follow up directly.",
    viewAll: "View all",
    tailoredCollaboration: "Tailored collaboration for every partner",
  },

  events: {
    upcoming: "Upcoming",
    past: "Past event",
    calendar: "The Calendar",
    searchLabel: "Search events and locations",
    emptyTitle: "No events found matching your criteria",
    resetFilters: "Reset filters",
  },

  productRequest: {
    nameLabel: "Full name *",
    namePlaceholder: "Dr. Jane Doe",
    orgLabel: "Clinic / organisation *",
    orgPlaceholder: "Clinic name",
    emailLabel: "Work email *",
    emailPlaceholder: "doctor@clinic.com",
    phoneLabel: "Phone / WhatsApp *",
    phonePlaceholder: "+20 100 000 0000",
    sending: "Sending…",
    prompts: {
      demo: {
        placeholder:
          "Which treatments you plan to offer, your clinic's location, and when you'd like the demo.",
        submit: "Request demo",
      },
      quotation: {
        placeholder:
          "Configuration or accessories you need, quantity, and any timeline you are working to.",
        submit: "Request quotation",
      },
      support: {
        placeholder:
          "The fault or service needed, the system's serial number if you have it, and your site address.",
        submit: "Request support visit",
      },
    },
  },
  partnerForm: {
    getInTouch: "Get in touch",
    heading: "Start a partnership conversation",
    body: "Fill out the inquiry form and our partnership development directors will contact you to explore joint opportunities.",
    boardAccess: "Direct board access",
    boardAccessBody: "Inquiries handled directly by division leaders.",
    confidentiality: "Strict confidentiality",
    confidentialityBody: "Non-disclosure protocols for brand registration.",
    received: "Partnership request received",
    /** `{name}` and `{org}` are substituted at render time. */
    receivedBody:
      "Thank you, {name}. Our partnership director will be in touch about {org}.",
    yourOrganisation: "your organisation",
    submitAnother: "Submit another inquiry",
    nameLabel: "Full name *",
    namePlaceholder: "Dr. Jane Doe",
    orgLabel: "Organisation *",
    orgPlaceholder: "Global Derma Inc. / Clinic name",
    emailLabel: "Work email *",
    emailPlaceholder: "partner@company.com",
    phoneLabel: "Phone",
    phonePlaceholder: "+20 100 000 0000",
    typeLabel: "Partnership interest *",
    messageLabel: "Message / project details *",
    messagePlaceholder:
      "Tell us about your brand, clinic equipment needs, or distribution goals in Egypt & MENA...",
    interests: [
      "Global Brand Partner (Exclusive Distribution)",
      "Clinic & Aesthetic Center (Device Acquisition)",
      "Physician Medical Training & Certification",
      "Retail & E-commerce Distribution (MLAY / Altesse)",
      "Regional MENA Distributor",
    ],
    submit: "Submit partnership inquiry",
    sending: "Sending…",
  },

  /** Per-page metadata. Titles and descriptions are what a searcher sees in
   *  results, so they are translated rather than left in English on /ar. */
  /** The 404 page. The only copy on the site not traceable to the deck — it
   *  describes the site itself, not the company. */
  notFound: {
    eyebrow: "Error 404",
    headlineLead: "This page",
    headlineAccent: "could not be found.",
    body: "The page you are looking for does not exist or has moved.",
    cta: "Back to the homepage",
  },

  pageMeta: {
    dermatology: {
      title: "Dermatology Solutions",
      description:
        "Professional aesthetic and dermatology devices and injectables for clinics across Egypt and MENA — laser hair reduction, fractional CO2, microneedling RF, PN and poly-L-lactic acid, with training and field support.",
      ogTitle: "TribuCare Dermatology Solutions — Devices & Injectables",
      ogDescription:
        "Professional aesthetic devices and injectables for dermatologists, clinics and aesthetic centres, with clinical training and technical support.",
    },
    mlay: {
      title: "MLAY — Home-Use Beauty Devices",
      description:
        "Official exclusive distributor of MLAY in Egypt. Salon-grade IPL hair removal, sapphire ice-cooling technology, and multi-function light devices with nationwide warranty and retail support.",
      ogTitle: "MLAY Egypt — Home Beauty Technology | TribuCare",
      ogDescription:
        "Discover MLAY's high-performance IPL hair removal devices with sapphire ice-cooling, distributed exclusively in Egypt by TribuCare.",
    },
    altesse: {
      title: "Altesse Soin — Medicated Skincare",
      description:
        "TribuCare's flagship skincare brand. Clinically inspired formulations combining advanced dermatological science with premium active ingredients for Middle Eastern climates.",
      ogTitle: "Altesse Soin — Medicated Skincare | TribuCare",
      ogDescription:
        "Explore Altesse Soin's dermatologist-crafted skincare routines: Cica barrier repair, Lustré brightening, and climate-adapted protective skincare.",
    },
    events: {
      title: "Events & News",
      description:
        "Congresses, hands-on training days, brand launches and regional exhibitions — the calendar behind the education and support TribuCare's partners rely on.",
      ogTitle: "TribuCare Events & News — Congresses, Training & Launches",
      ogDescription:
        "Congresses, hands-on training days, brand launches and regional exhibitions across Egypt and the MENA region.",
    },
    partner: {
      title: "Partner With Us",
      description:
        "Exclusive regional distribution, clinical device partnerships, physician training and MENA distribution — partner with TribuCare across Egypt and the MENA region.",
      ogTitle: "Partner With TribuCare — Beauty & Healthcare in Egypt & MENA",
      ogDescription:
        "Exclusive regional distribution, clinical device partnerships, physician training and MENA distribution.",
    },
  },
};


/**
 * Everything the site renders, in one object.
 *
 * Helpers such as `categoriesFor` are deliberately absent — they are logic, not
 * content, and live in `content/index.ts` where they can be bound to whichever
 * locale's products are being asked for.
 */
export const data = {
  company: site.company,
  nav: site.nav,
  hero: site.hero,
  missionVision: site.missionVision,
  verticals: site.verticals,
  brandLogos: site.brandLogos,
  brandGroups: site.brandGroups,
  altesseLines: site.altesseLines,
  mlayChannels: site.mlayChannels,
  coreValues: site.coreValues,
  events: site.events,
  eventCategories: site.eventCategories,
  professionals: site.professionals,
  reach: site.reach,
  teams: site.teams,
  faq: site.faq,
  partner: site.partner,
  partnerPillars: site.partnerPillars,
  partnerStats: site.partnerStats,
  contact: site.contact,
  footerNav: site.footerNav,
  careers: site.careers,

  products: derm.products,
  productLines: derm.productLines,
  dermatology: derm.dermatology,
  requestKinds: derm.requestKinds,

  altesseCollections: altesse.altesseCollections,
  altesse: altesse.altesse,

  mlayCollections: mlay.mlayCollections,
  mlay: mlay.mlay,

  meta,
  ui,
};

export type ContentData = typeof data;
