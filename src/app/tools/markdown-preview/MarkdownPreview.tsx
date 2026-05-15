"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import "./markdown-preview.css";

// ── Types ──────────────────────────────────────────────────────────
type ViewMode = "split" | "editor" | "preview";

// ── Default content ────────────────────────────────────────────────
const DEFAULT_MD = `# Welcome to Markdown Preview ✏️

Đây là **real-time** markdown preview với syntax highlight.

## Features

- ✅ Split view editor / preview
- ✅ CodeMirror 6 syntax highlight
- ✅ Export **.md** và **.html**
- ✅ Format shortcuts (Bold, Italic, Code...)
- ✅ GFM: tables, task lists, strikethrough

## Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Table

| Tool | Status | Category |
|------|--------|----------|
| Text Formatter | ✅ Done | Text |
| JSON Viewer | ✅ Done | Dev |
| Hashtag Generator | ✅ Done | Social |
| Markdown Preview | ✅ Done | Writing |

## Blockquote

> "Simplicity is the ultimate sophistication."
> — Leonardo da Vinci

## Task List

- [x] Setup project
- [x] Build core tools
- [ ] Deploy to production
- [ ] Add more tools

---

Happy writing! 🚀
`;

// ── Stats helper ───────────────────────────────────────────────────
function computeStats(md: string) {
  const chars = md.length;
  const words = md.trim() === "" ? 0 : md.trim().split(/\s+/).length;
  const lines = md === "" ? 0 : md.split("\n").length;
  const headings = (md.match(/^#{1,6}\s/gm) ?? []).length;
  return { chars, words, lines, headings };
}

// ── Format insert helpers ──────────────────────────────────────────
type FormatAction = {
  label: string;
  title: string;
  before: string;
  after: string;
  placeholder?: string;
};

const FORMAT_ACTIONS: FormatAction[] = [
  { label: "B", title: "Bold", before: "**", after: "**", placeholder: "bold" },
  {
    label: "I",
    title: "Italic",
    before: "_",
    after: "_",
    placeholder: "italic",
  },
  {
    label: "S",
    title: "Strikethrough",
    before: "~~",
    after: "~~",
    placeholder: "strikethrough",
  },
  {
    label: "`",
    title: "Inline code",
    before: "`",
    after: "`",
    placeholder: "code",
  },
  {
    label: "H1",
    title: "Heading 1",
    before: "# ",
    after: "",
    placeholder: "Heading",
  },
  {
    label: "H2",
    title: "Heading 2",
    before: "## ",
    after: "",
    placeholder: "Heading",
  },
  {
    label: "H3",
    title: "Heading 3",
    before: "### ",
    after: "",
    placeholder: "Heading",
  },
  {
    label: "»",
    title: "Blockquote",
    before: "> ",
    after: "",
    placeholder: "quote",
  },
  {
    label: "—",
    title: "Horizontal rule",
    before: "\n---\n",
    after: "",
    placeholder: "",
  },
  {
    label: "🔗",
    title: "Link",
    before: "[",
    after: "](url)",
    placeholder: "link text",
  },
  {
    label: "[]",
    title: "Task item",
    before: "- [ ] ",
    after: "",
    placeholder: "task",
  },
];

// ── Component ──────────────────────────────────────────────────────
export function MarkdownPreview() {
  const [md, setMd] = useState(DEFAULT_MD);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [html, setHtml] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const cmViewRef = useRef<unknown>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Toast ──────────────────────────────────────────────────────
  const fireToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowToast(false), 2200);
  }, []);

  // ── Parse markdown → HTML with marked ─────────────────────────
  useEffect(() => {
    let cancelled = false;
    import("marked").then(({ marked }) => {
      marked.setOptions({ gfm: true, breaks: true });
      const result = marked(md) as string;
      if (!cancelled) setHtml(result);
    });
    return () => {
      cancelled = true;
    };
  }, [md]);

  // ── Init CodeMirror 6 ──────────────────────────────────────────
  useEffect(() => {
    if (!editorRef.current) return;

    let destroyed = false;

    Promise.all([
      import("@codemirror/view"),
      import("@codemirror/state"),
      import("@codemirror/lang-markdown"),
      import("@codemirror/language-data"),
      import("@codemirror/commands"),
    ]).then(
      ([
        {
          EditorView,
          keymap,
          lineNumbers,
          highlightActiveLine,
          highlightActiveLineGutter,
          drawSelection,
        },
        { EditorState },
        { markdown, markdownLanguage },
        { languages },
        { defaultKeymap, historyKeymap, history, indentWithTab },
      ]) => {
        if (destroyed || !editorRef.current) return;

        // Clear any previous editor
        editorRef.current.innerHTML = "";

        const updateListener = EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setMd(update.state.doc.toString());
          }
        });

        const state = EditorState.create({
          doc: md,
          extensions: [
            lineNumbers(),
            highlightActiveLine(),
            highlightActiveLineGutter(),
            drawSelection(),
            history(),
            keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
            markdown({
              base: markdownLanguage,
              codeLanguages: languages,
            }),
            EditorView.lineWrapping,
            updateListener,
          ],
        });

        const view = new EditorView({
          state,
          parent: editorRef.current,
        });

        cmViewRef.current = view;
      },
    );

    return () => {
      destroyed = true;
      if (cmViewRef.current) {
        (cmViewRef.current as { destroy: () => void }).destroy();
        cmViewRef.current = null;
      }
    };
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync external md changes back to CM (e.g. Clear) ──────────
  const syncToEditor = useCallback((newMd: string) => {
    setMd(newMd);
    if (cmViewRef.current) {
      const view = cmViewRef.current as {
        state: { doc: { toString: () => string; length: number } };
        dispatch: (tr: unknown) => void;
      };
      const currentDoc = view.state.doc.toString();
      if (currentDoc !== newMd) {
        view.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: newMd },
        });
      }
    }
  }, []);

  // ── Format insertion ───────────────────────────────────────────
  const insertFormat = useCallback((action: FormatAction) => {
    if (!cmViewRef.current) return;
    const view = cmViewRef.current as {
      state: {
        selection: { main: { from: number; to: number; empty: boolean } };
        doc: { sliceString: (from: number, to: number) => string };
      };
      dispatch: (tr: unknown) => void;
      focus: () => void;
    };
    const { from, to, empty } = view.state.selection.main;
    const selected = empty
      ? (action.placeholder ?? "text")
      : view.state.doc.sliceString(from, to);

    const insert =
      action.after === ""
        ? `${action.before}${selected}`
        : `${action.before}${selected}${action.after}`;

    view.dispatch({
      changes: { from, to, insert },
      selection: {
        anchor: from + action.before.length,
        head: from + action.before.length + selected.length,
      },
    });
    view.focus();
  }, []);

  // ── Export .md ─────────────────────────────────────────────────
  const exportMd = useCallback(() => {
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    a.click();
    URL.revokeObjectURL(url);
    fireToast("✅ Đã export document.md!");
  }, [md, fireToast]);

  // ── Export .html ───────────────────────────────────────────────
  const exportHtml = useCallback(() => {
    const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Exported Markdown</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 800px;
      margin: 3rem auto;
      padding: 0 1.5rem;
      color: #24292f;
      line-height: 1.75;
      background: #fff;
    }
    h1, h2 { border-bottom: 1px solid #d0d7de; padding-bottom: 0.3rem; }
    code { background: rgba(175,184,193,0.2); border-radius: 4px; padding: 0.15em 0.4em; font-family: monospace; }
    pre { background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 6px; padding: 1rem; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 3px solid #f7a130; margin: 1rem 0; padding: 0.5rem 1rem; color: #57606a; background: #fff8f0; border-radius: 0 6px 6px 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #d0d7de; padding: 0.5rem 0.75rem; }
    th { background: #f6f8fa; }
    img { max-width: 100%; }
    a { color: #0969da; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.html";
    a.click();
    URL.revokeObjectURL(url);
    fireToast("✅ Đã export document.html!");
  }, [html, fireToast]);

  // ── Copy HTML ──────────────────────────────────────────────────
  const copyHtml = useCallback(async () => {
    await navigator.clipboard.writeText(html);
    fireToast("✅ Đã copy HTML!");
  }, [html, fireToast]);

  // ── Clear ──────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    syncToEditor("");
  }, [syncToEditor]);

  // ── Stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => computeStats(md), [md]);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="mp-root">
      {/* Breadcrumb */}
      <div className="mp-breadcrumb">
        <a href="/">Tất cả tools</a>
        <span>›</span>
        <span>Markdown Preview</span>
      </div>

      <div className="mp-layout">
        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              fontSize: "2rem",
              width: 52,
              height: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--mp-accent-glow)",
              border: "1px solid var(--mp-accent)",
              borderRadius: "var(--mp-radius-sm)",
            }}
          >
            📝
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--mp-text)",
              }}
            >
              Markdown Preview
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "0.82rem",
                color: "var(--mp-text-sub)",
              }}
            >
              CodeMirror 6 · GFM · Real-time preview · Export .md & .html
            </p>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="mp-toolbar">
          {/* Format buttons */}
          <div className="mp-toolbar-group" style={{ flexWrap: "wrap" }}>
            {FORMAT_ACTIONS.map((action) => (
              <button
                key={action.label}
                className="mp-fmt-btn"
                title={action.title}
                onClick={() => insertFormat(action)}
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="mp-divider" />

          {/* Export */}
          <div className="mp-toolbar-group">
            <button
              className="mp-btn"
              onClick={exportMd}
              disabled={!md}
              title="Download .md file"
            >
              ⬇ .md
            </button>
            <button
              className="mp-btn"
              onClick={exportHtml}
              disabled={!html}
              title="Download .html file"
            >
              ⬇ .html
            </button>
            <button
              className="mp-btn"
              onClick={copyHtml}
              disabled={!html}
              title="Copy raw HTML"
            >
              📋 HTML
            </button>
          </div>

          <div className="mp-divider" />

          {/* Clear */}
          <button
            className="mp-btn danger"
            onClick={handleClear}
            title="Xóa toàn bộ"
          >
            ✕ Clear
          </button>

          {/* View mode toggle — pushed to right */}
          <div style={{ marginLeft: "auto" }}>
            <div className="mp-view-toggle">
              {(["editor", "split", "preview"] as ViewMode[]).map((m) => (
                <button
                  key={m}
                  className={`mp-view-btn${viewMode === m ? " active" : ""}`}
                  onClick={() => setViewMode(m)}
                >
                  {m === "editor"
                    ? "✏️ Editor"
                    : m === "split"
                      ? "⬛ Split"
                      : "👁 Preview"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Split editor ── */}
        <div className={`mp-split mode-${viewMode}`}>
          {/* Editor pane */}
          <div className="mp-editor-pane">
            <div className="mp-pane-header">
              <span className="mp-pane-title">✏️ Editor</span>
              <span
                style={{ fontSize: "0.72rem", color: "var(--mp-text-sub)" }}
              >
                CodeMirror 6
              </span>
            </div>
            <div className="mp-cm-wrap">
              <div ref={editorRef} style={{ height: "100%" }} />
            </div>
          </div>

          {/* Preview pane */}
          <div className="mp-preview-pane">
            <div className="mp-pane-header">
              <span className="mp-pane-title">👁 Preview</span>
              <span
                style={{ fontSize: "0.72rem", color: "var(--mp-text-sub)" }}
              >
                GitHub Flavored Markdown
              </span>
            </div>
            <div className="mp-preview-scroll">
              {md.trim() === "" ? (
                <div className="mp-preview-empty">
                  <div className="mp-preview-empty-icon">📄</div>
                  <div>Preview sẽ hiện ở đây</div>
                </div>
              ) : (
                <div
                  className="mp-preview-body"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="mp-stats-bar">
          {[
            { val: stats.chars, lbl: "Ký tự" },
            { val: stats.words, lbl: "Từ" },
            { val: stats.lines, lbl: "Dòng" },
            { val: stats.headings, lbl: "Headings" },
          ].map(({ val, lbl }) => (
            <div key={lbl} className="mp-stat">
              <span className="mp-stat-val">{val.toLocaleString()}</span>
              <span className="mp-stat-lbl">{lbl}</span>
            </div>
          ))}
          <div
            style={{
              marginLeft: "auto",
              fontSize: "0.75rem",
              color: "var(--mp-text-sub)",
            }}
          >
            {html.length.toLocaleString()} chars HTML
          </div>
        </div>

        {/* ── Learning Log ── */}
        <details className="mp-log">
          <summary>📚 Learning Log — CodeMirror 6, marked.js & export</summary>
          <div className="mp-log-content">
            <p>
              <strong>CodeMirror 6 — modular architecture</strong>
            </p>
            <p>
              CM6 dùng extension system: mỗi tính năng (<code>lineNumbers</code>
              , <code>highlightActiveLine</code>, <code>history</code>…) là một
              extension độc lập. Kết hợp vào{" "}
              <code>EditorState.create({"{ extensions: [] }"})</code>. Ngược lại
              CM5 monolithic — CM6 tree-shakeable, bundle nhỏ hơn nhiều.
            </p>
            <p>
              <strong>Update listener pattern</strong>
            </p>
            <p>
              Dùng <code>EditorView.updateListener.of()</code> để lắng nghe mỗi
              khi doc thay đổi rồi sync lên React state. Chiều ngược lại (React
              → CM) phải dùng <code>view.dispatch({"{ changes: {...} }"})</code>{" "}
              — không set doc trực tiếp.
            </p>
            <p>
              <strong>marked.js — GFM parser</strong>
            </p>
            <p>
              <code>marked(md)</code> trả về HTML string. Bật{" "}
              <code>gfm: true</code> (GitHub Flavored Markdown) để có tables,
              task lists, strikethrough. Import dynamic{" "}
              <code>import("marked")</code> để không block first render.
            </p>
            <p>
              <strong>Export HTML — Blob + URL.createObjectURL</strong>
            </p>
            <p>
              Tạo <code>Blob</code> từ string HTML, tạo object URL tạm thời, gán
              vào <code>&lt;a download&gt;</code> rồi click programmatically.
              Sau đó <code>URL.revokeObjectURL()</code> để giải phóng memory.
              Pattern này hoạt động cho bất kỳ file type nào (md, html, csv,
              json…).
            </p>
          </div>
        </details>
      </div>

      {/* Toast */}
      <div className={`mp-toast${showToast ? " show" : ""}`}>{toastMsg}</div>
    </div>
  );
}
