import type { Metadata } from "next";
import { RegexTester } from "./RegexTester";

export const metadata: Metadata = {
  title: "Regex Tester — Test & Debug Regular Expression online | ToolVerse",
  description:
    "Test regex real-time với highlight match, explain từng token, replace, và 16 snippet phổ biến (email, URL, phone...). Hoàn toàn miễn phí.",
  keywords: [
    "regex tester",
    "regular expression tester",
    "regex online",
    "regex debugger",
    "test regex",
    "regex explain",
    "regex vietnam",
  ],
  openGraph: {
    title: "Regex Tester — ToolVerse",
    description:
      "Test regex real-time, highlight matches, explain pattern, replace và snippet library.",
    type: "website",
  },
};

export default function RegexTesterPage() {
  return <RegexTester />;
}
