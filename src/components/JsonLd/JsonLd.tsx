interface Props {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Renders a JSON-LD <script> tag for structured data.
 * Place inside a page's <head> via a Server Component.
 */
export default function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
