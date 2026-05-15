import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["vietnamese", "latin"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TINORI",
  description: "Tinori - Nơi những điều xinh đẹp được nâng niu.",
  keywords: "thời trang, phụ kiện, shop online, tinori",
  openGraph: {
    title: "TINORI",
    description: "Tinori - Nơi những điều xinh đẹp được nâng niu.",
    type: "website",
  },
};

import FloatingWidgets from "@/components/FloatingWidgets";
import VisitTracker from "@/components/VisitTracker";
import MagicEffects from "@/components/MagicEffects";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-white font-[family-name:var(--font-be-vietnam)] antialiased">
        <VisitTracker />
        <MagicEffects />
        <FloatingWidgets />
        {children}
        <Toaster />
      </body>
    </html>
  );
}





