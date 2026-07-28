import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { HowItWorksContent } from "./HowItWorksContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata("/how-it-works", locale);
}

export default async function HowItWorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Keeps this route statically rendered despite the translated content below.
  setRequestLocale(locale);

  return <HowItWorksContent />;
}
