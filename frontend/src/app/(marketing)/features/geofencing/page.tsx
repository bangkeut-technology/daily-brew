import { pageMetadata } from "@/lib/seo";
import { GeofencingContent } from "./GeofencingContent";

export const metadata = pageMetadata("/features/geofencing");

export default function GeofencingPage() {
  return <GeofencingContent />;
}
