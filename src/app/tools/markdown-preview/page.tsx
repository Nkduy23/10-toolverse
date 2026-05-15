import type { Metadata } from "next";
import { MarkdownPreview } from "./MarkdownPreview";

export const metadata: Metadata = {
  title: "Markdown Preview — Editor & Preview online miễn phí | ToolVerse",
  description:
    "Viết và preview Markdown real-time. Syntax highlight với CodeMirror 6, hỗ trợ GFM, export .md và .html. Hoàn toàn miễn phí.",
  keywords: [
    "markdown preview",
    "markdown editor",
    "markdown online",
    "codemirror markdown",
    "markdown to html",
    "gfm preview",
    "export markdown",
  ],
  openGraph: {
    title: "Markdown Preview — ToolVerse",
    description:
      "Editor Markdown real-time với CodeMirror 6, GFM support, export .md & .html.",
    type: "website",
  },
};

export default function MarkdownPreviewPage() {
  return <MarkdownPreview />;
}
