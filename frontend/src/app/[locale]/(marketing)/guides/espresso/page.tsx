import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { GuideEspressoContent } from "./GuideEspressoContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata("/guides/espresso", locale);
}

export default async function GuideEspressoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Keeps this route statically rendered despite the translated content below.
  setRequestLocale(locale);

  return <GuideEspressoContent />;
}
