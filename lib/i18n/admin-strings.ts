import type { Locale } from "./config";

/**
 * The admin panel's own strings.
 *
 * Kept apart from `content/` on purpose: that is marketing copy the SEO team
 * edits and the public reads, this is software chrome. Mixing them would put
 * "Move to trash" in the same file as the homepage headline.
 *
 * Arabic here is the same register as the site — Modern Standard Arabic as
 * Egyptian professionals read it — with the interface conventions people
 * already know from Arabic software: «حفظ» to save, «نشر» to publish,
 * «مسودة» for a draft.
 */

interface AdminStringsShape {
  dir: "ltr" | "rtl";
  brand: string;
  viewSite: string;
  signOut: string;
  signingOut: string;
  openMenu: string;
  closeMenu: string;
  newPost: string;
  newNews: string;
  sidebarNote: string;
  language: string;
  languageHint: string;
  switchToArabic: string;
  switchToEnglish: string;
  nav: {
    dashboard: string;
    posts: string;
    news: string;
    media: string;
    settings: string;
  };
  status: { published: string; draft: string };
}

const en: AdminStringsShape = {
  dir: "ltr",
  brand: "TribuCare Blog",
  viewSite: "View site",
  signOut: "Sign out",
  signingOut: "Signing out…",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  newPost: "New blog",
  newNews: "Add news",
  sidebarNote:
    "Blogs go live on tribucare.com/blog, news on tribucare.com/news.",
  language: "Language",
  languageHint:
    "Changes the admin panel only. The website's own language is chosen by each visitor.",
  switchToArabic: "العربية",
  switchToEnglish: "English",

  nav: {
    dashboard: "Dashboard",
    posts: "Blogs",
    news: "News",
    media: "Media",
    settings: "Settings",
  },

  status: { published: "Published", draft: "Draft" },
};

const ar: AdminStringsShape = {
  dir: "rtl",
  brand: "مدونة تريبوكير",
  viewSite: "عرض الموقع",
  signOut: "تسجيل الخروج",
  signingOut: "جارٍ تسجيل الخروج…",
  openMenu: "فتح القائمة",
  closeMenu: "إغلاق القائمة",
  newPost: "مقال جديد",
  newNews: "إضافة خبر",
  sidebarNote:
    "المقالات تظهر على tribucare.com/blog، والأخبار على tribucare.com/news.",
  language: "اللغة",
  languageHint:
    "يغيّر لوحة التحكم فقط. لغة الموقع نفسه يختارها كل زائر على حدة.",
  switchToArabic: "العربية",
  switchToEnglish: "English",

  nav: {
    dashboard: "لوحة المعلومات",
    posts: "المقالات",
    news: "الأخبار",
    media: "الوسائط",
    settings: "الإعدادات",
  },

  status: { published: "منشور", draft: "مسودة" },
};

export type AdminStrings = AdminStringsShape;

export function adminStrings(locale: Locale): AdminStrings {
  return locale === "ar" ? ar : en;
}
