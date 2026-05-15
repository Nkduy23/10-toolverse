"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type DragEvent,
  type ChangeEvent,
} from "react";
import JSZip from "jszip";
import "./image-compressor.css";

// ── Types ──────────────────────────────────────────────────────────
type OutputFormat = "original" | "webp" | "jpeg" | "png" | "avif";
type FileStatus = "idle" | "processing" | "done" | "error";

interface FileItem {
  id: string;
  file: File;
  thumb: string;       // object URL for thumbnail
  origSize: number;
  compSize: number | null;
  compBlob: Blob | null;
  compDataUrl: string | null;
  status: FileStatus;
  error?: string;
}

interface Settings {
  format: OutputFormat;
  quality: number;       // 1–100
  maxWidth: number | ""; // px, "" = no resize
  maxHeight: number | "";
}

// ── Helpers ────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function savingPct(orig: number, comp: number): string {
  const pct = ((orig - comp) / orig) * 100;
  return (pct >= 0 ? "-" : "+") + Math.abs(pct).toFixed(1) + "%";
}

function mimeForFormat(fmt: OutputFormat, file: File): string {
  if (fmt === "original") return file.type || "image/jpeg";
  if (fmt === "webp") return "image/webp";
  if (fmt === "jpeg") return "image/jpeg";
  if (fmt === "png") return "image/png";
  if (fmt === "avif") return "image/avif";
  return "image/jpeg";
}

function extForFormat(fmt: OutputFormat, file: File): string {
  if (fmt === "original") return file.name.split(".").pop() ?? "jpg";
  return fmt;
}

async function compressFile(file: File, settings: Settings): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const srcUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(srcUrl);

      let { naturalWidth: w, naturalHeight: h } = img;

      // Resize
      if (settings.maxWidth && w > +settings.maxWidth) {
        const ratio = +settings.maxWidth / w;
        w = +settings.maxWidth;
        h = Math.round(h * ratio);
      }
      if (settings.maxHeight && h > +settings.maxHeight) {
        const ratio = +settings.maxHeight / h;
        h = +settings.maxHeight;
        w = Math.round(w * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width  = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;

      // White background for JPEG (no alpha channel)
      const mime = mimeForFormat(settings.format, file);
      if (mime === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
      }
      ctx.drawImage(img, 0, 0, w, h);

      const quality = settings.quality / 100;
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Conversion failed")); return; }
          const reader = new FileReader();
          reader.onload = () => resolve({ blob, dataUrl: reader.result as string });
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        },
        mime,
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(srcUrl); reject(new Error("Load failed")); };
    img.src = srcUrl;
  });
}

