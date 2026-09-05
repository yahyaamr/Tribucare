import type { Metadata } from "next";
import { getContent } from "@/content";
import {
  DEFAULT_LOCALE,
  LOCALES,
  localePath,
  type Locale,
} from "@/lib/i18n/config";
import { isSiteUrlConfigured, siteUrl } from "@/lib/site";
import type { NewsItem, ResolvedPost } from "@/lib/cms/types";
import type { Product } from "@/content/dermatology";

/**
 * Everything a page needs to be found and shared, built once.
 *
 * Next merges metadata per top-level key: a page that sets `openGraph` at all
 * replaces the layout's `openGraph` wholesale, and the same goes for `twitter`
 * and `alternates`. Before this file every route filled those in by hand, and
 * the gaps were exactly what that rule predicts — a Twitter card carrying the
 * homepage's title on every inner page, a blog index with no `hreflang`, a
 * product canonical fixed to English, and no social image anywhere on the site
 * because the file-based one only attaches outside `[lang]`.
 *
 * So pages describe themselves in a few words and this file writes the tags.
 */

/* ------------------------------------------------------------------ urls -- */

/** Absolute form of a site path. Leaves URLs that are already absolute alone. */
export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * The site-wide social card, served by `app/opengraph-image.tsx`.
 *
 * Referenced explicitly rather than relying on the file convention: the file
 * sits at the app root, and file-based metadata only reaches routes beneath its
 * own segment — which the public site, living under `(site)/[lang]`, is not.
 */
export const OG_IMAGE = {
  path: "/opengraph-image",
  width: 1200,
  height: 630,
} as const;

/* ------------------------------------------------------------ alternates -- */

/**
 * Canonical plus every language version of a path, including `x-default`.
 *
 * `x-default` names the page a searcher gets when none of the listed languages
 * match theirs. Without it Google may pick either version arbitrarily; with
 * it the English page, which keeps the site's established URLs, is the one.
 */
export function alternatesFor(
  locale: Locale,
  path: string,
): NonNullable<Metadata["alternates"]> {
  return {
    canonical: localePath(locale, path),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l, localePath(l, path)])),
      "x-default": localePath(DEFAULT_LOCALE, path),
    },
  };
}

/** `og:locale` in the `language_TERRITORY` form Open Graph expects. */
export function ogLocale(locale: Locale) {
  return locale === "ar" ? "ar_EG" : "en_US";
}

/* -------------------------------------------------------------- metadata -- */

export interface PageMetadataInput {
  locale: Locale;
  /** Locale-free path, e.g. `/blog/some-slug`. */
  path: string;
  title: string;
  description: string;
  /** Social-card copy, where it differs from the page's own. */
  ogTitle?: string;
  ogDescription?: string;
  /** Page-specific image; the site-wide card when omitted. */
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  /** Article-only Open Graph fields. */
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: readonly string[];
}

/**
 * Title, description, Open Graph, Twitter and alternates for one page.
 *
 * The layout supplies everything that does not vary per page — the title
 * template, robots, icons, `metadataBase`, verification — so this returns only
 * the keys a page genuinely owns. Every one of them is complete in itself,
 * because of the per-key merge described at the top of the file.
 */
export function pageMetadata(input: PageMetadataInput): Metadata {
  const {
    locale,
    path,
    title,
    description,
    ogTitle = title,
    ogDescription = description,
    type = "website",
  } = input;
  const { company } = getContent(locale);

  const image = input.image
    ? { url: input.image, alt: input.imageAlt ?? ogTitle }
    : {
        url: OG_IMAGE.path,
        width: OG_IMAGE.width,
        height: OG_IMAGE.height,
        alt: `${company.name} — ${company.tagline}`,
      };

  const article =
    type === "article"
      ? {
          publishedTime: input.publishedTime,
          modifiedTime: input.modifiedTime,
          authors: input.authors,
          section: input.section,
          tags: input.tags ? [...input.tags] : undefined,
        }
      : {};

  return {
    title,
    description,
    openGraph: {
      type,
      siteName: company.name,
      locale: ogLocale(locale),
      alternateLocale: LOCALES.filter((l) => l !== locale).map(ogLocale),
      url: localePath(locale, path),
      title: ogTitle,
      description: ogDescription,
      images: [image],
      ...article,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [image.url],
    },
    alternates: alternatesFor(locale, path),
  };
}

/* -------------------------------------------------------------- schemas -- */

/**
 * Stable identifiers so the graph links up: an Article's `publisher` points at
 * the Organization by `@id` instead of restating it, which is what lets a
 * crawler treat every mention across the site as the same entity.
 */
