import { requireSession } from "@/lib/cms/session";
import { deleteMedia, listMedia, uploadMedia } from "@/lib/cms/media";

export async function GET() {
  const denied = await requireSession();
  if (denied) return denied;

  return Response.json(
    { items: await listMedia() },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const denied = await requireSession();
  if (denied) return denied;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file was sent." }, { status: 400 });
  }

  try {
    const result = await uploadMedia(file);
    if (!result.ok) return Response.json({ error: result.error }, { status: 400 });
    return Response.json({ item: result.item }, { status: 201 });
  } catch (error) {
    // Almost always a missing or wrong blob token in production. Say so
    // rather than showing the SEO team a bare 500.
    return Response.json(
      {
        error:
          error instanceof Error
            ? `Upload failed: ${error.message}`
            : "Upload failed.",
      },
      { status: 500 },
    );
  }
}

/** The pathname travels as a query parameter rather than a path segment
 *  because it contains slashes (`cms/media/...`). */
export async function DELETE(request: Request) {
  const denied = await requireSession();
  if (denied) return denied;

  const pathname = new URL(request.url).searchParams.get("pathname");
  if (!pathname) {
    return Response.json({ error: "No image specified." }, { status: 400 });
  }

  try {
    await deleteMedia(pathname);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Delete failed." },
      { status: 400 },
    );
  }
}
