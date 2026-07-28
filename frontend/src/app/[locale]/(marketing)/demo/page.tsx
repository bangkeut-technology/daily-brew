import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { DemoContent } from "./DemoContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata("/demo", locale);
}

export default async function DemoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Keeps this route statically rendered despite the translated content below.
  setRequestLocale(locale);

  return <DemoContent />;
}
