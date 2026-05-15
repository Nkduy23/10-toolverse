import type { Metadata } from "next";
import { TextFormatter } from "./TextFormatter";

export const metadata: Metadata = {
  title: "Text Formatter — Định dạng văn bản online miễn phí | ToolVerse",
  description:
    "Format văn bản nhanh chóng: uppercase, lowercase, capitalize, remove spaces, trim, slugify và nhiều công cụ xử lý text khác. Hoàn toàn miễn phí.",
  keywords: [
    "text formatter",
    "format text online",
    "uppercase lowercase",
    "convert text",
    "slugify tool",
    "text tools free",
  ],
  openGraph: {
    title: "Text Formatter — ToolVerse",
    description:
      "Công cụ định dạng văn bản nhanh: đổi chữ hoa, chữ thường, xoá khoảng trắng, slugify và nhiều hơn nữa.",
    type: "website",
  },
};

export default function TextFormatterPage() {
  return <TextFormatter />;
}
