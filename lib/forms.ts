/**
 * Form delivery.
 *
 * Neither the partnership form nor the newsletter had anywhere to send to —
 * they set a local "success" flag (and one raised an `alert`) while discarding
 * the submission, so anyone filling them in was told they would be contacted
 * and never was.
 *
 * Point `NEXT_PUBLIC_INQUIRY_ENDPOINT` at a form backend (a route handler,
 * Formspree, HubSpot, whatever the business uses) and both forms start
 * delivering. Until it is set they report honestly that they cannot send,
 * rather than silently dropping the enquiry.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_INQUIRY_ENDPOINT ?? "";

export const isDeliveryConfigured = ENDPOINT.length > 0;

export type SubmitResult =
  | { ok: true }
  | { ok: false; reason: "unconfigured" | "failed" };

/**
 * What the submission is. The three `request-*` kinds come from the dermatology
 * product pages, and are carried through to the endpoint so an enquiry about a
 * specific device arrives already routed — a demo booking and a service call
 * reach different desks.
 */
export type InquiryKind =
  | "partnership"
  | "newsletter"
  | "request-demo"
  | "request-quotation"
  | "request-support";

/**
 * Field and label styling, shared so every form on the site is the same object.
 * They lived in the partner form alone, which meant a second form could only
 * copy them — and two copies of a class string drift.
 */
export const FIELD_CLASS =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-ink transition-colors placeholder:text-ink-faint focus:border-brand-600 focus:outline-none";

export const LABEL_CLASS =
  "mb-1.5 block text-xs font-semibold tracking-wider text-ink uppercase";

export async function submitInquiry(
  kind: InquiryKind,
  payload: Record<string, string>,
): Promise<SubmitResult> {
  if (!isDeliveryConfigured) return { ok: false, reason: "unconfigured" };

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, ...payload }),
    });
    return response.ok ? { ok: true } : { ok: false, reason: "failed" };
  } catch {
    return { ok: false, reason: "failed" };
  }
}
