import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "Signing in…",
  robots: { index: false, follow: false },
};

export default function AuthCallbackLayout({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
