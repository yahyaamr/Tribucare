"use client";

import { useState } from "react";
import { Reveal } from "@/components/site/reveal";
import { submitInquiry, type SubmitResult } from "@/lib/forms";
import type { ContentData } from "@/content/en";

function statusMessage(state: "idle" | "sending" | SubmitResult) {
  if (typeof state !== "object") return "No spam. Unsubscribe anytime.";
  if (state.ok) return "Thanks — you're on the list.";
  return state.reason === "unconfigured"
    ? "Newsletter delivery isn't connected yet. Please check back shortly."
    : "Something went wrong sending that. Please try again.";
}

export function Newsletter({ ui }: { ui: ContentData["ui"]["sections"]["newsletter"] }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | SubmitResult>("idle");

  return (
    <Reveal delay={200} className="mt-20" from="scale">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r rtl:bg-gradient-to-l from-brand-900 via-brand-800 to-brand-950 p-8 text-white shadow-2xl sm:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-16 -bottom-16 size-80 rounded-full bg-signal-500/10 blur-3xl"
        />

        <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="eyebrow text-signal-400">{ui.eyebrow}</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">
              {ui.headline}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-brand-100/80 sm:text-base">
{ui.body}
            </p>
          </div>

          <div className="lg:col-span-5">
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                setState("sending");
                setState(await submitInquiry("newsletter", { email }));
              }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                {ui.emailLabel}
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={ui.emailPlaceholder}
                className="w-full rounded-xl bg-white/10 px-5 py-3.5 text-sm text-white ring-1 ring-white/20 transition-colors placeholder:text-brand-200/60 focus:bg-white/20 focus:outline-none"
              />
              <button
                type="submit"
                disabled={state === "sending"}
                className="shrink-0 rounded-xl bg-signal-500 px-6 py-3.5 text-sm font-semibold text-brand-950 shadow-md transition-all duration-300 hover:bg-signal-400 disabled:pointer-events-none disabled:opacity-70"
              >
                {state === "sending" ? ui.sending : ui.subscribe}
              </button>
            </form>

            <p aria-live="polite" className="mt-2 text-xs text-brand-200/60">
              {statusMessage(state)}
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
