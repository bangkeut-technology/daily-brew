import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { DeviceVerificationContent } from "./DeviceVerificationContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata("/features/device-verification", locale);
}

export default async function DeviceVerificationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Keeps this route statically rendered despite the translated content below.
  setRequestLocale(locale);

  return <DeviceVerificationContent />;
}
