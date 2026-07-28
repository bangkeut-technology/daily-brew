import { pageMetadata } from "@/lib/seo";
import { PricingPageContent } from "./PricingPageContent";

export const metadata = pageMetadata("/pricing");

export default function PricingPage() {
  return <PricingPageContent />;
}
