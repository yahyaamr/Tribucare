"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, Send, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_ICONS } from "@/components/careers/role-icons";
import { RoleCard } from "@/components/careers/role-card";
import type { Bilingual, Role } from "@/lib/cms/types";

/**
 * The role editor.
 *
 * `components/admin/news-editor.tsx` with role fields: same sticky action bar,
 * same `Panel` sections, same field styling, same 422-into-a-red-line error
 * handling. What it does differently is show both languages at once — two
 * mirrored columns rather than a language switch — because a role card is five
 * short strings and translating it is one sitting, not two visits.
 *
 * The preview underneath renders the real `<RoleCard>`, the same component the
 * homepage uses, once per language. It is the only way to see the icon choice
 * before saving, and it is why the icon set is small enough to browse.
 */

const FIELD =
  "w-full rounded-xl border border-brand-200/80 bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm transition-colors placeholder:text-ink-faint focus:border-brand-600 focus:outline-none";
const LABEL = "block text-xs font-semibold tracking-wide text-ink uppercase";

function Panel({
  title,
  children,
  dir,
}: {
  title: string;
  children: React.ReactNode;
  dir?: "ltr" | "rtl";
}) {
  return (
    <section className="card-surface overflow-hidden">
      <h2 className="border-b border-brand-100 bg-brand-50/50 px-4 py-2.5 font-display text-sm font-semibold text-ink">
        {title}
      </h2>
      <div dir={dir} className="space-y-3.5 p-4">
        {children}
      </div>
    </section>
  );
}

