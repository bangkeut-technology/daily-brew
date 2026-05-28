import { pageMetadata } from "@/lib/seo";
import { TermsContent } from "./TermsContent";

export const metadata = pageMetadata("/terms");

export default function TermsPage() {
  return <TermsContent />;
}
