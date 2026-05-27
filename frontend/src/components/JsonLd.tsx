/**
 * Renders a JSON-LD <script> for structured data. Pass any schema object
 * from `@/lib/schema`. Safe in Server Components.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inline; no user input flows here.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
