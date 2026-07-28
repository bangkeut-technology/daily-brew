import { pageMetadata } from "@/lib/seo";
import { SupportContent } from "./SupportContent";

export const metadata = pageMetadata("/support");

export default function SupportPage() {
  return <SupportContent />;
}
