/**
 * Emits a schema.org block.
 *
 * One component rather than an inline `<script dangerouslySetInnerHTML>` at
 * every call site, for one reason beyond tidiness: the payload is escaped.
 * `JSON.stringify` leaves `<` alone, so a CMS title containing `</script>`
 * would close the block early and hand the rest of the string to the HTML
 * parser as markup. Replacing `<` with its JSON escape keeps the JSON valid
 * while making that impossible — parsers read `<` back as `<`.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
