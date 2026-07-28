import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { DeleteAccountContent } from "./DeleteAccountContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata("/delete-account", locale);
}

export default async function DeleteAccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Keeps this route statically rendered despite the translated content below.
  setRequestLocale(locale);

  return <DeleteAccountContent />;
}
