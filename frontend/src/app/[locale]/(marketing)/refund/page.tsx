import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { RefundContent } from "./RefundContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata("/refund", locale);
}

export default async function RefundPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Keeps this route statically rendered despite the translated content below.
  setRequestLocale(locale);

  return <RefundContent />;
}