/** The five card fields, in the order they appear on the card. */
const FIELDS = [
  { key: "title", label: "Title", rows: 0 },
  { key: "type", label: "Employment type", rows: 0 },
  { key: "department", label: "Department", rows: 0 },
  { key: "location", label: "Location", rows: 0 },
  { key: "blurb", label: "Short description", rows: 4 },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

export function RoleEditor({ initialRole }: { initialRole: Role }) {
  const router = useRouter();
  const [role, setRole] = useState(initialRole);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [dirty, setDirty] = useState(false);

  const update = useCallback((patch: Partial<Role>) => {
    setRole((current) => ({ ...current, ...patch }));
    setDirty(true);
    setNotice("");
  }, []);

  const setText = useCallback(
    (field: FieldKey, lang: keyof Bilingual, value: string) => {
      setRole((current) => ({
        ...current,
        [field]: { ...current[field], [lang]: value },
      }));
      setDirty(true);
      setNotice("");
    },
    [],
  );

  // Nothing here autosaves, so leaving with unsaved work has to be a
  // deliberate choice rather than an accident.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save() {
    setSaving(true);
    setErrors({});
    setNotice("");

    const response = await fetch(`/api/admin/careers/${role.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(role),
    }).catch(() => null);

    const body = await response?.json().catch(() => null);

    if (!response?.ok) {
      if (response?.status === 422 && body?.errors) {
        setErrors(body.errors);
      } else {
        setNotice(body?.error ?? "Could not save. Check your connection.");
      }
      setSaving(false);
      return;
    }

    setRole(body.role as Role);
    setDirty(false);
    setSaving(false);
    setNotice("Saved — the homepage is updated.");
    router.refresh();
  }

  /** The card takes one language flattened, the same shape `localiseRole`
   *  produces on the server. Arabic falls back to English exactly as the live
   *  site does, so the preview cannot promise a card the site will not draw. */
  const preview = (lang: keyof Bilingual) => ({
    icon: role.icon,
    title: lang === "ar" ? role.title.ar || role.title.en : role.title.en,
    department:
      lang === "ar" ? role.department.ar || role.department.en : role.department.en,
    type: lang === "ar" ? role.type.ar || role.type.en : role.type.en,
    location:
      lang === "ar" ? role.location.ar || role.location.en : role.location.en,
    blurb: lang === "ar" ? role.blurb.ar || role.blurb.en : role.blurb.en,
  });

  return (
    <>
      {/* ---- Action bar ------------------------------------------------- */}
      <div className="sticky top-12 z-30 border-b border-brand-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[100rem] flex-wrap items-center gap-3 px-5 py-3 sm:px-8">
          <Link
            href="/admin/careers"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-brand-700"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Careers
          </Link>

          {dirty && (
            <span className="text-xs font-medium text-signal-600">
              Unsaved changes
            </span>
          )}

          <div className="ms-auto flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-300 hover:bg-brand-800 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
              Save changes
            </button>
          </div>
        </div>

        {(notice || Object.keys(errors).length > 0) && (
          <div className="mx-auto max-w-[100rem] px-5 pb-3 sm:px-8">
            {notice && (
              <p
                role="status"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-800"
              >
                <Check className="size-4" aria-hidden="true" />
                {notice}
              </p>
            )}
            {Object.keys(errors).length > 0 && (
              <p
                role="alert"
                className="inline-flex items-start gap-1.5 rounded-xl bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700"
              >
                <TriangleAlert
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                {Object.values(errors).join(" ")}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ---- Work area --------------------------------------------------- */}
      <div className="mx-auto max-w-[100rem] px-5 py-6 sm:px-8">
        <Panel title="Icon">
          <p className="text-xs text-ink-faint">
            Pick the icon that fits the role. It sits in the disc at the top of
            the card, and is the same in both languages.
          </p>
          <div
            role="radiogroup"
            aria-label="Role icon"
            className="grid grid-cols-5 gap-2 sm:grid-cols-8"
          >
            {ROLE_ICONS.map(({ key, label, Icon }) => {
              const active = role.icon === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={label}
                  title={label}
                  onClick={() => update({ icon: key })}
                  className={cn(
                    "inline-flex aspect-square items-center justify-center rounded-xl border transition-colors duration-200",
                    active
                      ? "border-brand-600 bg-brand-700 text-white shadow-sm"
                      : "border-brand-200/80 bg-white text-ink-soft hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700",
                  )}
                >
                  <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </Panel>

        {/* Both languages side by side: five short strings each, so a
            translation is one sitting rather than a second visit behind a
            language switch. */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Panel title="English">
            {FIELDS.map(({ key, label, rows }) => (
              <div key={key}>
                <label className={LABEL} htmlFor={`en-${key}`}>
                  {label}
                </label>
                {rows ? (
                  <textarea
                    id={`en-${key}`}
                    rows={rows}
                    value={role[key].en}
                    onChange={(e) => setText(key, "en", e.target.value)}
                    className={cn(FIELD, "mt-1.5 resize-y leading-relaxed")}
                  />
                ) : (
                  <input
                    id={`en-${key}`}
                    type="text"
                    value={role[key].en}
                    onChange={(e) => setText(key, "en", e.target.value)}
                    className={cn(FIELD, "mt-1.5")}
                  />
                )}
              </div>
            ))}
          </Panel>

          <Panel title="العربية — Arabic" dir="rtl">
            {FIELDS.map(({ key, label, rows }) => (
              <div key={key}>
                <label className={LABEL} htmlFor={`ar-${key}`} dir="ltr">
                  {label}
                </label>
                {rows ? (
                  <textarea
                    id={`ar-${key}`}
                    lang="ar"
                    rows={rows}
                    value={role[key].ar}
                    onChange={(e) => setText(key, "ar", e.target.value)}
                    placeholder={role[key].en}
                    className={cn(FIELD, "mt-1.5 resize-y leading-relaxed")}
                  />
                ) : (
                  <input
                    id={`ar-${key}`}
                    lang="ar"
                    type="text"
                    value={role[key].ar}
                    onChange={(e) => setText(key, "ar", e.target.value)}
                    placeholder={role[key].en}
                    className={cn(FIELD, "mt-1.5")}
                  />
                )}
              </div>
            ))}
            <p dir="ltr" className="text-xs text-ink-faint">
              Leave a field empty and the Arabic site shows the English text for
              it, so a partly translated role still renders a complete card.
            </p>
          </Panel>
        </div>

        {/* ---- Preview ---------------------------------------------------- */}
        <h2 className="mt-8 font-display text-sm font-semibold tracking-wide text-ink uppercase">
          Preview
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          The real card, exactly as the homepage draws it.
        </p>
        <div className="ground-deep mt-3 grid gap-5 rounded-[1.75rem] p-5 lg:grid-cols-2">
          <div dir="ltr">
            <RoleCard role={preview("en")} />
          </div>
          <div dir="rtl" lang="ar">
            <RoleCard role={preview("ar")} />
          </div>
        </div>
      </div>
    </>
  );
}
