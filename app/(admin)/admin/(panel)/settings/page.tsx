import { getCategories } from "@/lib/cms/categories";
import { getNewsTags } from "@/lib/cms/news-tags";
import { getAuthors } from "@/lib/cms/authors";
import { CategoryManager } from "@/components/admin/settings/category-manager";
import { NewsTagManager } from "@/components/admin/settings/news-tag-manager";
import { AuthorManager } from "@/components/admin/settings/author-manager";
import { AdminLanguageSwitch } from "@/components/admin/admin-language-switch";
import { adminLocale } from "@/lib/i18n/admin";
import { adminStrings } from "@/lib/i18n/admin-strings";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

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
      <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>
      <p className="mt-1 text-sm text-ink-soft">
        The lists blogs and news draw from. The two vocabularies are kept apart:
        blog categories drive the blog, news tags drive the news page, and
        editing one never touches the other.
      </p>


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

        <CategoryManager initial={categories} />
        <NewsTagManager initial={newsTags} />
        {/* Authors are shared on purpose — a person who writes both a blog post
            and an announcement is one person, and correcting their name should
            not have to be done twice. */}
        <AuthorManager initial={authors} />
      </div>
    </div>
  );
}
