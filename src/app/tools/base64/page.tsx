import type { Metadata } from "next";
import { Base64Converter } from "./Base64Converter";

export const metadata: Metadata = {
  title: "Base64 Converter — Encode & Decode Base64 Online | ToolVerse",
  description:
    "Chuyển đổi text, image và file sang Base64 hoặc decode Base64 nhanh chóng ngay trên trình duyệt. Copy, download và preview realtime. Hoàn toàn miễn phí.",
  keywords: [
    "base64 converter",
    "base64 encoder",
    "base64 decoder",
    "image to base64",
    "base64 online tool",
    "encode decode base64",
  ],
  openGraph: {
    title: "Base64 Converter — ToolVerse",
    description:
      "Encode & decode Base64 cho text, image và file trực tiếp trên browser. Copy và download dễ dàng.",
    type: "website",
  },
};

export default function Base64ConverterPage() {
  return <Base64Converter />;
}
