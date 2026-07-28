import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { GeofencingContent } from "./GeofencingContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata("/features/geofencing", locale);
}

export default async function GeofencingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Keeps this route statically rendered despite the translated content below.
  setRequestLocale(locale);

  return <GeofencingContent />;
}
