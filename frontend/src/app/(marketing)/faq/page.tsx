import { pageMetadata } from "@/lib/seo";
import { FaqContent } from "./FaqContent";

export const metadata = pageMetadata("/faq");

export default function FaqPage() {
  return <FaqContent />;
}
