import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/AppProviders";
import { ConsoleShell } from "@/components/console/ConsoleShell";

// Authenticated app — never indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <ConsoleShell>{children}</ConsoleShell>
    </AppProviders>
  );
}
