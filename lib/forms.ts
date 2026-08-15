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

export async function submitInquiry(
  kind: "partnership" | "newsletter",
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
