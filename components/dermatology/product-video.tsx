"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A video that costs nothing until it is asked for.
 *
 * The mobile page-weight budget is ~700KB, which a single product film would
 * blow on its own. So what ships is the poster image and a button; the `<video>`
 * is only mounted on click, and `preload="none"` keeps even that from fetching
 * until playback starts. Autoplay is deliberate — the click WAS the request to
 * play, and making the user press play twice is the usual failure of this
 * pattern.
 *
 * Render this only when there is a source. Callers guard rather than this
 * returning null, so an empty `video` field simply omits the section.
 */
export function ProductVideo({
  src,
  poster,
  title,
  className,
  sizes = "(max-width: 1024px) 100vw, 50vw",
}: {
  src: string;
  poster: string;
  title: string;
  className?: string;
  sizes?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className={cn(
        "card-surface relative aspect-video w-full overflow-hidden bg-brand-50",
        className,
      )}
    >
      {playing ? (
        <video
          src={src}
          poster={poster || undefined}
          controls
          autoPlay
          playsInline
          preload="none"
          title={title}
          className="absolute inset-0 size-full bg-brand-950 object-contain"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 size-full cursor-pointer"
        >
          <span className="sr-only">{`Play video: ${title}`}</span>

          {poster && (
            <Image
              src={poster}
              alt=""
              fill
              sizes={sizes}
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
            />
          )}

          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-brand-950/10 to-transparent"
          />

          <span
            aria-hidden="true"
            className="absolute top-1/2 start-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-brand-800 shadow-md backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-white"
          >
            {/* Nudged right so the triangle reads as centred in the disc. */}
            <Play className="size-6 translate-x-0.5 fill-current" />
          </span>
        </button>
      )}
    </div>
  );
}
