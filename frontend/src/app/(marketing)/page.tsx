import { pageMetadata } from "@/lib/seo";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { BuiltForSection } from "@/components/landing/BuiltForSection";
import { IntegrationSection } from "@/components/landing/IntegrationSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { ContactSection } from "@/components/landing/ContactSection";

export const metadata = pageMetadata("/");

export default function HomePage() {
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
