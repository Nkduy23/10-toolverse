import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NKVerse — Kho công cụ web miễn phí cho developer Việt",

  description:
    "Bộ công cụ web miễn phí: password generator, QR code, color palette, text formatter... Không cần đăng ký. Vào dùng, xong thoát.",

  metadataBase: new URL("https://10-toolverse.vercel.app/"),

  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },

  openGraph: {
    title: "NKVerse — Kho công cụ web miễn phí",
    description:
      "Bộ công cụ web miễn phí cho developer Việt. Không cần đăng ký.",
    url: "https://10-toolverse.vercel.app/",
    siteName: "NKVerse",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "https://10-toolverse.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "NKVerse — Kho công cụ web miễn phí",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "NKVerse — Kho công cụ web miễn phí",
    description:
      "Bộ công cụ web miễn phí cho developer Việt. Không cần đăng ký.",
    // Thay đổi ở đây nữa nhé
    images: ["https://10-toolverse.vercel.app/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      data-theme="light"
      className={`${syne.variable} ${dmSans.variable}`}
    >
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Header />

        <main style={{ flex: 1 }}>{children}</main>

        <Footer />

        {/* Toast portal */}
        <div id="toast-container" aria-live="polite" aria-atomic="false" />

        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
