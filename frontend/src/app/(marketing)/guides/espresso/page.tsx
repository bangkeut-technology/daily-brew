import { pageMetadata } from "@/lib/seo";
import { GuideEspressoContent } from "./GuideEspressoContent";

export const metadata = pageMetadata("/guides/espresso");

export default function GuideEspressoPage() {
  return <GuideEspressoContent />;
}
