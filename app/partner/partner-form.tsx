"use client";

import { useId, useState } from "react";
import { Award, CheckCircle2, Send, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { submitInquiry, type SubmitResult } from "@/lib/forms";

const INTERESTS = [
  "Global Brand Partner (Exclusive Distribution)",
  "Clinic & Aesthetic Center (Device Acquisition)",
  "Physician Medical Training & Certification",
  "Retail & E-commerce Distribution (MLAY / Altesse)",
  "Regional MENA Distributor",
] as const;

const FIELD_CLASS =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-ink transition-colors placeholder:text-ink-faint focus:border-brand-600 focus:outline-none";

const LABEL_CLASS =
  "mb-1.5 block text-xs font-semibold tracking-wider text-ink uppercase";

export function PartnerForm() {
  const id = useId();
  const [state, setState] = useState<"idle" | "sending" | SubmitResult>("idle");
  const [form, setForm] = useState({
    name: "",
    organization: "",
    email: "",
    phone: "",
    type: INTERESTS[0],
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
          Partnership request received
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
          Thank you, <strong className="text-ink">{form.name}</strong>. Our
          partnership director will be in touch about{" "}
          <strong className="text-ink">
            {form.organization || "your organisation"}
          </strong>
          .
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-6 rounded-xl bg-brand-800 px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-900"
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setState("sending");
        setState(await submitInquiry("partnership", form));
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className={LABEL_CLASS}>
            Full name *
          </label>
          <input
            id={`${id}-name`}
            type="text"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            placeholder="Dr. Jane Doe"
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label htmlFor={`${id}-org`} className={LABEL_CLASS}>
            Organization / clinic *
          </label>
          <input
            id={`${id}-org`}
            type="text"
            required
            autoComplete="organization"
            value={form.organization}
            onChange={(e) => set("organization")(e.target.value)}
            placeholder="Global Derma Inc. / Clinic name"
            className={FIELD_CLASS}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-email`} className={LABEL_CLASS}>
            Work email *
          </label>
          <input
            id={`${id}-email`}
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => set("email")(e.target.value)}
            placeholder="partner@company.com"
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label htmlFor={`${id}-phone`} className={LABEL_CLASS}>
            Phone / WhatsApp
          </label>
          <input
            id={`${id}-phone`}
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => set("phone")(e.target.value)}
            placeholder="+20 100 000 0000"
            className={FIELD_CLASS}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-type`} className={LABEL_CLASS}>
          Partnership interest *
        </label>
        <select
          id={`${id}-type`}
          value={form.type}
          onChange={(e) => set("type")(e.target.value)}
          className={FIELD_CLASS}
        >
          {INTERESTS.map((interest) => (
            <option key={interest} value={interest}>
              {interest}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${id}-message`} className={LABEL_CLASS}>
          Message / project details *
        </label>
        <textarea
          id={`${id}-message`}
          required
          rows={4}
          value={form.message}
          onChange={(e) => set("message")(e.target.value)}
          placeholder="Tell us about your brand, clinic equipment needs, or distribution goals in Egypt & MENA..."
          className={FIELD_CLASS}
        />
      </div>

      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-800 px-6 py-4 font-semibold text-white shadow-md transition-all duration-300 hover:bg-brand-900 hover:shadow-lg disabled:pointer-events-none disabled:opacity-70"
      >
        {state === "sending" ? "Sending…" : "Submit partnership inquiry"}
        <Send className="size-4" aria-hidden="true" />
      </button>

      <p aria-live="polite" className="min-h-[1.25rem] text-xs text-ink-faint">
        {done && !state.ok && state.reason === "unconfigured"
          ? "This form isn't connected to our inbox yet — please email us directly so your enquiry reaches the team."
          : done && !state.ok
            ? "Something went wrong sending that. Please try again."
            : ""}
      </p>
    </form>
  );
}

export function PartnerFormPanel() {
  return (
    <Reveal delay={200} className="mt-24" from="scale">
      <div className="card-surface relative overflow-hidden p-8 shadow-xl sm:p-12 lg:grid lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="lg:col-span-5">
          <p className="eyebrow text-brand-600">Get in touch</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink">
            Start a partnership conversation
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-soft">
            Fill out the inquiry form and our partnership development directors
            will contact you to explore joint opportunities.
          </p>

          <ul className="mt-8 space-y-4">
            <li className="flex items-center gap-3">
              <span className="icon-disc size-10 shrink-0">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">
                  Direct board access
                </span>
                <span className="block text-xs text-ink-faint">
                  Inquiries handled directly by division leaders.
                </span>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="icon-disc size-10 shrink-0">
                <Award className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">
                  Strict confidentiality
                </span>
                <span className="block text-xs text-ink-faint">
                  Non-disclosure protocols for brand registration.
                </span>
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-10 rounded-2xl border border-brand-100 bg-brand-50/60 p-6 sm:p-8 lg:col-span-7 lg:mt-0">
          <PartnerForm />
        </div>
      </div>
    </Reveal>
  );
}
