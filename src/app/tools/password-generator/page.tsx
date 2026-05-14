import type { Metadata } from "next";
import { PasswordGenerator } from "./PasswordGenerator";

export const metadata: Metadata = {
  title: "Password Generator — Tạo mật khẩu mạnh & ngẫu nhiên | ToolVerse",
  description:
    "Tạo mật khẩu mạnh, ngẫu nhiên và bảo mật cao với Crypto API. Tùy chọn độ dài, ký tự đặc biệt, uppercase. Copy 1 click. Hoàn toàn miễn phí.",
  keywords: [
    "password generator online",
    "random password generator",
    "tạo mật khẩu ngẫu nhiên",
    "tạo mật khẩu mạnh",
    "secure password",
  ],
  openGraph: {
    title: "Password Generator — ToolVerse",
    description: "Tạo mật khẩu mạnh, ngẫu nhiên và bảo mật cao. Copy 1 click.",
    type: "website",
  },
};

export default function PasswordGeneratorPage() {
  return <PasswordGenerator />;
}
