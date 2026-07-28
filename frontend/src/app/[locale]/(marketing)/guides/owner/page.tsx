import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { GuideOwnerContent } from "./GuideOwnerContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata("/guides/owner", locale);
}

export default async function GuideOwnerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Keeps this route statically rendered despite the translated content below.
  setRequestLocale(locale);

  return <GuideOwnerContent />;
}
