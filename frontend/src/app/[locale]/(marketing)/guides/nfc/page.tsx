import { pageMetadata } from "@/lib/seo";
import { GuideNfcContent } from "./GuideNfcContent";

export const metadata = pageMetadata("/guides/nfc");

export default function GuideNfcPage() {
  return <GuideNfcContent />;
}
