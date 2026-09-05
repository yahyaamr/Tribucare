import type { DeepPartial } from "../index";
import type { ContentData } from "../en";
import * as site from "./site";
import {
  dermatology,
  products,
  productLines,
  requestKinds,
} from "./dermatology";
import { altesse, altesseCollections } from "./altesse";
import { mlay, mlayCollections } from "./mlay";

/**
 * Arabic content.
 *
 * Modern Standard Arabic in the register Egyptian professional and medical
 * audiences read — not colloquial Egyptian, and not the Gulf-inflected
 * marketing Arabic that reads as imported.
 *
 * This is a **deep override** of the English bundle, not a copy of it. Only
 * translated strings appear; slugs, hrefs, image paths, icon keys, numeric
 * dimensions and brand names inherit. Arrays merge by index, so the order here
 * must match the English files exactly — see `content/index.ts` for the merge.
 */

const meta = {
  title: "تريبوكير — مجموعة الرعاية الصحية والتجميل | طب الجلد وتقنيات التجميل والعناية بالبشرة",
  ogTitle: "تريبوكير — نرتقي بالجمال. ندعم الرعاية.",
  category: "الرعاية الصحية والتجميل",
  keywords: [
    "تريبوكير",
    "شركة رعاية صحية وتجميل",
    "حلول طب الجلد المتخصصة",
    "طب التجميل في مصر",
    "أجهزة تجميل منزلية",
    "تقنيات التجميل في الشرق الأوسط",
    "مستحضرات العناية الطبية بالبشرة",
    "Altesse Soin",
    "MLAY مصر",
  ],
};

