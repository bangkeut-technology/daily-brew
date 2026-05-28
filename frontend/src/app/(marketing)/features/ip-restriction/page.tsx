import { pageMetadata } from "@/lib/seo";
import { IpRestrictionContent } from "./IpRestrictionContent";

export const metadata = pageMetadata("/features/ip-restriction");

export default function IpRestrictionPage() {
  return <IpRestrictionContent />;
}
