import { MediaLibrary } from "@/components/admin/media-picker";
import { adminLocale } from "@/lib/i18n/admin";
import { adminStrings } from "@/lib/i18n/admin-strings";

export async function generateMetadata() {
  const t = adminStrings(await adminLocale());
  return { title: t.media.title };
}

export default async function AdminMediaPage() {
  const t = adminStrings(await adminLocale()).media;
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col px-5 py-8 sm:px-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          {t.title}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">{t.intro}</p>
      </div>
      <div className="mt-6 flex min-h-0 flex-1 flex-col">
        <MediaLibrary />
      </div>
    </div>
  );
}
