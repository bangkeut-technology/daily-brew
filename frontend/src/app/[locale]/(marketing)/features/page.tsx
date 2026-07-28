import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { FeaturesContent } from "./FeaturesContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata("/features", locale);
}

export default async function FeaturesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Keeps this route statically rendered despite the translated content below.
  setRequestLocale(locale);

  return <FeaturesContent />;
}
