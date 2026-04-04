import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { AppProvider } from "@/lib/context";
import "./globals.css";

export const metadata: Metadata = {
  title: "GravelFuel — Ride Fueling & Hydration Planner",
  description:
    "Translate your gravel ride intensity and duration into a precise, science-backed fueling and hydration recipe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#F5F0EB] font-sans">
        <AppProvider>{children}</AppProvider>
        <Analytics />
      </body>
    </html>
  );
}
