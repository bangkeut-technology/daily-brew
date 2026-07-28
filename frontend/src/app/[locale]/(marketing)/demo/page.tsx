import { pageMetadata } from "@/lib/seo";
import { DemoContent } from "./DemoContent";

export const metadata = pageMetadata("/demo");

export default function DemoPage() {
  return <DemoContent />;
}