const ui = {
  skipToContent: "تخطَّ إلى المحتوى",
  languageSwitch: "التبديل إلى الإنجليزية",
  openMenu: "فتح القائمة",
  closeMenu: "إغلاق القائمة",
  partnerCta: "كن شريكًا لنا",
  homeAria: "تريبوكير — الرئيسية",
  primaryNav: "التنقّل الرئيسي",
  primaryNavMobile: "التنقّل الرئيسي — الهاتف",

  sections: {
    reach: {
      headlineLead: "حجم تستطيع علامة عالمية",
      headlineAccent: "أن تبني عليه حضورها في المنطقة.",
      intro:
        "أربعة فروع رئيسية في كبرى مولات مصر، وتغطية للتجارة الإلكترونية على مستوى الجمهورية، وفريق يتّسع لدعم القطاعات الثلاثة في وقت واحد.",
    },
    teamsNote:
      "خبراء متخصصون في طب الجلد ولوجستيات الأجهزة والتعليم الإكلينيكي وتوزيع التجزئة في مصر ومنطقة الشرق الأوسط.",
    flagshipBranches: "الفروع الرئيسية",
    retailEcommerce: "التجزئة والتجارة الإلكترونية",
    railHint: "اسحب أو مرّر للمزيد ←",
    brandsWeRepresent: "العلامات التي نمثّلها",
    officialBrandPartner: "شريك رسمي للعلامة",
    ownFlagshipBrand: "علامتنا الرئيسية",
    partnerPage: {
      eyebrow: "الشراكات الاستراتيجية",
      headlineLead: "لنبنِ معًا المرحلة القادمة في",
      headlineAccent: "التجميل والرعاية الصحية.",
      selectCategory: "اختر فئة لترى كيف نتعاون مع مؤسستك.",
    },
    expertise: {
      eyebrow: "مجالات خبرتنا",
      headlineLead: "شركة واحدة.",
      headlineAccent: "ثلاثة قطاعات مترابطة.",
      intro:
        "تقنيات طب الجلد وأجهزة التجميل المنزلية ومستحضرات العناية الطبية ليست ثلاثة أنشطة منفصلة، بل طريق واحد إلى السوق — المعرفة الإكلينيكية نفسها والبنية التوزيعية نفسها وفرق الدعم نفسها، مطبَّقة على كل مستوى من مستويات القطاع.",
    },
    brands: {
      eyebrow: "منظومة العلامات",
      headlineLead: "خبرة عالمية.",
      headlineAccent: "حضور محلي.",
      intro:
        "تريبوكير ليست شركة علامة واحدة، بل المنصة التي تقدّم علامات متخصصة — ممثَّلة ومملوكة — للمتخصصين والمستهلكين في المنطقة.",
      annualRevenue: "إيرادات سنوية من هذا الخط",
      flagshipBrand: "العلامة الرئيسية لتريبوكير",
    },
    teams: {
      eyebrow: "فريقنا",
      headlineLead: "نجاحنا يقوم على",
      headlineAccent: "فريق ديناميكي يضم أكثر من 100 متخصص",
      intro:
        "عبر إدارات متخصصة متعددة، يشكّل كل فريق حلقة وصل أساسية بين علامات الرعاية الصحية المعروفة عالميًا والممارسين والعيادات والمستهلكين الذين نخدمهم على مستوى الجمهورية.",
      railLabel: "إدارات تريبوكير",
      featuredBadge: "أكثر من 100 متخصص",
      featuredTitle: "فريق تريبوكير للرعاية الصحية والتجميل",
      featuredAlt: "فريق تريبوكير",
    },
    blog: {
      eyebrow: "رؤى وأخبار",
      headlineLead: "أحدث الرؤى الإكلينيكية",
      headlineAccent: "وتقنيات التجميل",
      intro:
        "ابقَ على اطلاع بالأوراق العلمية في طب الجلد، وتحليلات علوم التركيبات، وتحليلات السوق من متخصصي تريبوكير.",
      cta: "تصفّح مدونة ورؤى تريبوكير",
      stepperLabel: "أحدث الرؤى",
    },
    newsletter: {
      eyebrow: "النشرة البريدية",
      headline: "ابقَ على اطلاع بالرؤى الإكلينيكية وتقنيات التجميل",
      body: "أوراق علمية ربع سنوية في طب الجلد، وإعلانات إطلاق العلامات، وجداول التدريب الطبي — تصلك مباشرةً إلى بريدك.",
      emailLabel: "بريد العمل",
      emailPlaceholder: "أدخل بريد العمل...",
      subscribe: "اشترك",
      sending: "جارٍ الإرسال…",
    },
  },

  footer: {
    operatingUnder: "شركة للرعاية الصحية والتجميل تعمل ضمن {parent}.",
    copyright: "© {year} {name}. جميع الحقوق محفوظة.",
    trademarks: "جميع أسماء وعلامات الشركاء التجارية مملوكة لأصحابها.",
  },

  blog: {
    metaTitle: "رؤى وأخبار",
    metaDescription:
      "رؤى إكلينيكية وابتكارات في التركيبات وتطوّرات في الأجهزة وتحليلات للسوق، من الفريق الاستشاري الطبي في تريبوكير.",
    ogTitle: "رؤى تريبوكير — طب الجلد والعناية بالبشرة وتقنيات التجميل",
    eyebrow: "رؤى تريبوكير",
    headlineLead: "نرتقي بطب الجلد،",
    headlineAccent: "والعناية بالبشرة وتقنيات التجميل",
    intro:
      "استكشف الرؤى الإكلينيكية وابتكارات التركيبات وتطوّرات الأجهزة وتحليلات السوق من الفريق الاستشاري الطبي في تريبوكير.",
    allArticles: "كل المقالات",
    searchLabel: "ابحث في المقالات والموضوعات",
    searchPlaceholder: "ابحث في المقالات والموضوعات...",
    filterLabel: "تصفية المقالات حسب التصنيف",
    featuredBadge: "مقال مميّز",
    readArticle: "اقرأ المقال",
    latestArticles: "أحدث المقالات",
    showingOne: "عرض مقال واحد",
    showingMany: "عرض {count} مقالات",
    emptyTitle: "لا توجد مقالات مطابقة لبحثك",
    emptyBody: "جرّب إعادة ضبط التصنيف أو تعديل كلمات البحث.",
    resetFilters: "إعادة ضبط التصفية",
    backToArticles: "العودة إلى المقالات",
    exploreAll: "تصفّح كل المقالات",
    relatedEyebrow: "قراءات ذات صلة",
    relatedHeadline: "المزيد من رؤى تريبوكير",
    viewAll: "عرض كل المقالات",
    read: "اقرأ",
    keyTakeaways: "أبرز النقاط",
    quoteAttribution: "التحرير الإكلينيكي في تريبوكير",
    minRead: "دقائق قراءة",
  },

  news: {
    metaTitle: "الأخبار",
    metaDescription:
      "إعلانات وإطلاقات وشراكات ومستجدّات من تريبوكير في مصر ومنطقة الشرق الأوسط وشمال أفريقيا.",
    ogTitle: "أخبار تريبوكير — الإعلانات والمستجدّات",
    eyebrow: "غرفة أخبار تريبوكير",
    headlineLead: "إعلانات وإطلاقات",
    headlineAccent: "ومستجدّات.",
    intro:
      "إطلاقات العلامات والشراكات ومحطات التدريب ومستجدّات الشركة من مختلف قطاعات تريبوكير.",
    allNews: "كل الأخبار",
    searchLabel: "ابحث في الأخبار",
    searchPlaceholder: "ابحث في الأخبار...",
    filterLabel: "تصفية الأخبار حسب الوسم",
    featuredBadge: "خبر مميّز",
    readItem: "اقرأ المزيد",
    latestNews: "أحدث الأخبار",
    showingOne: "عرض خبر واحد",
    showingMany: "عرض {count} أخبار",
    emptyTitle: "لا توجد أخبار مطابقة لبحثك",
    emptyBody: "جرّب إعادة ضبط الوسم أو تعديل كلمات البحث.",
    resetFilters: "إعادة ضبط التصفية",
    noneTitle: "لا يوجد شيء هنا بعد",
    noneBody: "ستظهر أخبار تريبوكير وإعلاناتها هنا.",
    backToNews: "العودة إلى الأخبار",
    relatedEyebrow: "المزيد من غرفة الأخبار",
    relatedHeadline: "أحدث أخبار تريبوكير",
    viewAll: "عرض كل الأخبار",
  },
  pages: {
    exploreCatalogue: "تصفّح الكتالوج",
    talkToTeam: "تحدّث إلى فريقنا",
    shopStore: "تسوّق من متجر تريبوكير",
    flagshipSkincare: "علامتنا الرئيسية للعناية بالبشرة",
    exclusiveAgent: "الوكيل الحصري في مصر",
    backToDermatology: "العودة إلى حلول طب الجلد",
    representedBy: "ممثَّلة في مصر بواسطة تريبوكير",
    fullSpecsTitle: "المواصفات الكاملة متاحة عند الطلب",
    fullSpecsBody: "وثائق فنية تفصيلية ومعلومات إكلينيكية عن",
    lineDevice: "جهاز",
    lineInjectable: "مستحضر حقن",
    requestCta: "اطلب عرضًا تجريبيًا أو عرض سعر أو زيارة دعم",
    blockOverview: "نظرة عامة",
    blockFeatures: "أبرز الخصائص",
    blockSpecs: "المواصفات",
    blockApplications: "الاستخدامات الإكلينيكية",
    blockBenefits: "المزايا",
    blockGallery: "معرض الصور",
    partnershipModels: "نماذج الشراكة",
    moreFromLine: "المزيد من هذا الخط",
    otherDevices: "أجهزة أخرى نوفّرها",
    otherInjectables: "مستحضرات حقن أخرى نوفّرها",
    requestEyebrow: "تواصل معنا",
    requestBody: "اختر ما تحتاجه وسيتابع معك فريقنا الإكلينيكي مباشرةً.",
    viewAll: "عرض الكل",
    tailoredCollaboration: "تعاون مصمَّم لكل شريك",
  },

  events: {
    upcoming: "قادمة",
    past: "فعالية سابقة",
    calendar: "الأجندة",
    searchLabel: "ابحث في الفعاليات والمواقع",
    emptyTitle: "لا توجد فعاليات مطابقة لبحثك",
    resetFilters: "إعادة ضبط التصفية",
  },

  productRequest: {
    nameLabel: "الاسم بالكامل *",
    namePlaceholder: "د. جيهان أحمد",
    orgLabel: "العيادة / المؤسسة *",
    orgPlaceholder: "اسم العيادة",
    emailLabel: "بريد العمل *",
    emailPlaceholder: "doctor@clinic.com",
    phoneLabel: "الهاتف / واتساب *",
    phonePlaceholder: "+20 100 000 0000",
    sending: "جارٍ الإرسال…",
    prompts: {
      demo: {
        placeholder:
          "العلاجات التي تنوي تقديمها، وموقع عيادتك، والموعد الذي يناسبك للعرض التجريبي.",
        submit: "اطلب عرضًا تجريبيًا",
      },
      quotation: {
        placeholder:
          "التكوين أو الملحقات التي تحتاجها، والكمية، والإطار الزمني الذي تعمل ضمنه.",
        submit: "اطلب عرض سعر",
      },
      support: {
        placeholder:
          "العطل أو الخدمة المطلوبة، والرقم التسلسلي للجهاز إن توفّر، وعنوان الموقع.",
        submit: "اطلب زيارة دعم فني",
      },
    },
  },
  partnerForm: {
    getInTouch: "تواصل معنا",
    heading: "ابدأ محادثة شراكة",
    body: "املأ نموذج الاستفسار وسيتواصل معك مديرو تطوير الشراكات لبحث الفرص المشتركة.",
    boardAccess: "تواصل مباشر مع الإدارة",
    boardAccessBody: "الاستفسارات يتعامل معها مديرو الأقسام مباشرةً.",
    confidentiality: "سرية تامة",
    confidentialityBody: "بروتوكولات عدم إفشاء لتسجيل العلامات.",
    received: "تم استلام طلب الشراكة",
    receivedBody: "شكرًا لك، {name}. سيتواصل معك مدير الشراكات بخصوص {org}.",
    yourOrganisation: "مؤسستك",
    submitAnother: "إرسال طلب آخر",
    nameLabel: "الاسم بالكامل *",
    namePlaceholder: "د. جيهان أحمد",
    orgLabel: "المؤسسة *",
    orgPlaceholder: "اسم الشركة أو العيادة",
    emailLabel: "بريد العمل *",
    emailPlaceholder: "partner@company.com",
    phoneLabel: "رقم الهاتف",
    phonePlaceholder: "+20 100 000 0000",
    typeLabel: "مجال الشراكة *",
    messageLabel: "الرسالة / تفاصيل المشروع *",
    messagePlaceholder:
      "أخبرنا عن علامتك، أو احتياجات عيادتك من الأجهزة، أو أهدافك في التوزيع بمصر والمنطقة...",
    interests: [
      "علامة عالمية شريكة (توزيع حصري)",
      "عيادة أو مركز تجميل (اقتناء أجهزة)",
      "تدريب طبي واعتماد للأطباء",
      "توزيع تجزئة وتجارة إلكترونية (MLAY / Altesse)",
      "موزّع إقليمي في الشرق الأوسط",
    ],
    submit: "أرسل طلب الشراكة",
    sending: "جارٍ الإرسال…",
  },

  notFound: {
    eyebrow: "خطأ 404",
    headlineLead: "هذه الصفحة",
    headlineAccent: "غير موجودة.",
    body: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
    cta: "العودة إلى الصفحة الرئيسية",
  },

  pageMeta: {
    dermatology: {
      title: "حلول طب الجلد",
      description:
        "أجهزة ومستحضرات حقن تجميلية وجلدية متخصصة للعيادات في مصر والشرق الأوسط — إزالة الشعر بالليزر، وليزر الفراكشنال ثاني أكسيد الكربون، والترددات الراديوية بالإبر الدقيقة، والبولي نيوكليوتيدات وحمض عديد اللاكتيك، مع التدريب والدعم الميداني.",
      ogTitle: "حلول طب الجلد من تريبوكير — أجهزة ومستحضرات حقن",
      ogDescription:
        "أجهزة ومستحضرات حقن تجميلية متخصصة لأطباء الجلدية والعيادات ومراكز التجميل، مع تدريب إكلينيكي ودعم فني.",
    },
    mlay: {
      title: "MLAY — أجهزة تجميل للاستخدام المنزلي",
      description:
        "الموزّع الرسمي الحصري لـ MLAY في مصر. إزالة شعر بتقنية IPL باحترافية المراكز المتخصصة، وتبريد بالسفير، وأجهزة ضوئية متعددة الوظائف، مع ضمان ودعم على مستوى الجمهورية.",
      ogTitle: "MLAY مصر — تقنيات التجميل المنزلية | تريبوكير",
      ogDescription:
        "اكتشف أجهزة MLAY عالية الأداء لإزالة الشعر بتقنية IPL مع التبريد بالسفير، الموزَّعة حصريًا في مصر عبر تريبوكير.",
    },
    altesse: {
      title: "Altesse Soin — مستحضرات العناية الطبية بالبشرة",
      description:
        "العلامة الرئيسية لتريبوكير في العناية بالبشرة. تركيبات مستوحاة من الممارسة الإكلينيكية تجمع علوم طب الجلد المتقدمة بمكوّنات فعّالة عالية الجودة، مهيّأة لمناخ الشرق الأوسط.",
      ogTitle: "Altesse Soin — مستحضرات العناية الطبية بالبشرة | تريبوكير",
      ogDescription:
        "تعرّف على روتين Altesse Soin المطوَّر بإشراف أطباء الجلدية: إصلاح الحاجز مع Cica، والتفتيح مع Lustré، والعناية الواقية المهيّأة للمناخ.",
    },
    events: {
      title: "الفعاليات والأخبار",
      description:
        "مؤتمرات وأيام تدريب عملي وإطلاق علامات ومعارض إقليمية — الأجندة التي يقوم عليها التعليم والدعم اللذان يعتمد عليهما شركاء تريبوكير.",
      ogTitle: "فعاليات وأخبار تريبوكير — مؤتمرات وتدريب وإطلاقات",
      ogDescription:
        "مؤتمرات وأيام تدريب عملي وإطلاق علامات ومعارض إقليمية في مصر ومنطقة الشرق الأوسط.",
    },
    partner: {
      title: "كن شريكًا لنا",
      description:
        "توزيع إقليمي حصري، وشراكات في الأجهزة الإكلينيكية، وتدريب الأطباء، والتوزيع في الشرق الأوسط — كن شريكًا لتريبوكير في مصر والمنطقة.",
      ogTitle: "كن شريكًا لتريبوكير — التجميل والرعاية الصحية في مصر والمنطقة",
      ogDescription:
        "توزيع إقليمي حصري، وشراكات في الأجهزة الإكلينيكية، وتدريب الأطباء، والتوزيع في الشرق الأوسط.",
    },
  },
};


export const ar: DeepPartial<ContentData> = {
  company: site.company,
  nav: site.nav,
  hero: site.hero,
  missionVision: site.missionVision,
  verticals: site.verticals,
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
  footerNav: site.footerNav,
  careers: site.careers,

  dermatology,
  products,
  productLines,
  requestKinds,
  altesseCollections,
  mlayCollections,
  altesse,
  mlay,

  meta,
  ui,
};
