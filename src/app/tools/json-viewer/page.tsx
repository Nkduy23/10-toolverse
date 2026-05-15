import type { Metadata } from "next";
import { JsonViewer } from "./JsonViewer";

export const metadata: Metadata = {
  title: "JSON Viewer — Xem & Format JSON online miễn phí | ToolVerse",
  description:
    "Validate, format, minify JSON nhanh chóng. Tree view fold/unfold, search key/value, copy từng node. Hoàn toàn miễn phí.",
  keywords: [
    "json viewer",
    "json formatter",
    "json validator",
    "json prettify",
    "json minify",
    "json tree view",
    "format json online",
  ],
  openGraph: {
    title: "JSON Viewer — ToolVerse",
    description:
      "Validate, format & minify JSON. Tree view, search key/value, copy từng node riêng lẻ.",
    type: "website",
  },
};

export default function JsonViewerPage() {
  return <JsonViewer />;
}
