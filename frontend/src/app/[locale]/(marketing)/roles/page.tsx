import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { RolesContent } from "./RolesContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata("/roles", locale);
}

export default async function RolesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Keeps this route statically rendered despite the translated content below.
  setRequestLocale(locale);

  return <RolesContent />;
}
