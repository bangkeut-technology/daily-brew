import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { TermsContent } from "./TermsContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata("/terms", locale);
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Keeps this route statically rendered despite the translated content below.
  setRequestLocale(locale);

  return <TermsContent />;
}
