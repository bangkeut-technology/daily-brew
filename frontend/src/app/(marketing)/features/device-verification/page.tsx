import { pageMetadata } from "@/lib/seo";
import { DeviceVerificationContent } from "./DeviceVerificationContent";

export const metadata = pageMetadata("/features/device-verification");

export default function DeviceVerificationPage() {
  return <DeviceVerificationContent />;
}
