"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import "./base64-converter.css";

// ── Types ──────────────────────────────────────────────────────────
type TabKey = "text" | "file-encode" | "file-decode";

interface FileInfo {
  name: string;
  size: number;
  type: string;
  b64: string; // raw base64 (no prefix)
  dataUri: string; // data:mime;base64,...
}

// ── Helpers ────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function fileIcon(type: string): string {
  if (type.startsWith("image/")) return "🖼️";
  if (type.startsWith("video/")) return "🎬";
  if (type.startsWith("audio/")) return "🎵";
  if (type.includes("pdf")) return "📄";
  if (type.includes("zip") || type.includes("compress")) return "📦";
  if (type.includes("json")) return "📋";
  if (type.startsWith("text/")) return "📝";
  return "📁";
}

function toUrlSafe(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromUrlSafe(b64: string): string {
  let s = b64.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return s;
}

function isValidBase64(s: string): boolean {
  try {
    const clean = s.trim().replace(/\s/g, "");
    const normal = fromUrlSafe(clean);
    atob(normal);
    return true;
  } catch {
    return false;
  }
}

function detectMimeFromB64(b64: string): string {
  try {
    const bytes = atob(b64.slice(0, 16));
    const hex = Array.from(bytes)
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
    if (hex.startsWith("FFD8FF")) return "image/jpeg";
    if (hex.startsWith("89504E47")) return "image/png";
    if (hex.startsWith("47494638")) return "image/gif";
    if (hex.startsWith("52494646")) return "image/webp";
    if (hex.startsWith("25504446")) return "application/pdf";
    if (hex.startsWith("504B0304")) return "application/zip";
  } catch {
    /* ignore */
  }
  return "application/octet-stream";
}

// ── Component ──────────────────────────────────────────────────────
export function Base64Converter() {
  const [tab, setTab] = useState<TabKey>("text");

  // ── Text ↔ Base64 state ────────────────────────────────────────
  const [rawText, setRawText] = useState(
    "Hello, ToolVerse! 👋\nĐây là ví dụ tiếng Việt UTF-8.",
  );
  const [b64Text, setB64Text] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [decodeError, setDecodeError] = useState("");

  // ── File → Base64 state ────────────────────────────────────────
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [fileDragOver, setFileDragOver] = useState(false);

  // ── Base64 → File state ────────────────────────────────────────
  const [decodeInput, setDecodeInput] = useState("");
  const [decodeMime, setDecodeMime] = useState("application/octet-stream");
  const [decodeFileName, setDecodeFileName] = useState("decoded-file");
  const [decodeIsImage, setDecodeIsImage] = useState(false);
  const [decodePreviewSrc, setDecodePreviewSrc] = useState("");
  const [decodeInputError, setDecodeInputError] = useState("");

  // ── Toast ──────────────────────────────────────────────────────
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fireToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowToast(false), 2200);
  }, []);

  // ── Text encode (real-time) ────────────────────────────────────
  useEffect(() => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(rawText)));
      setB64Text(urlSafe ? toUrlSafe(encoded) : encoded);
      setDecodeError("");
    } catch {
      setDecodeError("Không thể encode — có ký tự không hợp lệ.");
    }
  }, [rawText, urlSafe]);

  // ── Text decode ────────────────────────────────────────────────
  const decodeTextB64 = useCallback(() => {
    try {
      const normal = fromUrlSafe(b64Text.trim().replace(/\s/g, ""));
      const decoded = decodeURIComponent(escape(atob(normal)));
      setRawText(decoded);
      setDecodeError("");
      fireToast("✅ Đã decode Base64 → Text!");
    } catch {
      setDecodeError("Base64 không hợp lệ — không thể decode.");
    }
  }, [b64Text, fireToast]);

  const swapTextB64 = useCallback(() => {
    setRawText(b64Text);
  }, [b64Text]);

  // ── File → Base64 ──────────────────────────────────────────────
  const handleFileRead = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      const b64 = dataUri.split(",")[1] ?? "";
      setFileInfo({
        name: file.name,
        size: file.size,
        type: file.type,
        b64,
        dataUri,
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setFileDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileRead(file);
    },
    [handleFileRead],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileRead(file);
    },
    [handleFileRead],
  );

  const copyFileB64 = useCallback(async () => {
    if (!fileInfo) return;
    const out = urlSafe ? toUrlSafe(fileInfo.b64) : fileInfo.b64;
    await navigator.clipboard.writeText(out);
    fireToast("✅ Đã copy Base64!");
  }, [fileInfo, urlSafe, fireToast]);

  const copyDataUri = useCallback(async () => {
    if (!fileInfo) return;
    await navigator.clipboard.writeText(fileInfo.dataUri);
    fireToast("✅ Đã copy Data URI!");
  }, [fileInfo, fireToast]);

  // ── Base64 → File decode ───────────────────────────────────────
  useEffect(() => {
    if (!decodeInput.trim()) {
      setDecodeInputError("");
      setDecodePreviewSrc("");
      setDecodeIsImage(false);
      return;
    }

    // Strip data URI prefix if present
    let b64 = decodeInput.trim();
    let detectedMime = "";
    if (b64.startsWith("data:")) {
      const semi = b64.indexOf(";");
      detectedMime = b64.slice(5, semi);
      b64 = b64.slice(b64.indexOf(",") + 1);
    }

    b64 = fromUrlSafe(b64.replace(/\s/g, ""));

    if (!isValidBase64(b64)) {
      setDecodeInputError("Base64 không hợp lệ.");
      setDecodePreviewSrc("");
      setDecodeIsImage(false);
      return;
    }

    setDecodeInputError("");
    const mime = detectedMime || detectMimeFromB64(b64);
    setDecodeMime(mime);

    if (mime.startsWith("image/")) {
      setDecodeIsImage(true);
      setDecodePreviewSrc(`data:${mime};base64,${b64}`);
    } else {
      setDecodeIsImage(false);
      setDecodePreviewSrc("");
    }
  }, [decodeInput]);

  const downloadDecoded = useCallback(() => {
    let b64 = decodeInput.trim();
    if (b64.startsWith("data:")) b64 = b64.slice(b64.indexOf(",") + 1);
    b64 = fromUrlSafe(b64.replace(/\s/g, ""));

    try {
      const binary = atob(b64);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: decodeMime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = decodeMime.split("/")[1]?.split("+")[0] ?? "bin";
      a.download = decodeFileName.includes(".")
        ? decodeFileName
        : `${decodeFileName}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      fireToast("✅ Đã download file!");
    } catch {
      setDecodeInputError("Không thể decode — Base64 bị lỗi.");
    }
  }, [decodeInput, decodeMime, decodeFileName, fireToast]);

  // ── Copy helpers ───────────────────────────────────────────────
  const copyText = useCallback(
    async (text: string, msg: string) => {
      await navigator.clipboard.writeText(text);
      fireToast(msg);
    },
    [fireToast],
  );

  // ── Size ratio ─────────────────────────────────────────────────
  const ratio =
    rawText.length > 0 && b64Text.length > 0
      ? `${((b64Text.length / new TextEncoder().encode(rawText).length) * 100).toFixed(0)}%`
      : "—";

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="b64-root">
      {/* Breadcrumb */}
      <div className="b64-breadcrumb">
        <a href="/">Tất cả tools</a>
        <span>›</span>
        <span>Base64 Converter</span>
      </div>

      <div className="b64-layout">
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
              background: "var(--b64-accent-glow)",
              border: "1px solid var(--b64-accent)",
              borderRadius: "var(--b64-radius-sm)",
            }}
          >
            🔐
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--b64-text)",
              }}
            >
              Base64 Converter
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "0.82rem",
                color: "var(--b64-text-sub)",
              }}
            >
              Text ↔ Base64 · File → Base64 · Base64 → File · URL-safe · Image
              preview
            </p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="b64-tabs">
          {(
            [
              { key: "text", icon: "📝", label: "Text ↔ Base64" },
              { key: "file-encode", icon: "📁", label: "File → Base64" },
              { key: "file-decode", icon: "💾", label: "Base64 → File" },
            ] as { key: TabKey; icon: string; label: string }[]
          ).map((t) => (
            <button
              key={t.key}
              className={`b64-tab${tab === t.key ? " active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════
            TAB 1: Text ↔ Base64
        ══════════════════════════════════════════ */}
        {tab === "text" && (
          <div className="b64-panel">
            {/* Toolbar */}
            <div className="b64-toolbar">
              <button
                className={`b64-btn${urlSafe ? " active" : ""}`}
                onClick={() => setUrlSafe((v) => !v)}
                title="Thay +/ bằng -_ và bỏ padding ="
              >
                🔗 URL-safe
              </button>
              <div className="b64-divider" />
              <button
                className="b64-btn danger"
                onClick={() => {
                  setRawText("");
                  setB64Text("");
                }}
              >
                ✕ Clear
              </button>
            </div>

            {/* Editor row */}
            <div className="b64-editor-row">
              {/* Left: Raw text */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div className="b64-panel-header">
                  <span className="b64-panel-title">📝 Text (UTF-8)</span>
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    <button
                      className="b64-btn"
                      onClick={() => copyText(rawText, "✅ Đã copy text!")}
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
                <textarea
                  className="b64-textarea"
                  placeholder="Nhập text để encode..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  spellCheck={false}
                />
              </div>

              {/* Center: arrows */}
              <div className="b64-arrow-col">
                <span className="b64-arrow">→</span>
                <button
                  className="b64-swap-btn"
                  onClick={swapTextB64}
                  title="Dùng Base64 làm input mới"
                >
                  🔄
                </button>
                <span className="b64-arrow">←</span>
              </div>

              {/* Right: Base64 output */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div className="b64-panel-header">
                  <span className="b64-panel-title">
                    🔐 Base64{urlSafe ? " (URL-safe)" : ""}
                  </span>
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    <button
                      className="b64-btn"
                      onClick={decodeTextB64}
                      title="Decode Base64 → Text"
                    >
                      ⬅ Decode
                    </button>
                    <button
                      className="b64-btn success"
                      onClick={() => copyText(b64Text, "✅ Đã copy Base64!")}
                      disabled={!b64Text}
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
                <textarea
                  className="b64-textarea output"
                  value={b64Text}
                  onChange={(e) => setB64Text(e.target.value)}
                  spellCheck={false}
                  placeholder="Base64 output..."
                />
              </div>
            </div>

            {decodeError && <div className="b64-error">⚠️ {decodeError}</div>}

            {/* Stats */}
            <div className="b64-stats">
              {[
                {
                  val: new TextEncoder().encode(rawText).length + " B",
                  lbl: "Input size",
                },
                { val: b64Text.length + " B", lbl: "Base64 size" },
                { val: ratio, lbl: "Overhead" },
                { val: urlSafe ? "URL-safe" : "Standard", lbl: "Mode" },
              ].map(({ val, lbl }) => (
                <div key={lbl} className="b64-stat">
                  <span className="b64-stat-val">{val}</span>
                  <span className="b64-stat-lbl">{lbl}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB 2: File → Base64
        ══════════════════════════════════════════ */}
        {tab === "file-encode" && (
          <div className="b64-panel">
            <div className="b64-toolbar">
              <button
                className={`b64-btn${urlSafe ? " active" : ""}`}
                onClick={() => setUrlSafe((v) => !v)}
              >
                🔗 URL-safe
              </button>
            </div>

            {/* Drop zone */}
            {!fileInfo ? (
              <div
                className={`b64-dropzone${fileDragOver ? " dragover" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setFileDragOver(true);
                }}
                onDragLeave={() => setFileDragOver(false)}
                onDrop={handleFileDrop}
              >
                <div className="b64-dropzone-icon">📂</div>
                <div className="b64-dropzone-label">Kéo thả file vào đây</div>
                <div className="b64-dropzone-sub">
                  hoặc click để chọn · Mọi loại file
                </div>
                <input type="file" onChange={handleFileInput} />
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {/* File card */}
                <div className="b64-file-card">
                  <span className="b64-file-icon">
                    {fileIcon(fileInfo.type)}
                  </span>
                  <div className="b64-file-info">
                    <div className="b64-file-name">{fileInfo.name}</div>
                    <div className="b64-file-meta">
                      {fileInfo.type || "unknown"} ·{" "}
                      {formatBytes(fileInfo.size)}
                    </div>
                  </div>
                  <button
                    className="b64-btn danger"
                    onClick={() => setFileInfo(null)}
                  >
                    ✕ Xóa
                  </button>
                </div>

                {/* Image preview */}
                {fileInfo.type.startsWith("image/") && (
                  <img
                    src={fileInfo.dataUri}
                    alt="preview"
                    className="b64-img-preview"
                  />
                )}

                {/* Base64 output */}
                <div className="b64-panel-header">
                  <span className="b64-panel-title">🔐 Base64 Output</span>
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    <button className="b64-btn" onClick={copyDataUri}>
                      📋 Copy Data URI
                    </button>
                    <button className="b64-btn success" onClick={copyFileB64}>
                      📋 Copy Base64
                    </button>
                  </div>
                </div>
                <div className="b64-data-uri">
                  {urlSafe ? toUrlSafe(fileInfo.b64) : fileInfo.b64}
                </div>

                {/* Data URI preview */}
                <div
                  style={{ fontSize: "0.75rem", color: "var(--b64-text-sub)" }}
                >
                  <strong style={{ color: "var(--b64-text)" }}>
                    Data URI:
                  </strong>{" "}
                  <code
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--b64-text-mono)",
                    }}
                  >
                    data:{fileInfo.type};base64,{fileInfo.b64.slice(0, 40)}...
                  </code>
                </div>

                {/* Stats */}
                <div className="b64-stats">
                  {[
                    { val: formatBytes(fileInfo.size), lbl: "File size" },
                    {
                      val: formatBytes(fileInfo.b64.length),
                      lbl: "Base64 size",
                    },
                    {
                      val: `${Math.round((fileInfo.b64.length / fileInfo.size) * 100)}%`,
                      lbl: "Overhead",
                    },
                  ].map(({ val, lbl }) => (
                    <div key={lbl} className="b64-stat">
                      <span className="b64-stat-val">{val}</span>
                      <span className="b64-stat-lbl">{lbl}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB 3: Base64 → File
        ══════════════════════════════════════════ */}
        {tab === "file-decode" && (
          <div className="b64-panel">
            <div className="b64-decode-file-wrap">
              <div className="b64-panel-header">
                <span className="b64-panel-title">
                  🔐 Nhập Base64 hoặc Data URI
                </span>
              </div>

              <textarea
                className={`b64-textarea${decodeInputError ? " error" : ""}`}
                style={{ minHeight: 140 }}
                placeholder={`Dán Base64 hoặc Data URI vào đây...\nVí dụ: data:image/png;base64,iVBORw0K...`}
                value={decodeInput}
                onChange={(e) => setDecodeInput(e.target.value)}
                spellCheck={false}
              />

              {decodeInputError && (
                <div className="b64-error">⚠️ {decodeInputError}</div>
              )}

              {/* Detected MIME + filename */}
              {decodeInput.trim() && !decodeInputError && (
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--b64-text-sub)",
                        flexShrink: 0,
                      }}
                    >
                      MIME type:
                    </span>
                    <input
                      style={{
                        background: "var(--b64-input)",
                        border: "1px solid var(--b64-border)",
                        borderRadius: "6px",
                        padding: "0.3rem 0.6rem",
                        fontSize: "0.78rem",
                        color: "var(--b64-text-mono)",
                        outline: "none",
                        fontFamily: "JetBrains Mono, monospace",
                        width: 200,
                      }}
                      value={decodeMime}
                      onChange={(e) => {
                        setDecodeMime(e.target.value);
                        setDecodeIsImage(e.target.value.startsWith("image/"));
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--b64-text-sub)",
                        flexShrink: 0,
                      }}
                    >
                      Tên file:
                    </span>
                    <input
                      style={{
                        background: "var(--b64-input)",
                        border: "1px solid var(--b64-border)",
                        borderRadius: "6px",
                        padding: "0.3rem 0.6rem",
                        fontSize: "0.78rem",
                        color: "var(--b64-text)",
                        outline: "none",
                        fontFamily: "DM Sans, system-ui, sans-serif",
                        width: 160,
                      }}
                      value={decodeFileName}
                      onChange={(e) => setDecodeFileName(e.target.value)}
                      placeholder="decoded-file"
                    />
                  </div>
                </div>
              )}

              {/* Image preview */}
              {decodeIsImage && decodePreviewSrc && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <span className="b64-panel-title">🖼️ Image Preview</span>
                  <img
                    src={decodePreviewSrc}
                    alt="decoded preview"
                    className="b64-img-preview"
                  />
                </div>
              )}

              {/* Download button */}
              {decodeInput.trim() && !decodeInputError && (
                <div
                  style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                >
                  <button className="b64-action-btn" onClick={downloadDecoded}>
                    ⬇ Download File
                  </button>
                  {decodeIsImage && decodePreviewSrc && (
                    <button
                      className="b64-action-btn secondary"
                      onClick={() =>
                        copyText(decodePreviewSrc, "✅ Đã copy Data URI!")
                      }
                    >
                      📋 Copy Data URI
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Learning Log ── */}
        <details className="b64-log">
          <summary>
            📚 Learning Log — btoa/atob, FileReader, Blob & Data URI
          </summary>
          <div className="b64-log-content">
            <p>
              <strong>btoa() / atob() — và vấn đề UTF-8</strong>
            </p>
            <p>
              <code>btoa()</code> chỉ xử lý được Latin-1. Với tiếng Việt hoặc
              emoji, phải encode trước:{" "}
              <code>btoa(unescape(encodeURIComponent(str)))</code>. Chiều ngược
              lại: <code>decodeURIComponent(escape(atob(b64)))</code>. Đây là
              pattern chuẩn cho UTF-8 Base64 trên browser.
            </p>
            <p>
              <strong>URL-safe Base64</strong>
            </p>
            <p>
              Standard Base64 dùng <code>+</code> và <code>/</code> — hai ký tự
              có nghĩa đặc biệt trong URL. URL-safe thay bằng <code>-</code> và{" "}
              <code>_</code>, bỏ padding <code>=</code>. Dùng trong JWT, OAuth
              tokens, và bất kỳ context nào nhúng Base64 vào URL.
            </p>
            <p>
              <strong>FileReader API</strong>
            </p>
            <p>
              <code>reader.readAsDataURL(file)</code> trả về Data URI dạng{" "}
              <code>data:mime/type;base64,...</code>. Tách lấy phần base64 bằng{" "}
              <code>result.split(",")[1]</code>. Async, phải dùng{" "}
              <code>onload</code> callback.
            </p>
            <p>
              <strong>Blob + URL.createObjectURL → download</strong>
            </p>
            <p>
              Decode Base64 → binary string bằng <code>atob()</code> → convert
              sang <code>Uint8Array</code> → tạo <code>Blob</code> với đúng MIME
              → <code>URL.createObjectURL(blob)</code> → trigger download. Luôn
              gọi <code>URL.revokeObjectURL()</code> sau để tránh memory leak.
            </p>
            <p>
              <strong>Magic bytes — detect MIME từ binary</strong>
            </p>
            <p>
              Đọc vài bytes đầu tiên của file (magic number) để đoán MIME. PNG
              luôn bắt đầu bằng <code>89 50 4E 47</code>, JPEG bằng{" "}
              <code>FF D8 FF</code>. Không cần extension để biết file type.
            </p>
          </div>
        </details>
      </div>

      {/* Toast */}
      <div className={`b64-toast${showToast ? " show" : ""}`}>{toastMsg}</div>
    </div>
  );
}
