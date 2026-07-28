import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { PricingPageContent } from "./PricingPageContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata("/pricing", locale);
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Keeps this route statically rendered despite the translated content below.
  setRequestLocale(locale);

  return <PricingPageContent />;
}
