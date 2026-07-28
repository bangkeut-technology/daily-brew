import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { GuideEmployeeContent } from "./GuideEmployeeContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata("/guides/employee", locale);
}

export default async function GuideEmployeePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Keeps this route statically rendered despite the translated content below.
  setRequestLocale(locale);

  return <GuideEmployeeContent />;
}
