"use client";

import { usePathname } from "next/navigation";
import { TribuLogo } from "@/components/brand/logo";
import { WaveField } from "@/components/brand/wave-field";
import { footerNav, contact, company } from "@/content/site";
import { cn } from "@/lib/utils";

const STRIP = "h-3.5";
const INSET = "mx-5 sm:mx-8 lg:mx-12 xl:mx-auto max-w-[78rem]";
const NOTCH = "[--notch:1.75rem] lg:[--notch:2.5rem]";

export function Footer({ embedded = false }: { embedded?: boolean }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const hasContact = Boolean(contact.email || contact.phone || contact.address);

  // If this is the standalone layout Footer on the home page, return null
  // because Partner section on the home page embeds Footer directly.
  if (isHome && !embedded) {
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
              <TribuLogo tone="colour" markClassName="h-10" />
              <p className="mt-6 max-w-xs text-[0.9375rem] leading-relaxed text-ink-soft">
                A healthcare and beauty company operating under{" "}
                {company.legalParent}.
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
                <ul className="mt-6 flex gap-4">
                  {contact.social.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-sm text-ink-soft transition-colors hover:text-brand-700"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
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
                          href={link.href}
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
              &copy; {new Date().getFullYear()} {company.name}. All rights reserved.
            </p>
            <p className="max-w-xl md:text-right">
              All partner brand names and marks are the property of their
              respective owners.
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
        className="absolute inset-x-0 bottom-0 h-[120%] w-[200%] opacity-40 pointer-events-none"
      />
      {cardContent}
    </footer>
  );
}
