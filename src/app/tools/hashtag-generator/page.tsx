import type { Metadata } from "next";
import { HashtagGenerator } from "./HashtagGenerator";

export const metadata: Metadata = {
  title: "Hashtag Generator — Tạo hashtag AI miễn phí | ToolVerse",
  description:
    "Generate hashtag thông minh bằng AI cho Instagram, TikTok, X, LinkedIn, YouTube. Hỗ trợ tiếng Việt và tiếng Anh. Miễn phí.",
  keywords: [
    "hashtag generator",
    "tạo hashtag",
    "hashtag instagram",
    "hashtag tiktok",
    "hashtag ai",
    "hashtag tiếng việt",
    "hashtag free",
  ],
  openGraph: {
    title: "Hashtag Generator — ToolVerse",
    description:
      "AI generate hashtag cho 5 platforms. Hỗ trợ Việt/Anh, chọn mix trending/niche/broad.",
    type: "website",
  },
};

export default function HashtagGeneratorPage() {
  return <HashtagGenerator />;
}
