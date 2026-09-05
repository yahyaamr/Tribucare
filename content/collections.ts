/**
 * A store collection, as it is shown on a brand's dedicated page.
 *
 * The brand pages used to render one card per product, which put fifteen MLAY
 * cards and twenty-two Altesse cards on the page — nine of the MLAY ones being
 * replacement lamps that differ only in aperture. A catalogue that long reads
 * as a shop, and the shop already exists: both brands sell through Shopify.
 *
 * So the pages show one card per collection instead, and the card links out to
 * that collection on the brand's own store. Every field here is copy the site
 * already carried — the collection name and blurb are the product-line label
 * and blurb, the badge is the category the products were grouped under — so
 * nothing new had to be written and the Arabic translations carry over.
 */
export type BrandCollection = {
  slug: string;
  /** Matches a key in `brandLogos` — the footer mark is looked up by it. */
  brand: string;
  /** Floating badge on the media band. */
  badge: string;
  name: string;
  summary: string;
  /** Where the link goes, shown in the meta row so the reader knows it leaves. */
  store: string;
  image: string;
  url: string;
};
