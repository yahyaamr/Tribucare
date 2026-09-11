import { notFound } from "next/navigation";
import { getRoleById } from "@/lib/cms/roles";
import { RoleEditor } from "@/components/admin/role-editor";
import { adminLocale } from "@/lib/i18n/admin";
import { adminStrings } from "@/lib/i18n/admin-strings";

/** `params` is a Promise in Next 16 — synchronous access was removed. */
type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const role = await getRoleById((await params).id);
  const t = adminStrings(await adminLocale());
  return { title: role?.title.en || t.common.untitled };
}

export default async function EditRolePage({ params }: Props) {
  const role = await getRoleById((await params).id);
  if (!role) notFound();

  return <RoleEditor initialRole={role} />;
}
