import type { Metadata } from "next";
import { ColorPalette } from "./ColorPalette";

export const metadata: Metadata = {
  title: "Color Palette Generator — Tạo bảng màu đẹp miễn phí | ToolVerse",
  description:
    "Tạo bảng màu đẹp, hiện đại và ngẫu nhiên cho UI/UX, web design và branding. Copy mã HEX nhanh chóng. Hoàn toàn miễn phí.",
  keywords: [
    "color palette generator",
    "generate color palette",
    "bảng màu đẹp",
    "random color palette",
    "ui color palette",
    "hex color generator",
  ],
  openGraph: {
    title: "Color Palette Generator — ToolVerse",
    description:
      "Tạo bảng màu đẹp, hiện đại và ngẫu nhiên cho UI/UX và web design.",
    type: "website",
  },
};

export default function ColorPalettePage() {
  return <ColorPalette />;
}
