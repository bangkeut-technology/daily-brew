import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const SITE_NAME = "DailyBrew";
const DESCRIPTION =
  "QR check-in, shift tracking, and leave management for restaurants. Free for up to 10 employees.";

export const metadata: Metadata = {
  metadataBase: new URL("https://dailybrew.work"),
  title: {
    default: `${SITE_NAME} — Staff Attendance Tracking for Restaurants`,
    template: `%s — ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: "/",
    title: `${SITE_NAME} — Staff Attendance Tracking for Restaurants`,
    description: DESCRIPTION,
    images: ["/android-chrome-512.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Staff Attendance Tracking for Restaurants`,
    description: DESCRIPTION,
    images: ["/android-chrome-512.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#6B4226",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="h-full">
      <body className="min-h-full">
        <div className="app-shell flex min-h-full flex-col">{children}</div>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
