import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "MarketGo — 전통시장 스마트 주문",
  description: "QR 코드로 주문하고 결제하는 전통시장 스마트 주문 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={geist.variable}>
      <body className="min-h-screen bg-white font-sans antialiased">{children}</body>
    </html>
  );
}
