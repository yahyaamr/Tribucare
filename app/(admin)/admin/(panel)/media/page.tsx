import { MediaLibrary } from "@/components/admin/media-picker";

export const metadata = { title: "Media" };

export default function AdminMediaPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col px-5 py-8 sm:px-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Media</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Images available to every post. Upload here, or from inside the
          editor.
        </p>
      </div>
      <div className="mt-6 flex min-h-0 flex-1 flex-col">
        <MediaLibrary />
      </div>
    </div>
  );
}
