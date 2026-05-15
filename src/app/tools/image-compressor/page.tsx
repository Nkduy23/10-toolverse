import type { Metadata } from "next";
import { ImageCompressor } from "./ImageCompressor";

export const metadata: Metadata = {
  title: "Image Compressor — Nén ảnh hàng loạt miễn phí | ToolVerse",
  description:
    "Nén ảnh hàng loạt trực tiếp trên trình duyệt. Hỗ trợ WebP, JPEG, PNG, AVIF. Resize, chỉnh quality, preview before/after, tải ZIP. Không upload server.",
  keywords: [
    "image compressor online",
    "nén ảnh online",
    "compress image batch",
    "convert webp online",
    "resize image free",
  ],
  openGraph: {
    title: "Image Compressor — ToolVerse",
    description:
      "Nén ảnh hàng loạt, convert WebP/JPEG/PNG/AVIF, resize, preview before/after. Miễn phí, không upload server.",
    type: "website",
  },
};

export default function ImageCompressorPage() {
  return <ImageCompressor />;
}
