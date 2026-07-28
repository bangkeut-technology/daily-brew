import { pageMetadata } from "@/lib/seo";
import { HowItWorksContent } from "./HowItWorksContent";

export const metadata = pageMetadata("/how-it-works");

export default function HowItWorksPage() {
  return <HowItWorksContent />;
}
