import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { FaqContent } from "./FaqContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata("/faq", locale);
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Keeps this route statically rendered despite the translated content below.
  setRequestLocale(locale);

  return <FaqContent />;
}
