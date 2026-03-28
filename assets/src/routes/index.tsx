import { createFileRoute } from '@tanstack/react-router';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <ContactSection />
      <LandingFooter />
    </div>
  );
}
