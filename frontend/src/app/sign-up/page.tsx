import { pageMetadata } from "@/lib/seo";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata = pageMetadata("/sign-up");

export default function SignUpPage() {
  return <SignUpForm />;
}
