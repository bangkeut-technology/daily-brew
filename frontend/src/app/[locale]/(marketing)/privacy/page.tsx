import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { PrivacyContent } from "./PrivacyContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata("/privacy", locale);
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Keeps this route statically rendered despite the translated content below.
  setRequestLocale(locale);

  return <PrivacyContent />;
}
