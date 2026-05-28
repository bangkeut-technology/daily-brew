import { pageMetadata } from "@/lib/seo";
import { GuideOwnerContent } from "./GuideOwnerContent";

export const metadata = pageMetadata("/guides/owner");

export default function GuideOwnerPage() {
  return <GuideOwnerContent />;
}
