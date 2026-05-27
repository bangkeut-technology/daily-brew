import { JsonLd } from "@/components/JsonLd";
import { faqPageSchema, type FaqItem } from "@/lib/schema";

interface FaqSectionProps {
  heading?: string;
  items: FaqItem[];
}

/**
 * Renders a FAQ block + FAQPage JSON-LD. Uses native <details>/<summary>
 * so it works without JS (server component). Not a form control, so it's
 * fine under the no-native-controls rule.
 */
export function FaqSection({ heading = "Frequently asked questions", items }: FaqSectionProps) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <JsonLd data={faqPageSchema(items)} />
      <h2 className="mb-8 text-center font-serif text-3xl font-semibold text-text-primary">
        {heading}
      </h2>
      <div className="space-y-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="glass-card group p-5 [&_summary]:list-none"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium text-text-primary">
              {item.question}
              <span className="text-coffee transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 leading-7 text-text-secondary">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
