import type { Metadata } from "next";
import { QrGenerator } from "./QrGenerator";

export const metadata: Metadata = {
  title: "QR Generator — Tạo mã QR Code miễn phí | ToolVerse",
  description:
    "Tạo QR Code nhanh chóng từ URL, văn bản, email, hoặc thông tin WiFi. Tuỳ chỉnh màu sắc, kích thước, mức sửa lỗi. Tải PNG 1 click. Hoàn toàn miễn phí.",
  keywords: [
    "qr code generator",
    "tạo mã qr",
    "qr code online",
    "wifi qr code",
    "qr generator free",
  ],
  openGraph: {
    title: "QR Generator — ToolVerse",
    description:
      "Tạo QR Code từ URL, text, email, WiFi. Tuỳ màu & kích thước. Tải PNG 1 click.",
    type: "website",
  },
};

export default function QrGeneratorPage() {
  return <QrGenerator />;
}
