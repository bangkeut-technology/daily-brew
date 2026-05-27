import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "Check in",
  robots: { index: false, follow: false },
};

export default function CheckinLayout({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
