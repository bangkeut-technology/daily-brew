import { createFileRoute } from '@tanstack/react-router';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PageSeo
        title="DailyBrew — Staff Attendance Tracking for Restaurants"
        description="QR check-in, shift tracking, and leave management for restaurants. Free for up to 10 employees. No hardware, no complexity — just scan and go."
        path="/"
      />
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
