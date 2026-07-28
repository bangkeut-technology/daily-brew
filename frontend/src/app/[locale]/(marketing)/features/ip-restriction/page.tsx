import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { IpRestrictionContent } from "./IpRestrictionContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata("/features/ip-restriction", locale);
}

export default async function IpRestrictionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Keeps this route statically rendered despite the translated content below.
  setRequestLocale(locale);

  return <IpRestrictionContent />;
}
