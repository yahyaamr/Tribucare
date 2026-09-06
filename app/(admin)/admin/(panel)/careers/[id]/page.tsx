import { notFound } from "next/navigation";
import { getRoleById } from "@/lib/cms/roles";
import { RoleEditor } from "@/components/admin/role-editor";

/** `params` is a Promise in Next 16 — synchronous access was removed. */
type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const role = await getRoleById((await params).id);
  return { title: role?.title.en || "Edit role" };
}

export default async function EditRolePage({ params }: Props) {
  const role = await getRoleById((await params).id);
  if (!role) notFound();

  return <RoleEditor initialRole={role} />;
}
