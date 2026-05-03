import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["vietnamese", "latin"],
  variable: "--font-be-vietnam",
});

export const metadata: Metadata = {
  title: "Tinori - Shop Thời Trang & Phụ Kiện",
  description:
    "Shop thời trang và phụ kiện online Tinori. Hàng chất lượng, giá hợp lý, giao hàng nhanh toàn quốc.",
  keywords: "thời trang, phụ kiện, shop online, tinori",
  openGraph: {
    title: "Tinori - Shop Thời Trang & Phụ Kiện",
    description: "Shop thời trang và phụ kiện online",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable}`}>
      <body className="min-h-screen bg-gray-50 font-[family-name:var(--font-be-vietnam)] antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
