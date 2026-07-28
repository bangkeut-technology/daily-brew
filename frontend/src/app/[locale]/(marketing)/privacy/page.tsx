import { pageMetadata } from "@/lib/seo";
import { PrivacyContent } from "./PrivacyContent";

export const metadata = pageMetadata("/privacy");

export default function PrivacyPage() {
  return <PrivacyContent />;
}
