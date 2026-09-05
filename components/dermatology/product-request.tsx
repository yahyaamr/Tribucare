"use client";

import { useId, useState } from "react";
import {
  CheckCircle2,
  FileText,
  MonitorPlay,
  Send,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  submitInquiry,
  FIELD_CLASS,
  LABEL_CLASS,
  type SubmitResult,
} from "@/lib/forms";
import type { RequestKind } from "@/content/dermatology";
import type { ContentData } from "@/content/en";

const ICONS: Record<string, LucideIcon> = {
  "monitor-play": MonitorPlay,
  "file-text": FileText,
  wrench: Wrench,
};

/** What each request actually asks for, so the form is not one form in three hats. */


/**
 * The three product requests, and the form behind whichever is selected.
 *
 * One form rather than three: the fields a clinic fills in are the same in
 * every case, so three separate forms would be three places to keep in step.
 * What the selection genuinely changes is carried through — the heading, the
 * prompt, the submit label, and the `kind` sent to the endpoint, which is what
 * routes a service call away from a sales desk.
 *
 * The product's name travels with the submission, so an enquiry never arrives
 * without saying what it is about.
 */
export function ProductRequest({
  productName,
  requestKinds,
  contact,
  ui,
}: {
  productName: string;
  requestKinds: ContentData["requestKinds"];
  contact: ContentData["contact"];
  ui: ContentData["ui"]["productRequest"];
}) {
  const id = useId();
  const [kind, setKind] = useState<RequestKind>("demo");
  const [state, setState] = useState<"idle" | "sending" | SubmitResult>("idle");
  const [form, setForm] = useState({
    name: "",
    organization: "",
    email: "",
    phone: "",
    message: "",
  });

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const done = typeof state === "object";
  const active = requestKinds.find((r) => r.id === kind)!;

  if (done && state.ok) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-700 text-white shadow-lg">
          <CheckCircle2 className="size-8 text-signal-400" aria-hidden="true" />
        </div>
        <h3 className="mt-4 font-display text-2xl font-semibold text-ink">
          Request received
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
          Thank you, <strong className="text-ink">{form.name}</strong>. Our team
          will be in touch about{" "}
          <strong className="text-ink">{productName}</strong>.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-6 rounded-xl bg-brand-800 px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-900"
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Selector. Real `aria-pressed` buttons, and selecting one visibly
          changes the form below rather than only recolouring the button. */}
      <div
        role="group"
        aria-label="What would you like to request?"
        className="grid gap-3 sm:grid-cols-3"
      >
        {requestKinds.map((request) => {
          const Icon = ICONS[request.icon];
          const isActive = request.id === kind;

          return (
            <button
              key={request.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setKind(request.id)}
              className={cn(
                "group rounded-2xl border p-4 text-start transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isActive
                  ? "border-brand-600 bg-brand-900 text-white shadow-md"
                  : "border-brand-100 bg-white text-ink hover:border-brand-300 hover:shadow-sm",
              )}
            >
              <span
                className={cn(
                  "size-10",
                  isActive
                    ? "icon-disc bg-signal-500 text-brand-950"
                    : "icon-disc group-hover:bg-brand-700 group-hover:text-white",
                )}
              >
                {Icon && <Icon className="size-5" aria-hidden="true" />}
              </span>
              <span className="mt-3 block text-sm font-semibold">
                {request.label}
              </span>
              <span
                className={cn(
                  "mt-1 block text-xs leading-relaxed",
                  isActive ? "text-brand-100/80" : "text-ink-faint",
                )}
              >
                {request.blurb}
              </span>
            </button>
          );
        })}
      </div>

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setState("sending");
          setState(
            await submitInquiry(`request-${kind}`, {
              ...form,
              product: productName,
              request: active.label,
            }),
          );
        }}
        className="mt-8 space-y-4"
      >
        {/* Announced, because the heading changes when the selection does and a
            screen-reader user would otherwise not know the form had switched. */}
        <p aria-live="polite" className="text-sm font-semibold text-ink">
          {active.label} — {productName}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-name`} className={LABEL_CLASS}>
              {ui.nameLabel}
            </label>
            <input
              id={`${id}-name`}
              type="text"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => set("name")(e.target.value)}
              placeholder={ui.namePlaceholder}
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label htmlFor={`${id}-org`} className={LABEL_CLASS}>
              {ui.orgLabel}
            </label>
            <input
              id={`${id}-org`}
              type="text"
              required
              autoComplete="organization"
              value={form.organization}
              onChange={(e) => set("organization")(e.target.value)}
              placeholder={ui.orgPlaceholder}
              className={FIELD_CLASS}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-email`} className={LABEL_CLASS}>
              {ui.emailLabel}
            </label>
            <input
              id={`${id}-email`}
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => set("email")(e.target.value)}
              placeholder={ui.emailPlaceholder}
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label htmlFor={`${id}-phone`} className={LABEL_CLASS}>
              {ui.phoneLabel}
            </label>
            <input
              id={`${id}-phone`}
              type="tel"
              required
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => set("phone")(e.target.value)}
              placeholder={ui.phonePlaceholder}
              className={FIELD_CLASS}
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${id}-message`} className={LABEL_CLASS}>
            Details
          </label>
          <textarea
            id={`${id}-message`}
            rows={4}
            value={form.message}
            onChange={(e) => set("message")(e.target.value)}
            placeholder={ui.prompts[kind].placeholder}
            className={FIELD_CLASS}
          />
        </div>

        <button
          type="submit"
          disabled={state === "sending"}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-800 px-6 py-4 font-semibold text-white shadow-md transition-all duration-300 hover:bg-brand-900 hover:shadow-lg disabled:pointer-events-none disabled:opacity-70"
        >
          {state === "sending" ? ui.sending : ui.prompts[kind].submit}
          <Send className="size-4" aria-hidden="true" />
        </button>

        {/* Same honesty as the partner form: until an endpoint is configured
            these say so rather than accepting an enquiry and dropping it. The
            direct contact details render only once there are real ones. */}
        <p aria-live="polite" className="min-h-[1.25rem] text-xs text-ink-faint">
          {done && !state.ok && state.reason === "unconfigured"
            ? contact.email
              ? `This form isn't connected to our inbox yet — please email ${contact.email} so your request reaches the team.`
              : "This form isn't connected to our inbox yet, so please contact us directly — your request has not been sent."
            : done && !state.ok
              ? "Something went wrong sending that. Please try again."
              : ""}
        </p>
      </form>
    </div>
  );
}
