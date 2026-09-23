"use client";

import { useId, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import {
  submitInquiry,
  FIELD_CLASS,
  LABEL_CLASS,
  type SubmitResult,
} from "@/lib/forms";
import type { ContentData } from "@/content/en";

/**
 * The enquiry form at the foot of every product page.
 *
 * One request, not a choice of three: the demo / quotation / support selector
 * was removed because the fields a clinic fills in were the same in every
 * case, and "Details" says what they want better than a button can.
 *
 * Every submission carries the product's name and the address of the page it
 * was sent from, and names the product in its subject line, so an enquiry
 * lands in the inbox already saying which page it came from — including
 * whether it was the English or the Arabic one.
 */
export function ProductRequest({
  productName,
  contact,
  ui,
}: {
  productName: string;
  contact: ContentData["contact"];
  ui: ContentData["ui"]["productRequest"];
}) {
  const id = useId();
  const [state, setState] = useState<"idle" | "sending" | SubmitResult>("idle");
  const [form, setForm] = useState({
    name: "",
    organization: "",
    city: "",
    email: "",
    phone: "",
    message: "",
  });

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const done = typeof state === "object";

  if (done && state.ok) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-700 text-white shadow-lg">
          <CheckCircle2 className="size-8 text-signal-400" aria-hidden="true" />
        </div>
        <h3 className="mt-4 font-display text-2xl font-semibold text-ink">
          {ui.received}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
          {ui.receivedBody
            .replace("{name}", form.name)
            .replace("{product}", productName)}
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-6 rounded-xl bg-brand-800 px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-900"
        >
          {ui.submitAnother}
        </button>
      </div>
    );
  }

  const field = (
    key: keyof typeof form,
    label: string,
    placeholder: string,
    input: { type: string; autoComplete: string; required?: boolean },
  ) => (
    <div>
      <label htmlFor={`${id}-${key}`} className={LABEL_CLASS}>
        {label}
      </label>
      <input
        id={`${id}-${key}`}
        type={input.type}
        required={input.required}
        autoComplete={input.autoComplete}
        value={form[key]}
        onChange={(e) => set(key)(e.target.value)}
        placeholder={placeholder}
        className={FIELD_CLASS}
      />
    </div>
  );

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setState("sending");
        // Product and page first, so they lead the email the endpoint sends.
        setState(
          await submitInquiry("product-enquiry", {
            _subject: `Product enquiry: ${productName}`,
            product: productName,
            page: window.location.href,
            ...form,
          }),
        );
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {field("name", ui.nameLabel, ui.namePlaceholder, {
          type: "text",
          autoComplete: "name",
          required: true,
        })}
        {field("organization", ui.orgLabel, ui.orgPlaceholder, {
          type: "text",
          autoComplete: "organization",
          required: true,
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {field("city", ui.cityLabel, ui.cityPlaceholder, {
          type: "text",
          autoComplete: "address-level2",
          required: true,
        })}
        {field("phone", ui.phoneLabel, ui.phonePlaceholder, {
          type: "tel",
          autoComplete: "tel",
          required: true,
        })}
      </div>

      {field("email", ui.emailLabel, ui.emailPlaceholder, {
        type: "email",
        autoComplete: "email",
        required: true,
      })}

      <div>
        <label htmlFor={`${id}-message`} className={LABEL_CLASS}>
          {ui.messageLabel}
        </label>
        <textarea
          id={`${id}-message`}
          rows={4}
          value={form.message}
          onChange={(e) => set("message")(e.target.value)}
          placeholder={ui.messagePlaceholder}
          className={FIELD_CLASS}
        />
      </div>

      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-800 px-6 py-4 font-semibold text-white shadow-md transition-all duration-300 hover:bg-brand-900 hover:shadow-lg disabled:pointer-events-none disabled:opacity-70"
      >
        {state === "sending" ? ui.sending : ui.submit}
        <Send className="size-4" aria-hidden="true" />
      </button>

      {/* Same honesty as the partner form: until an endpoint is configured
          these say so rather than accepting an enquiry and dropping it. The
          direct contact details render only once there are real ones. */}
      <p aria-live="polite" className="min-h-[1.25rem] text-xs text-ink-faint">
        {done && !state.ok && state.reason === "unconfigured"
          ? contact.email
            ? ui.unconfiguredWithEmail.replace("{email}", contact.email)
            : ui.unconfigured
          : done && !state.ok
            ? ui.failed
            : ""}
      </p>
    </form>
  );
}
