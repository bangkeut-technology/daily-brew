import { pageMetadata } from "@/lib/seo";
import { DeleteAccountContent } from "./DeleteAccountContent";

export const metadata = pageMetadata("/delete-account");

export default function DeleteAccountPage() {
  return <DeleteAccountContent />;
}
