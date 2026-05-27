"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useTheme } from "next-themes";
import { ApplicationProvider } from "@/providers/application-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { LanguageProvider } from "@/providers/language-provider";

/**
 * Client-side providers for authenticated areas (/console, /admin, onboarding).
 * Marketing pages stay static and don't load these — so we don't fire auth
 * queries on public pages.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30 * 1000, gcTime: 5 * 60 * 1000, retry: 1 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <ApplicationProvider>
          <AuthProvider>
            <LanguageProvider>
              {children}
              <ThemedToaster />
            </LanguageProvider>
          </AuthProvider>
        </ApplicationProvider>
      </NextThemeProvider>
    </QueryClientProvider>
  );
}

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return <Toaster position="top-right" richColors theme={resolvedTheme === "dark" ? "dark" : "light"} />;
}
