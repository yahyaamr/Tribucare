import Link from "next/link";
import { adminBase } from "@/lib/cms/gate";
import { SquarePen } from "lucide-react";
import {
  FALLBACK_ROLE_ICON,
  ROLE_ICON_MAP,
} from "@/components/careers/role-icons";
import type { Role } from "@/lib/cms/types";

/**
 * The roles list.
 *
 * `components/admin/news-table.tsx` with the machinery a fixed set does not
 * need taken out — no status tabs, no search, no delete, no "add" button,
 * because these are the three cards the homepage has rather than a queue that
 * grows. What is left is the same header, the same `card-surface` panel and the
 * same row shape, so it still reads as the same panel.
 *
 * A server component: with nothing to filter and nothing to delete there is no
 * state to hold, and the rows are links.
 */
export function RolesTable({ roles }: { roles: Role[] }) {
  const base = adminBase();
  return (
    <>
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Careers
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          The role cards in the careers section of the homepage. Each card is
          edited in English and Arabic together.
        </p>
      </div>

      <div className="card-surface mt-6 overflow-hidden">
        <ul className="divide-y divide-brand-50">
          {roles.map((role) => {
            const Icon = ROLE_ICON_MAP[role.icon] ?? FALLBACK_ROLE_ICON;
            return (
              <li
                key={role.id}
                className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-brand-50/50"
              >
                <span className="icon-disc size-12 shrink-0">
                  <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`${base}/careers/${role.id}`}
                    className="font-display text-[0.9375rem] font-semibold text-ink transition-colors hover:text-brand-700"
                  >
                    {role.title.en || "Untitled role"}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-ink-faint">
                    {[role.type.en, role.department.en, role.location.en]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {/* The Arabic line is the one an editor cannot check at a
                      glance on the English site, so the list shows whether it
                      is there at all rather than making them open each card. */}
                  <p
                    dir="rtl"
                    lang="ar"
                    className="mt-0.5 truncate text-xs text-ink-faint"
                  >
                    {role.title.ar || "لم تُضَف الترجمة العربية بعد"}
                  </p>
                </div>

                <Link
                  href={`${base}/careers/${role.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-700"
                >
                  <SquarePen className="size-3.5" aria-hidden="true" />
                  Edit
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
