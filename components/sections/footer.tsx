"use client";

import { usePathname } from "next/navigation";
import { TribuLogo } from "@/components/brand/logo";
import { WaveField } from "@/components/brand/wave-field";
import { SOCIAL_MARKS } from "@/components/brand/social-marks";
import { localePath, splitLocale, type Locale } from "@/lib/i18n/config";
import type { ContentData } from "@/content/en";
import { cn } from "@/lib/utils";

const STRIP = "h-3.5";
const INSET = "mx-5 sm:mx-8 lg:mx-12 xl:mx-auto max-w-[78rem]";
const NOTCH = "[--notch:1.75rem] lg:[--notch:2.5rem]";

/** Locale-stripped paths whose closing section is `<Partner />`, which brings a
 *  footer of its own. */
const EMBEDS_OWN_FOOTER = new Set(["/", "/about"]);

/**
 * Content arrives as props for the same reason the header's does: this is a
 * client component, and the locale is a root parameter only server components
 * can read.
 */
export function Footer({
  embedded = false,
  locale,
  footerNav,
  contact,
  company,
  ui,
}: {
  embedded?: boolean;
  locale: Locale;
  footerNav: ContentData["footerNav"];
  contact: ContentData["contact"];
  company: ContentData["company"];
  ui: ContentData["ui"]["footer"];
}) {
  const rawPathname = usePathname();
  // The proxy rewrites English to `/en/…`, so the home test has to run against
  // the locale-stripped path or the footer would double up on the Arabic home.
  const pathname = splitLocale(rawPathname ?? "/").path;
  const hasContact = Boolean(contact.email || contact.phone || contact.address);

  // The layout renders a Footer after every page, but `<Partner />` embeds one
  // of its own — the white card rises out of that section, which is why it sits
  // inside it rather than after it. So on any page ending in `<Partner />` the
  // standalone copy has to stand down, or the page gets two.
  //
  // The list is explicit because a footer cannot see what sections a page
  // rendered: it is a sibling of `children`, not a descendant, so no context or
  // ref can reach it. Add a page here when you add `<Partner />` to it — the
  // symptom otherwise is two footers, which is obvious on sight but easy to
  // ship if nobody scrolls to the bottom.
  if (!embedded && EMBEDS_OWN_FOOTER.has(pathname)) {
    return null;
  }

  const cardContent = (
    <div className="relative z-10">
      {/* ---- Shape layer (White Notched Card matching Navbar) -------------
          Full-width strip at bottom, white card rises up with rounded top corners
          and concave fillet curves at the bottom corners. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 [filter:drop-shadow(0_-10px_26px_rgb(7_42_42/0.14))]"
      >
        <div
          className={cn(
            "relative h-full bg-white rounded-t-[1.75rem] lg:rounded-t-[2.5rem]",
            INSET,
            NOTCH,
          )}
        >
          <span className="notch-fillet notch-fillet-bottom-left absolute bottom-3.5 right-full bg-white" />
          <span className="notch-fillet notch-fillet-bottom-right absolute bottom-3.5 left-full bg-white" />
        </div>
        <div className={cn(STRIP, "absolute inset-x-0 bottom-0 bg-white")} />
      </div>

      {/* ---- Content layer (White Mode Typography) ----------------------- */}
      <div className={cn("relative text-ink", INSET)}>
        <div className="px-6 pt-12 pb-14 sm:px-10 md:pt-16 md:pb-16 lg:px-14">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-4">
              <TribuLogo tone="colour" markClassName="h-10" sizes="7rem" />
              <p className="mt-6 max-w-xs text-[0.9375rem] leading-relaxed text-ink-soft">
                {ui.operatingUnder.replace("{parent}", company.legalParent)}
              </p>

              {hasContact && (
                <address className="mt-6 space-y-1.5 text-[0.9375rem] not-italic text-ink-soft">
                  {contact.address && <p>{contact.address}</p>}
                  {contact.email && (
                    <p>
                      <a
                        href={`mailto:${contact.email}`}
                        className="transition-colors hover:text-brand-700"
                      >
                        {contact.email}
                      </a>
                    </p>
                  )}
                  {contact.phone && (
                    <p>
                      <a
                        href={`tel:${contact.phone.replace(/\s/g, "")}`}
                        className="transition-colors hover:text-brand-700"
                      >
                        {contact.phone}
                      </a>
                    </p>
                  )}
                </address>
              )}

              {contact.social.length > 0 && (
                <ul className="mt-6 flex gap-3">
                  {contact.social.map((link) => {
                    const Mark = SOCIAL_MARKS[link.icon];
                    if (!Mark) return null;
                    return (
                      <li key={link.href}>
                        {/* A bare `href`, not `localePath` — every other link
                            in this footer is an internal path that has to pick
                            up the `/ar` prefix, but these are absolute URLs to
                            somebody else's site. `localePath` prepends a slash
                            to anything not already starting with one, so it
                            would turn the address into `/ar/https://…` and 404
                            the lot. The bug never showed because the array
                            shipped empty.

                            The plate is the site's standard interactive
                            `icon-disc`, copied from the dermatology page and
                            the team card — same size step, same hover. The mark
                            sits a step below the `size-5` a lucide icon takes
                            in a `size-10` plate: these are filled glyphs, and a
                            filled glyph at the same box size reads heavier than
                            a stroked one.

                            `aria-label` because the mark is the only content —
                            without it the link has no accessible name at all. */}
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={link.label}
                          className="icon-disc size-10 hover:scale-110 hover:bg-brand-700 hover:text-white"
                        >
                          <Mark className="size-4" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <nav
              aria-label="Footer"
              className="grid gap-10 sm:grid-cols-3 lg:col-span-7 lg:col-start-6"
            >
              {footerNav.map((column) => (
                <div key={column.title}>
                  <h2 className="eyebrow text-brand-600">{column.title}</h2>
                  <ul className="mt-5 space-y-3">
                    {column.links.map((link) => (
                      <li key={`${column.title}-${link.label}`}>
                        <a
                          href={localePath(locale, link.href)}
                          className="text-[0.9375rem] text-ink-soft transition-colors hover:text-brand-700"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className="mt-16 flex flex-col gap-4 border-t border-brand-100 pt-8 text-[0.8125rem] text-ink-faint md:flex-row md:items-center md:justify-between">
            <p>
              {ui.copyright
                .replace("{year}", String(new Date().getFullYear()))
                .replace("{name}", company.name)}
            </p>
            <p className="max-w-xl md:text-end">
{ui.trademarks}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return <footer className="relative pt-8 pb-0 z-10">{cardContent}</footer>;
  }

  return (
    <footer className="ground-deep relative isolate overflow-hidden pt-12 md:pt-16 pb-0">
      <WaveField
        tone="dark"
        lines={26}
        className="absolute left-0 bottom-0 h-[120%] w-[200%] opacity-40 pointer-events-none"
      />
      {cardContent}
    </footer>
  );
}
