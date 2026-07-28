import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { SupportContent } from "./SupportContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata("/support", locale);
}

export default async function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Keeps this route statically rendered despite the translated content below.
  setRequestLocale(locale);

  return <SupportContent />;
}
