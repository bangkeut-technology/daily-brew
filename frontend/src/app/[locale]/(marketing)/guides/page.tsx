import { pageMetadata } from "@/lib/seo";
import { GuidesContent } from "./GuidesContent";

export const metadata = pageMetadata("/guides");

export default function GuidesPage() {
  return <GuidesContent />;
}
