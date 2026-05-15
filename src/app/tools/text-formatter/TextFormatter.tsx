"use client";

import { useState, useCallback, useRef } from "react";
import "./text-formatter.css";

// ── Types ──────────────────────────────────────────────────────────
type CaseKey =
  | "original"
  | "upper"
  | "lower"
  | "title"
  | "sentence"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab"
  | "constant"
  | "dot"
  | "alternating"
  | "inverse";

interface CaseDef {
  key: CaseKey;
  preview: string; // short preview text shown on button
  label: string; // name below preview
  transform: (s: string) => string;
}

// ── Transforms ─────────────────────────────────────────────────────
function toWords(s: string): string[] {
  // split on whitespace, underscores, hyphens, dots, camelCase boundaries
  return s
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[\s_\-\.]+/)
    .filter(Boolean);
}

function toTitleCase(s: string): string {
  return s.replace(
    /\w\S*/g,
    (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
  );
}

function toSentenceCase(s: string): string {
  return s
    .split(/([.!?]\s+)/)
    .map((seg, i) =>
      i % 2 === 0
        ? seg.charAt(0).toUpperCase() + seg.slice(1).toLowerCase()
        : seg,
    )
    .join("");
}

function toCamel(s: string): string {
  const words = toWords(s);
  return words
    .map((w, i) =>
      i === 0
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join("");
}

function toPascal(s: string): string {
  return toWords(s)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

function toSnake(s: string): string {
  return toWords(s).join("_").toLowerCase();
}

function toKebab(s: string): string {
  return toWords(s).join("-").toLowerCase();
}

function toConstant(s: string): string {
  return toWords(s).join("_").toUpperCase();
}

function toDot(s: string): string {
  return toWords(s).join(".").toLowerCase();
}

function toAlternating(s: string): string {
  return s
    .split("")
    .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
    .join("");
}

function toInverse(s: string): string {
  return s
    .split("")
    .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
    .join("");
}

// ── Case definitions ───────────────────────────────────────────────
const CASES: CaseDef[] = [
  { key: "original", preview: "Abc", label: "Original", transform: (s) => s },
  {
    key: "upper",
    preview: "ABC",
    label: "UPPER CASE",
    transform: (s) => s.toUpperCase(),
  },
  {
    key: "lower",
    preview: "abc",
    label: "lower case",
    transform: (s) => s.toLowerCase(),
  },
  {
    key: "title",
    preview: "Abc Def",
    label: "Title Case",
    transform: toTitleCase,
  },
  {
    key: "sentence",
    preview: "Abc def.",
    label: "Sentence",
    transform: toSentenceCase,
  },
  { key: "camel", preview: "abcDef", label: "camelCase", transform: toCamel },
  {
    key: "pascal",
    preview: "AbcDef",
    label: "PascalCase",
    transform: toPascal,
  },
  { key: "snake", preview: "abc_def", label: "snake_case", transform: toSnake },
  { key: "kebab", preview: "abc-def", label: "kebab-case", transform: toKebab },
  {
    key: "constant",
    preview: "ABC_DEF",
    label: "CONSTANT",
    transform: toConstant,
  },
  { key: "dot", preview: "abc.def", label: "dot.case", transform: toDot },
  {
    key: "alternating",
    preview: "aLtErNaTe",
    label: "aLtErNaTiNg",
    transform: toAlternating,
  },
  {
    key: "inverse",
    preview: "iNVERSE",
    label: "iNVERSe",
    transform: toInverse,
  },
];

// ── Stats helper ───────────────────────────────────────────────────
function computeStats(s: string) {
  const chars = s.length;
  const words = s.trim() === "" ? 0 : s.trim().split(/\s+/).length;
  const lines = s === "" ? 0 : s.split("\n").length;
  const sentences = s.trim() === "" ? 0 : (s.match(/[.!?]+/g) ?? []).length;
  return { chars, words, lines, sentences };
}

// ── Component ──────────────────────────────────────────────────────
export function TextFormatter() {
  const [input, setInput] = useState("");
  const [activeCase, setActiveCase] = useState<CaseKey>("original");
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeDef = CASES.find((c) => c.key === activeCase)!;
  const output = activeDef.transform(input);
  const inStats = computeStats(input);
  const outStats = computeStats(output);

  // ── Actions ───────────────────────────────────────────────────
  const copyOutput = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1200);
    fireToast("✅ Đã copy!");
  }, [output]);

  const pasteInput = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      fireToast("📋 Đã paste từ clipboard!");
    } catch {
      fireToast("⚠️ Không thể đọc clipboard.");
    }
  }, []);

  const swapInputOutput = useCallback(() => {
    setInput(output);
    setActiveCase("original");
    fireToast("🔄 Đã swap input ← output!");
  }, [output]);

  const clearInput = useCallback(() => {
    setInput("");
    setActiveCase("original");
  }, []);

  const fireToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowToast(false), 2000);
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="tf-root">
      {/* Breadcrumb */}
      <div className="tf-breadcrumb">
        <a href="/">Tất cả tools</a>
        <span>›</span>
        <span>Text Formatter</span>
      </div>

      <div className="tf-layout">
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
              background: "var(--tf-accent-glow)",
              border: "1px solid var(--tf-accent)",
              borderRadius: "var(--tf-radius-sm)",
            }}
          >
            ✏️
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--tf-text)",
              }}
            >
              Text Formatter
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "0.82rem",
                color: "var(--tf-text-sub)",
              }}
            >
              13 kiểu case · Before/After song song · Copy 1 click
            </p>
          </div>
        </div>

        {/* ── Case buttons ── */}
        <div className="tf-controls">
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "var(--tf-text-sub)",
              marginRight: "0.25rem",
            }}
          >
            Case:
          </span>

          {CASES.map((c, i) => {
            const isActive = activeCase === c.key;
            // divider before special cases
            const needDivider = i === 5 || i === 11; // before camel, before alternating
            return (
              <span key={c.key} style={{ display: "contents" }}>
                {needDivider && <div className="tf-divider" />}
                <button
                  className={`tf-case-btn${isActive ? " active" : ""}`}
                  onClick={() => setActiveCase(c.key)}
                  title={c.label}
                >
                  <span className="tf-case-btn-preview">{c.preview}</span>
                  <span className="tf-case-btn-label">{c.label}</span>
                </button>
              </span>
            );
          })}
        </div>

        {/* ── Editor: Before / After ── */}
        <div className="tf-editor-row">
          {/* Before */}
          <div className="tf-panel">
            <div className="tf-panel-header">
              <span className="tf-panel-title">📝 Input</span>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button
                  className="tf-btn"
                  onClick={pasteInput}
                  title="Paste từ clipboard"
                >
                  📋 Paste
                </button>
                <button
                  className="tf-btn danger"
                  onClick={clearInput}
                  title="Xóa input"
                >
                  ✕ Clear
                </button>
              </div>
            </div>

            <textarea
              className="tf-textarea"
              placeholder="Nhập hoặc paste văn bản vào đây..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
            />

            {/* Input stats */}
            <div className="tf-stats">
              {[
                { val: inStats.chars, lbl: "Ký tự" },
                { val: inStats.words, lbl: "Từ" },
                { val: inStats.lines, lbl: "Dòng" },
                { val: inStats.sentences, lbl: "Câu" },
              ].map(({ val, lbl }) => (
                <div key={lbl} className="tf-stat">
                  <span className="tf-stat-val">{val.toLocaleString()}</span>
                  <span className="tf-stat-lbl">{lbl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* After */}
          <div className="tf-panel">
            <div className="tf-panel-header">
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <span className="tf-panel-title">✨ Output</span>
                {activeCase !== "original" && (
                  <span className="tf-active-badge">{activeDef.label}</span>
                )}
              </div>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button
                  className="tf-btn"
                  onClick={swapInputOutput}
                  title="Dùng output làm input mới"
                  disabled={!output}
                >
                  🔄 Swap
                </button>
                <button
                  className={`tf-btn tf-btn-copy${copied ? " copied" : ""}`}
                  onClick={copyOutput}
                  disabled={!output}
                  title="Copy output"
                >
                  {copied ? "✅ Copied!" : "📋 Copy"}
                </button>
              </div>
            </div>

            <textarea
              className="tf-textarea output"
              value={output}
              readOnly
              spellCheck={false}
              placeholder="Output sẽ hiện ở đây..."
            />

            {/* Output stats */}
            <div className="tf-stats">
              {[
                { val: outStats.chars, lbl: "Ký tự" },
                { val: outStats.words, lbl: "Từ" },
                { val: outStats.lines, lbl: "Dòng" },
                { val: outStats.sentences, lbl: "Câu" },
              ].map(({ val, lbl }) => (
                <div key={lbl} className="tf-stat">
                  <span className="tf-stat-val">{val.toLocaleString()}</span>
                  <span className="tf-stat-lbl">{lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Learning log ── */}
        <details className="tf-log">
          <summary>📚 Learning Log — String transforms & Regex</summary>
          <div className="tf-log-content">
            <p>
              <strong>toWords() — trái tim của mọi transform</strong>
            </p>
            <p>
              Dùng regex <code>/([a-z])([A-Z])/g</code> để tách camelCase trước,
              sau đó split theo <code>/[\s_\-\.]+/</code>. Kết quả là mảng từ
              "sạch" có thể join lại theo bất kỳ format nào.
            </p>
            <p>
              <strong>Sentence case</strong> dùng{" "}
              <code>split(/([.!?]\s+)/)</code> — giữ lại dấu câu như capturing
              group để join lại đúng vị trí.
            </p>
            <p>
              <strong>Alternating:</strong>{" "}
              <code>
                s.split("").map((c, i) =&gt; i % 2 === 0 ? lower : upper)
              </code>{" "}
              — đơn giản nhưng hiệu quả.
            </p>
            <p>
              <strong>Swap button</strong> — lấy output làm input mới, reset về
              Original case, cho phép chain nhiều transform liên tiếp.
            </p>
          </div>
        </details>
      </div>

      {/* Toast */}
      <div className={`tf-toast${showToast ? " show" : ""}`}>{toastMsg}</div>
    </div>
  );
}
