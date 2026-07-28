import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { GuideNfcContent } from "./GuideNfcContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata("/guides/nfc", locale);
}

export default async function GuideNfcPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Keeps this route statically rendered despite the translated content below.
  setRequestLocale(locale);

  return <GuideNfcContent />;
}
