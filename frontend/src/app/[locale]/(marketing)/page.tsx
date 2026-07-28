import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { BuiltForSection } from "@/components/landing/BuiltForSection";
import { IntegrationSection } from "@/components/landing/IntegrationSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { ContactSection } from "@/components/landing/ContactSection";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata("/", locale);
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Required per route for static rendering — without it the translated
  // sections below opt this page into dynamic rendering.
  setRequestLocale(locale);

  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <BuiltForSection />
      <IntegrationSection />
      <PricingSection />
      <ContactSection />
    </>
  );
}
