import * as site from "./site";

/**
 * Arabic copy for the dermatology vertical.
 *
 * Brand names, model numbers and slugs are not translated — they inherit from
 * English through the deep merge. What is translated is the reader-facing
 * framing: page copy, product categories and summaries.
 */

export const dermatology = {
  eyebrow: "حلول طب الجلد",
  headlineLead: "تقنيات مصمّمة",
  headlineAccent: "للعيادة.",
  intro: site.verticals[0].body,
  audience: "أطباء الجلدية · العيادات · مراكز التجميل",

  image: { alt: site.verticals[0].image.alt },

  heroSlides: [
    { alt: "جهاز ليزر للعيادات بجانب عارضة مبتسمة، مع علم كوريا الجنوبية." },
    { alt: "أنبوب وعبوات كريم الشدّ من ريجوران هيلر." },
    { alt: "مجموعة من عبوات وزجاجات AGEX Beauty للعناية المتخصصة بالبشرة." },
  ],

  videoTitle: "حلول طب الجلد من تريبوكير",

  trusted: {
    eyebrow: "موثوقة في الممارسة",
    headlineLead: "تختارها العيادات",
    headlineAccent: "والمستشفيات التي تشغّلها يوميًا.",
    intro:
      "تعمل أجهزتنا وحقننا في عيادات الجلدية ومراكز التجميل وأقسام المستشفيات في مختلف أنحاء مصر — يختارها ممارسون يراهنون بنتائجهم عليها، ويحافظ على تشغيلها الفريق نفسه الذي ركّبها.",
    points: [
      {
        title: "مواصفات إكلينيكية معتمدة",
        body: "كل جهاز نقدّمه هو جهاز طبي مسجَّل من شركة تصنيع ألمانية أو إيطالية أو كورية، مُختار وفق البروتوكولات التي يطبّقها الممارسون هنا فعليًا.",
      },
      {
        title: "تدريب قبل الاستخدام",
        body: "لا يخرج أي جهاز دون تدريب إكلينيكي. يدير مدرّبونا الجلسات الأولى داخل العيادة ليكون الفريق واثقًا من اليوم الأول.",
      },
      {
        title: "دعم طوال عمر الجهاز",
        body: "مهندسو الخدمة والمستهلكات وقطع الغيار متوفّرون محليًا، فيبقى الجهاز في الخدمة بدلًا من انتظار شحنة.",
      },
    ],
    settingsLabel: "في الاستخدام اليومي لدى",
    settings: [
      "عيادات الجلدية",
      "أقسام الجلدية بالمستشفيات",
      "مراكز التجميل",
      "عيادات جراحة التجميل",
      "مراكز الليزر",
      "المنتجعات الطبية",
    ],
  },

  catalogue: {
    eyebrow: "كتالوج المنتجات",
    headlineLead: "خطّان،",
    headlineAccent: "وفريق دعم واحد.",
    intro:
      "كل جهاز وكل مستحضر حقن أدناه مدعوم بالمهندسين والمدرّبين والدعم الإكلينيكي أنفسهم الذين يأتون معه.",
  },

  support: {
    eyebrow: site.professionals.eyebrow,
    headline: site.professionals.headline,
    headlineAccent: site.professionals.headlineAccent,
    body: site.professionals.body,
    capabilities: site.professionals.capabilities,
  },
};

/** Product detail lives in `./products-dermatology`, which is long enough to
 *  deserve its own file — and carries a clinical-review notice this one does
 *  not need. */
export { products } from "./products-dermatology";


/** The three request types on a product page. */
export const requestKinds = [
  {
    label: "اطلب عرضًا تجريبيًا",
    blurb: "شاهد الجهاز في عيادتك، يشغّله مدرّبنا الإكلينيكي.",
  },
  {
    label: "اطلب عرض سعر",
    blurb: "السعر والتكوين ومدة التوريد لعيادتك.",
  },
  {
    label: "اطلب زيارة دعم فني",
    blurb: "مهندس خدمة في الموقع للتركيب أو الصيانة أو المعايرة.",
  },
];

/** The two catalogue lines. */
export const productLines = [
  {
    label: "أجهزة التجميل وطب الجلد المتخصصة",
    blurb:
      "أنظمة تعتمد على الطاقة لأطباء الجلدية والعيادات ومراكز التجميل، يركّبها ويدعمها مهندسونا الميدانيون.",
  },
  {
    label: "مستحضرات الحقن التجميلية المتخصصة",
    blurb:
      "مستحضرات حقن للتجديد وإضافة الحجم تُورَّد للممارسين المرخّصين، مع تدريب على البروتوكولات يُقدَّم معها.",
  },
];
