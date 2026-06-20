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
  other: {
    "p:domain_verify": "e701bcc01f0c254d1dcdc8242b797468",
  },
};

import VisitTracker from "@/components/VisitTracker";
import NextTopLoader from "nextjs-toploader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-white font-[family-name:var(--font-be-vietnam)] antialiased">
        <NextTopLoader
          color="#d53c83"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #d53c83,0 0 5px #d53c83"
        />
        <VisitTracker />
        {children}
        <Toaster />
      </body>
    </html>
  );
}





