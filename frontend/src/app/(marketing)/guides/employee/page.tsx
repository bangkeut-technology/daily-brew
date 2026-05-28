import { pageMetadata } from "@/lib/seo";
import { GuideEmployeeContent } from "./GuideEmployeeContent";

export const metadata = pageMetadata("/guides/employee");

export default function GuideEmployeePage() {
  return <GuideEmployeeContent />;
}