export const ORGANIZATION_ID = `${siteUrl}/#organization`;
export const WEBSITE_ID = `${siteUrl}/#website`;

/** The company mark, as an ImageObject. Google asks for at least 112×112. */
const LOGO = {
  "@type": "ImageObject",
  url: absoluteUrl("/brand/logos/tribucare-mark.png"),
  width: 298,
  height: 298,
} as const;

/** Bare reference to the organisation, for `publisher` and `author` slots. */
export const organizationRef = { "@id": ORGANIZATION_ID } as const;

export function organizationSchema(locale: Locale) {
  const { company, brandGroups, contact } = getContent(locale);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: company.name,
    description: company.description,
    // Only claim an address once the domain is real — see lib/site.ts.
    ...(isSiteUrlConfigured ? { url: siteUrl } : {}),
    logo: LOGO,
    image: LOGO,
    parentOrganization: {
      "@type": "Organization",
      name: "Mondial Investissement Corporation",
      alternateName: "MIC",
    },
    areaServed: [
      { "@type": "Country", name: "Egypt" },
      { "@type": "Place", name: "MENA region" },
    ],
    brand: brandGroups.flatMap((group) =>
      group.items.map((item) => ({ "@type": "Brand", name: item.name })),
    ),
    // Contact details render only once they exist in content/site.ts.
    ...(contact.social.length
      ? { sameAs: contact.social.map((s) => s.href) }
      : {}),
    ...(contact.email || contact.phone
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            ...(contact.email ? { email: contact.email } : {}),
            ...(contact.phone ? { telephone: contact.phone } : {}),
          },
        }
      : {}),
  };
}

export function webSiteSchema(locale: Locale) {
  const { company } = getContent(locale);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: company.name,
    url: absoluteUrl(localePath(locale, "/")),
    inLanguage: locale,
    publisher: organizationRef,
  };
}

/**
 * The trail from the homepage to the current page. Item URLs are absolute, as
 * the spec requires, and localised so the Arabic trail stays on the Arabic
 * site.
 */
export function breadcrumbSchema(
  locale: Locale,
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(localePath(locale, item.path)),
    })),
  };
}

export function articleSchema(post: ResolvedPost, locale: Locale) {
  const url = absoluteUrl(localePath(locale, `/blog/${post.slug}`));
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: post.title,
    description: post.seo.metaDescription.trim() || post.excerpt,
    ...(post.image ? { image: [absoluteUrl(post.image)] } : {}),
    datePublished: post.date,
    // The record's own timestamp, which moves when the author edits — the
    // signal Google reads `dateModified` for.
    dateModified: post.updatedAt || post.date,
    ...(post.author
      ? {
          author: {
            "@type": "Person",
            name: post.author.name,
            ...(post.author.role ? { jobTitle: post.author.role } : {}),
          },
        }
      : { author: organizationRef }),
    publisher: organizationRef,
    // schema.org allows articleSection to repeat.
    articleSection: post.categories,
  };
}

export function newsArticleSchema(item: NewsItem, locale: Locale) {
  const url = absoluteUrl(localePath(locale, `/news/${item.slug}`));
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: item.title,
    description: item.seo.metaDescription.trim() || item.excerpt,
    ...(item.image ? { image: [absoluteUrl(item.image)] } : {}),
    datePublished: item.date,
    dateModified: item.updatedAt || item.date,
    // The organisation is both author and publisher: a news item is published
    // by TribuCare, not bylined to a person.
    author: organizationRef,
    publisher: organizationRef,
    keywords: item.tags,
  };
}

/**
 * A professional device or injectable.
 *
 * No `offers`: these are quoted to clinics, not sold at a listed price, and a
 * Product without a price is still valid schema.org. Everything stated is
 * manufacturer copy already on the page — specs become `additionalProperty`
 * so a crawler reads the same wavelengths and energies the visitor does.
 */
export function productSchema(product: Product, locale: Locale) {
  const url = absoluteUrl(localePath(locale, `/dermatology/${product.slug}`));
  const description = product.summary || product.overview;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    url,
    name: product.name,
    ...(description ? { description } : {}),
    ...(product.image ? { image: [absoluteUrl(product.image)] } : {}),
    brand: { "@type": "Brand", name: product.brand },
    category: product.category,
    ...(product.specs.length
      ? {
          additionalProperty: product.specs.map((spec) => ({
            "@type": "PropertyValue",
            name: spec.label,
            value: spec.value,
          })),
        }
      : {}),
  };
}
