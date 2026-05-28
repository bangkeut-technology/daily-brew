import { pageMetadata } from "@/lib/seo";
import { RolesContent } from "./RolesContent";

export const metadata = pageMetadata("/roles");

export default function RolesPage() {
  return <RolesContent />;
}
