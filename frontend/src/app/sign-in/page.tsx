import { pageMetadata } from "@/lib/seo";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata = pageMetadata("/sign-in");

export default function SignInPage() {
  return <SignInForm />;
}
