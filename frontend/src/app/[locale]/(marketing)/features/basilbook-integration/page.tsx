import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { BasilbookIntegrationContent } from "./BasilbookIntegrationContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata("/features/basilbook-integration", locale);
}

export default async function BasilbookIntegrationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Keeps this route statically rendered despite the translated content below.
  setRequestLocale(locale);

  return <BasilbookIntegrationContent />;
}