// ── Component ──────────────────────────────────────────────────────
export function ImageCompressor() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [settings, setSettings] = useState<Settings>({
    format: "webp",
    quality: 80,
    maxWidth: "",
    maxHeight: "",
  });
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Preview state
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [sliderPct, setSliderPct] = useState(50);
  const previewRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const previewItem = files.find((f) => f.id === previewId) ?? null;

  // ── File ingestion ─────────────────────────────────────────────
  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter((f) => f.type.startsWith("image/"));
    if (!valid.length) return;
    const items: FileItem[] = valid.map((file) => ({
      id: uid(),
      file,
      thumb: URL.createObjectURL(file),
      origSize: file.size,
      compSize: null,
      compBlob: null,
      compDataUrl: null,
      status: "idle",
    }));
    setFiles((prev) => [...prev, ...items]);
  }, []);

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  const onFileInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = "";
  }, [addFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) URL.revokeObjectURL(item.thumb);
      return prev.filter((f) => f.id !== id);
    });
    if (previewId === id) setPreviewId(null);
  }, [previewId]);

  // ── Compress all ───────────────────────────────────────────────
  const compressAll = useCallback(async () => {
    if (!files.length || processing) return;
    setProcessing(true);

    for (const item of files) {
      setFiles((prev) =>
        prev.map((f) => f.id === item.id ? { ...f, status: "processing" } : f)
      );
      try {
        const { blob, dataUrl } = await compressFile(item.file, settings);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, status: "done", compSize: blob.size, compBlob: blob, compDataUrl: dataUrl }
              : f
          )
        );
        // Auto-select first for preview
        setPreviewId((cur) => cur ?? item.id);
      } catch {
        setFiles((prev) =>
          prev.map((f) => f.id === item.id ? { ...f, status: "error", error: "Thất bại" } : f)
        );
      }
    }
    setProcessing(false);
    fireToast("✅ Hoàn tất! Nhấn Download ZIP để tải về.");
  }, [files, processing, settings]);

  // ── Download ZIP ───────────────────────────────────────────────
  const downloadZip = useCallback(async () => {
    const done = files.filter((f) => f.compBlob);
    if (!done.length) return;
    const zip = new JSZip();
    done.forEach((f) => {
      const ext = extForFormat(settings.format, f.file);
      const name = f.file.name.replace(/\.[^.]+$/, "") + `-compressed.${ext}`;
      zip.file(name, f.compBlob!);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compressed-images.zip";
    a.click();
    URL.revokeObjectURL(url);
    fireToast("⬇️ Đã tải ZIP!");
  }, [files, settings.format]);

  // ── Before/After slider drag ───────────────────────────────────
  const onMouseDown = useCallback(() => { dragging.current = true; }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current || !previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
      setSliderPct(pct);
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove as EventListener);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove as EventListener);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  // ── Toast ──────────────────────────────────────────────────────
  const fireToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowToast(false), 2500);
  };

  // ── Stats ──────────────────────────────────────────────────────
  const totalOrig = files.reduce((s, f) => s + f.origSize, 0);
  const totalComp = files.reduce((s, f) => s + (f.compSize ?? f.origSize), 0);
  const doneCount = files.filter((f) => f.status === "done").length;

  const qualitySliderStyle = {
    background: `linear-gradient(to right, var(--ic-accent) ${settings.quality}%, var(--ic-border) ${settings.quality}%)`,
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="ic-root">
      {/* Breadcrumb */}
      <div className="ic-breadcrumb">
        <a href="/">Tất cả tools</a>
        <span>›</span>
        <span>Image Compressor</span>
      </div>

      <div className="ic-layout">
        {/* ══ Left: Settings ══ */}
        <section className="ic-panel">
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              fontSize: "2rem", width: 52, height: 52, display: "flex",
              alignItems: "center", justifyContent: "center",
              background: "var(--ic-accent-glow)", border: "1px solid var(--ic-accent)",
              borderRadius: "var(--ic-radius-sm)",
            }}>🗜️</div>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--ic-text)" }}>
                Image Compressor
              </h1>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--ic-text-sub)" }}>
                Batch compress · Đa format · Before/After preview
              </p>
            </div>
          </div>

          {/* Drop zone */}
          <div
            className={`ic-dropzone${dragOver ? " drag-over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <input type="file" accept="image/*" multiple onChange={onFileInput} />
            <div className="ic-dropzone-icon">🖼️</div>
            <div className="ic-dropzone-title">Kéo thả ảnh vào đây</div>
            <div className="ic-dropzone-sub">hoặc click để chọn file · JPG, PNG, WebP, GIF, AVIF</div>
          </div>

          {/* Output format */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ic-text-sub)" }}>
              Format đầu ra
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.35rem" }}>
              {(["original", "webp", "jpeg", "png", "avif"] as OutputFormat[]).map((fmt) => (
                <label key={fmt} className="ic-option-card" style={{ textAlign: "center" }}>
                  <input
                    type="radio"
                    name="format"
                    value={fmt}
                    checked={settings.format === fmt}
                    onChange={() => setSettings((p) => ({ ...p, format: fmt }))}
                  />
                  <span style={{
                    fontSize: "0.72rem", fontWeight: 700, pointerEvents: "none",
                    color: settings.format === fmt ? "var(--ic-accent)" : "var(--ic-text-sub)",
                    textTransform: "uppercase",
                  }}>
                    {fmt === "original" ? "Gốc" : fmt}
                  </span>
                </label>
              ))}
            </div>
            {settings.format === "avif" && (
              <p style={{ fontSize: "0.75rem", color: "var(--ic-warning)", margin: 0 }}>
                ⚠️ AVIF cần trình duyệt hỗ trợ (Chrome 85+, Firefox 93+)
              </p>
            )}
          </div>

          {/* Quality slider */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ic-text-sub)" }}>
                Chất lượng
              </label>
              <span style={{
                background: "var(--ic-accent-glow)", border: "1px solid var(--ic-accent)",
                color: "var(--ic-accent)", borderRadius: 6, padding: "0.1rem 0.6rem",
                fontSize: "0.9rem", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
              }}>
                {settings.quality}
              </span>
            </div>
            <input
              type="range" min={1} max={100} step={1}
              value={settings.quality}
              className="ic-slider"
              style={qualitySliderStyle}
              onChange={(e) => setSettings((p) => ({ ...p, quality: +e.target.value }))}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--ic-text-sub)" }}>
              <span>Nhỏ hơn</span>
              <span>Chất lượng cao</span>
            </div>
          </div>

          {/* Resize */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ic-text-sub)" }}>
              Resize tối đa <span style={{ fontWeight: 400, fontSize: "0.78rem" }}>(bỏ trống = không resize)</span>
            </span>
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
              {(["maxWidth", "maxHeight"] as const).map((key) => (
                <div key={key} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--ic-text-sub)" }}>
                    {key === "maxWidth" ? "Rộng (px)" : "Cao (px)"}
                  </span>
                  <input
                    type="number"
                    min={1}
                    placeholder={key === "maxWidth" ? "e.g. 1920" : "e.g. 1080"}
                    value={settings[key]}
                    onChange={(e) => setSettings((p) => ({ ...p, [key]: e.target.value === "" ? "" : +e.target.value }))}
                    style={{
                      background: "var(--ic-input)", border: "1px solid var(--ic-border)",
                      borderRadius: "var(--ic-radius-sm)", padding: "0.5rem 0.75rem",
                      color: "var(--ic-text)", fontSize: "0.85rem", outline: "none",
                      width: "100%", boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ic-border-focus)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--ic-border)")}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Compress button */}
          <button
            onClick={compressAll}
            disabled={!files.length || processing}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              background: !files.length || processing ? "var(--ic-border)" : "var(--color-brand-dark)",
              color: !files.length || processing ? "var(--ic-text-sub)" : "#fff",
              border: "none", borderRadius: "var(--ic-radius-sm)",
              padding: "0.85rem 1.5rem", fontSize: "0.95rem", fontWeight: 700,
              cursor: !files.length || processing ? "not-allowed" : "pointer",
              transition: "opacity 0.2s, transform 0.1s", width: "100%",
            }}
            onMouseDown={(e) => { if (files.length) e.currentTarget.style.transform = "scale(0.97)"; }}
            onMouseUp={(e) => (e.currentTarget.style.transform = "")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
          >
            <span>{processing ? "⏳" : "🗜️"}</span>
            <span>{processing ? `Đang xử lý... (${doneCount}/${files.length})` : `Nén ${files.length} ảnh`}</span>
          </button>

          {/* Download ZIP */}
          {doneCount > 0 && (
            <button
              onClick={downloadZip}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                background: "none", color: "var(--ic-success)",
                border: "1px solid var(--ic-success)", borderRadius: "var(--ic-radius-sm)",
                padding: "0.75rem 1.5rem", fontSize: "0.9rem", fontWeight: 700,
                cursor: "pointer", transition: "background 0.2s", width: "100%",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(63,185,80,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              ⬇️ Download ZIP ({doneCount} ảnh)
            </button>
          )}

          {/* Total stats */}
          {doneCount > 0 && (
            <div style={{
              background: "var(--ic-input)", border: "1px solid var(--ic-border)",
              borderRadius: "var(--ic-radius-sm)", padding: "0.75rem 1rem",
              display: "flex", flexDirection: "column", gap: "0.3rem",
            }}>
              <div style={{ fontSize: "0.78rem", color: "var(--ic-text-sub)", fontWeight: 600, marginBottom: "0.2rem" }}>
                📊 Tổng kết
              </div>
              {[
                ["Trước", fmtBytes(totalOrig)],
                ["Sau", fmtBytes(totalComp)],
                ["Tiết kiệm", savingPct(totalOrig, totalComp)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                  <span style={{ color: "var(--ic-text-sub)" }}>{k}</span>
                  <span style={{ color: "var(--ic-text)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem" }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Learning log */}
          <details className="ic-log">
            <summary>📚 Learning Log — Canvas API & Image Compression</summary>
            <div className="ic-log-content">
              <p><strong>Canvas API compress hoạt động thế nào?</strong></p>
              <p>
                Dùng <code>canvas.toBlob(callback, mimeType, quality)</code> — trình duyệt encode lại ảnh với quality 0–1. Không cần server, hoàn toàn client-side.
              </p>
              <p>
                <strong>AVIF</strong> nén tốt hơn WebP ~30%, nhưng encode chậm hơn và cần Chrome 85+ / Firefox 93+. <strong>WebP</strong> là lựa chọn safe nhất hiện tại.
              </p>
              <p>
                <strong>ZIP download:</strong> dùng thư viện <code>jszip</code> — gom tất cả Blob vào 1 file zip, tạo object URL rồi trigger download.
              </p>
              <p>
                <strong>Before/After slider:</strong> dùng <code>clip-path: inset(0 X% 0 0)</code> để cắt ảnh after theo vị trí drag.
              </p>
            </div>
          </details>
        </section>

        {/* ══ Right: File list + Preview ══ */}
        <section className="ic-panel" style={{ minWidth: 0 }}>

          {/* Before/After preview */}
          {previewItem && previewItem.compDataUrl ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ic-text-sub)" }}>
                  🔍 Before / After — kéo để so sánh
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--ic-text-sub)", fontFamily: "'JetBrains Mono', monospace" }}>
                  {fmtBytes(previewItem.origSize)} → {fmtBytes(previewItem.compSize!)}
                  {" "}
                  <span style={{ color: "var(--ic-success)", fontWeight: 700 }}>
                    {savingPct(previewItem.origSize, previewItem.compSize!)}
                  </span>
                </span>
              </div>

              <div
                ref={previewRef}
                className="ic-preview-wrap"
                onMouseDown={onMouseDown}
                onTouchStart={onMouseDown}
                style={{ cursor: "ew-resize" }}
              >
                {/* Before (original) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewItem.thumb}
                  alt="Before"
                  className="ic-preview-img"
                />
                {/* After (compressed) — clipped */}
                <div
                  className="ic-preview-after"
                  style={{ clipPath: `inset(0 ${100 - sliderPct}% 0 0)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewItem.compDataUrl} alt="After" />
                </div>

                {/* Divider */}
                <div
                  className="ic-preview-divider"
                  style={{ left: `${sliderPct}%` }}
                >
                  <div className="ic-preview-handle">↔</div>
                </div>

                {/* Labels */}
                <div className="ic-preview-label before">TRƯỚC</div>
                <div className="ic-preview-label after">SAU</div>
              </div>
            </div>
          ) : (
            <div style={{
              border: "1px dashed var(--ic-border)", borderRadius: "var(--ic-radius-sm)",
              display: "flex", alignItems: "center", justifyContent: "center",
              minHeight: 180, color: "var(--ic-text-sub)", fontSize: "0.85rem", flexDirection: "column", gap: "0.5rem",
            }}>
              <span style={{ fontSize: "2rem", opacity: 0.3 }}>🔍</span>
              <span>Chọn ảnh và nhấn Nén để xem preview before/after</span>
            </div>
          )}

          {/* File list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", flex: 1, minHeight: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--ic-text-sub)" }}>
                📁 Danh sách ({files.length} ảnh)
              </span>
              {files.length > 0 && (
                <button
                  onClick={() => { setFiles([]); setPreviewId(null); }}
                  style={{
                    background: "none", border: "none", color: "var(--ic-text-sub)",
                    fontSize: "0.78rem", cursor: "pointer", padding: "0.2rem 0.4rem",
                    borderRadius: 4, transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ic-danger)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ic-text-sub)")}
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {files.length === 0 ? (
              <p style={{ fontSize: "0.8rem", color: "var(--ic-text-sub)", margin: 0 }}>
                Chưa có ảnh nào. Kéo thả hoặc chọn file bên trái.
              </p>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem", overflowY: "auto", maxHeight: 360 }}>
                {files.map((item) => {
                  const saving = item.compSize !== null ? savingPct(item.origSize, item.compSize) : null;
                  const isNeg = saving ? !saving.startsWith("-") : false;
                  return (
                    <li
                      key={item.id}
                      className={`ic-file-item${item.status === "done" ? " done" : item.status === "error" ? " error" : ""}`}
                      onClick={() => { if (item.status === "done") { setPreviewId(item.id); setSliderPct(50); } }}
                      style={{ cursor: item.status === "done" ? "pointer" : "default",
                        outline: previewId === item.id ? "2px solid var(--ic-accent)" : "none",
                        outlineOffset: 2 }}
                      title={item.status === "done" ? "Click để xem before/after" : undefined}
                    >
                      {/* Thumb */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.thumb} alt="" className="ic-file-thumb" />

                      {/* Info */}
                      <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        <div className="ic-file-name">{item.file.name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span className="ic-file-meta">{fmtBytes(item.origSize)}</span>
                          {item.compSize !== null && (
                            <>
                              <span className="ic-file-meta">→</span>
                              <span className="ic-file-meta">{fmtBytes(item.compSize)}</span>
                            </>
                          )}
                        </div>
                        {/* Progress bar */}
                        {item.status === "processing" && (
                          <div className="ic-progress-track">
                            <div className="ic-progress-fill" style={{ width: "60%" }} />
                          </div>
                        )}
                        {item.status === "done" && (
                          <div className="ic-progress-track">
                            <div className="ic-progress-fill done" style={{ width: "100%" }} />
                          </div>
                        )}
                      </div>

                      {/* Right side */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.3rem", flexShrink: 0 }}>
                        {saving && (
                          <span className={`ic-file-saving${isNeg ? " negative" : ""}`}>{saving}</span>
                        )}
                        {item.status === "error" && (
                          <span style={{ fontSize: "0.72rem", color: "var(--ic-danger)" }}>❌</span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}
                          style={{
                            background: "none", border: "none", color: "var(--ic-text-sub)",
                            fontSize: "0.8rem", cursor: "pointer", padding: "0.1rem 0.3rem",
                            borderRadius: 3, transition: "color 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ic-danger)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ic-text-sub)")}
                          title="Xóa"
                        >✕</button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Toast */}
      <div className={`ic-toast${showToast ? " show" : ""}`}>{toastMsg}</div>
    </div>
  );
}