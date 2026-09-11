import { getCategories } from "@/lib/cms/categories";
import { getNewsTags } from "@/lib/cms/news-tags";
import { getAuthors } from "@/lib/cms/authors";
import { CategoryManager } from "@/components/admin/settings/category-manager";
import { NewsTagManager } from "@/components/admin/settings/news-tag-manager";
import { AuthorManager } from "@/components/admin/settings/author-manager";
import { AdminLanguageSwitch } from "@/components/admin/admin-language-switch";
import { adminLocale } from "@/lib/i18n/admin";
import { adminStrings } from "@/lib/i18n/admin-strings";

export async function generateMetadata() {
  const t = adminStrings(await adminLocale());
  return { title: t.settings.title };
}
export const dynamic = "force-dynamic";

/** A divider naming the section the panels under it belong to. */
function SectionHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex items-baseline gap-3 pt-2 first:pt-0">
      <h2 className="font-display text-sm font-semibold tracking-wide text-ink uppercase">
        {title}
      </h2>
      <span className="text-xs text-ink-faint">{hint}</span>
    </div>
  );
}

export default async function AdminSettingsPage() {
  const [categories, newsTags, authors] = await Promise.all([
    getCategories(),
    getNewsTags(),
    getAuthors(),
  ]);
  const locale = await adminLocale();
  const t = adminStrings(locale);

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      <h1 className="font-display text-2xl font-semibold text-ink">
        {t.settings.title}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">{t.settings.intro}</p>


      <div className="mt-6 space-y-6">
        <section className="card-surface overflow-hidden">
          <div className="border-b border-brand-100 bg-brand-50/50 px-5 py-3.5">
            <h2 className="font-display text-base font-semibold text-ink">
              {t.language}
            </h2>
            <p className="mt-0.5 text-xs text-ink-soft">{t.languageHint}</p>
          </div>
          <div className="p-4">
            <AdminLanguageSwitch
              locale={locale}
              label={t.language}
              variant="full"
            />
          </div>
        </section>

        {/* Grouped by section rather than by kind of list. Two lists both
            called "Categories" side by side is what made the blog's read as
            the only one — the heading above each group is what says which
            section you are editing. */}
        <SectionHeading
          title={t.settings.blogGroup}
          hint={t.settings.blogHint}
        />
        <CategoryManager initial={categories} />
        {/* Authors sit under Blog because the blog is the only thing that has
            them: an Events & News item is published by the company, not by a
            person, and carries no byline. */}
        <AuthorManager initial={authors} />

        <SectionHeading
          title={t.settings.newsGroup}
          hint={t.settings.newsHint}
        />
        <NewsTagManager initial={newsTags} />
      </div>
    </div>
  );
}
