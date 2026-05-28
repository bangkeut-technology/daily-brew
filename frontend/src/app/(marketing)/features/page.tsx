import { pageMetadata } from "@/lib/seo";
import { FeaturesContent } from "./FeaturesContent";

export const metadata = pageMetadata("/features");

export default function FeaturesPage() {
  return <FeaturesContent />;
}
