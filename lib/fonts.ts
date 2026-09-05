import { Outfit, Figtree, Geist_Mono, Cairo } from "next/font/google";

/**
 * Fonts, shared by both root layouts.
 *
 * Outfit and Figtree carry no Arabic glyphs, so Arabic text set in them falls
 * back to whatever the OS happens to have — which is why bilingual sites so
 * often look broken in one language. Cairo is loaded for Arabic and mapped onto
 * the same two variables under `[dir="rtl"]` in globals.css, so every rule that
 * says `font-display` or `font-sans` keeps working in both languages without a
 * single component knowing which is active.
 *
 * Cairo is the right pairing here: it is a contemporary Arabic sans with a
 * matching geometric feel to Outfit, and it reads naturally to Egyptian
 * readers rather than as a display or Maghrebi face.
 */

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
  // Not preloaded. The fonts module is shared by both locales, and a preload
  // here landed Cairo's two subsets — 64KB — in the head of every English
  // page, where `[dir="rtl"]` never maps the tokens onto it. With the
  // stylesheet inlined, Arabic pages still discover the face from
  // `@font-face` as the document parses; they give up a fraction of a second
  // of preload lead, English pages stop paying for a font they never draw.
  preload: false,
});

export const fontClassNames = `${outfit.variable} ${figtree.variable} ${geistMono.variable} ${cairo.variable}`;
