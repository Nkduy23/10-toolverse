import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
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
  title: "ToolVerse — Kho công cụ web miễn phí cho developer Việt",
  description:
    "Bộ công cụ web miễn phí: password generator, QR code, color palette, text formatter... Không cần đăng ký. Vào dùng, xong thoát.",
  metadataBase: new URL("https://toolverse.com"),
  openGraph: {
    title: "ToolVerse — Kho công cụ web miễn phí",
    description:
      "Bộ công cụ web miễn phí cho developer Việt. Không cần đăng ký.",
    url: "https://toolverse.com",
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
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
        {/* Toast portal — injected imperatively by showToast() */}
        <div id="toast-container" aria-live="polite" aria-atomic="false" />
      </body>
    </html>
  );
}
