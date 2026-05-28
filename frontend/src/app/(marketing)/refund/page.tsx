import { pageMetadata } from "@/lib/seo";
import { RefundContent } from "./RefundContent";

export const metadata = pageMetadata("/refund");

export default function RefundPage() {
  return <RefundContent />;
}
