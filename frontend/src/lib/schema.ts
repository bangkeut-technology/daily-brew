import { SITE_NAME, SITE_URL } from "@/lib/seo";

/**
 * JSON-LD builders (SEO strategy §11). Render the returned object with the
 * <JsonLd> component. Keep values in sync with pricing/positioning.
 */

export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    url: SITE_URL,
    featureList: [
      "QR code clock-in for staff attendance",
      "NFC tap-to-clock-in (beta)",
      "Per-attendance-record device verification",
      "IP whitelist verification (per-record + per-location)",
      "Three-factor attendance verification",
      "No biometric data collection",
      "No GPS tracking required",
      "Buddy punching prevention",
      "Leave management",
    ],
    offers: [
      { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
      { "@type": "Offer", name: "Espresso", price: "14.99", priceCurrency: "USD" },
      { "@type": "Offer", name: "Double Espresso", price: "39.99", priceCurrency: "USD" },
    ],
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function faqPageSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}

export function articleSchema(input: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    datePublished: input.datePublished,
    mainEntityOfPage: input.url,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}
