import { ensureRolesSeeded } from "@/lib/cms/roles";
import { RolesTable } from "@/components/admin/roles-table";
import { adminLocale } from "@/lib/i18n/admin";
import { adminStrings } from "@/lib/i18n/admin-strings";

export async function generateMetadata() {
  const t = adminStrings(await adminLocale());
  return { title: t.careers.title };
}

/** Same as the news list: the panel must show what the store holds right now,
 *  not what it held when this page was last built. */
export const dynamic = "force-dynamic";

export default async function CareersPage() {
  return (
    <div className="mx-auto max-w-[100rem] px-5 py-8 sm:px-8">
      <RolesTable roles={await ensureRolesSeeded()} />
    </div>
  );
}
