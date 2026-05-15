"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import QRCode from "qrcode";
import "./qr-generator.css";

// ── Types ──────────────────────────────────────────────────────────
type ErrorLevel = "L" | "M" | "Q" | "H";
type QrType = "url" | "text" | "email" | "wifi";

interface WifiOptions {
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
}

interface HistoryItem {
  text: string;
  label: string;
  dataUrl: string;
}

// ── Pure helpers ───────────────────────────────────────────────────
const MAX_CHARS = 2953; // QR capacity at error level L

function buildQrText(type: QrType, text: string, wifi: WifiOptions): string {
  if (type === "email") {
    return text.includes("mailto:") ? text : `mailto:${text}`;
  }
  if (type === "url") {
    if (!text) return "";
    return /^https?:\/\//i.test(text) ? text : `https://${text}`;
  }
  if (type === "wifi") {
    if (!wifi.ssid) return "";
    return `WIFI:T:${wifi.encryption};S:${wifi.ssid};P:${wifi.password};;`;
  }
  return text;
}

function getTypePlaceholder(type: QrType): string {
  if (type === "url") return "https://example.com";
  if (type === "email") return "email@example.com";
  if (type === "wifi") return "Tên mạng WiFi (SSID)";
  return "Nhập nội dung bất kỳ...";
}

function truncateLabel(s: string, max = 32): string {
  return s.length > max ? s.slice(0, max) + "…" : s;
}

// ── Component ──────────────────────────────────────────────────────
export function QrGenerator() {
  const [qrType, setQrType] = useState<QrType>("url");
  const [text, setText] = useState("");
  const [wifi, setWifi] = useState<WifiOptions>({
    ssid: "",
    password: "",
    encryption: "WPA",
  });
  const [size, setSize] = useState(256);
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("M");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [dataUrl, setDataUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("✅ Đã copy link ảnh!");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const qrText = buildQrText(qrType, text, wifi);
  const charCount = qrText.length;
  const overLimit = charCount > MAX_CHARS;

  // ── Slider fill ────────────────────────────────────────────────
  const sliderStyle = {
    background: `linear-gradient(to right, var(--qr-accent) ${((size - 128) / (512 - 128)) * 100}%, var(--qr-border) ${((size - 128) / (512 - 128)) * 100}%)`,
  };

  // ── Generate QR ────────────────────────────────────────────────
  const doGenerate = useCallback(async () => {
    if (!qrText || overLimit) return;
    setGenerating(true);
    try {
      const url = await QRCode.toDataURL(qrText, {
        width: size,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: errorLevel,
      });
      setDataUrl(url);
      setHistory((prev) => {
        const label = truncateLabel(qrText);
        const next = [{ text: qrText, label, dataUrl: url }, ...prev].slice(0, 5);
        return next;
      });
    } catch {
      // invalid content — do nothing
    }
    setTimeout(() => setGenerating(false), 350);
  }, [qrText, size, fgColor, bgColor, errorLevel, overLimit]);

  // Auto-generate when inputs change (debounced)
  useEffect(() => {
    if (!qrText) { setDataUrl(""); return; }
    const t = setTimeout(() => { doGenerate(); }, 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrText, size, fgColor, bgColor, errorLevel]);

  // ── Download ───────────────────────────────────────────────────
  const doDownload = useCallback(() => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qrcode-toolverse.png`;
    a.click();
    fireToast("⬇️ Đã tải QR Code!");
  }, [dataUrl]);

  // ── Copy image ─────────────────────────────────────────────────
  const doCopyImage = useCallback(async () => {
    if (!dataUrl) return;
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      fireToast("✅ Đã copy ảnh QR!");
    } catch {
      fireToast("⚠️ Trình duyệt không hỗ trợ copy ảnh trực tiếp.");
    }
  }, [dataUrl]);

  // ── Toast ──────────────────────────────────────────────────────
  const fireToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowToast(false), 2200);
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="qr-root">
      {/* Breadcrumb */}
      <div className="qr-breadcrumb">
        <a href="/">Tất cả tools</a>
        <span>›</span>
        <span>QR Generator</span>
      </div>

      <div className="qr-layout">
        {/* ── Left: Controls ── */}
        <section className="qr-panel">
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                fontSize: "2rem",
                width: 52,
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--qr-accent-glow)",
                border: "1px solid var(--qr-accent)",
                borderRadius: "var(--qr-radius-sm)",
              }}
            >
              📱
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--qr-text)" }}>
                QR Generator
              </h1>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--qr-text-sub)" }}>
                Tạo QR Code nhanh, tuỳ chỉnh màu & kích thước
              </p>
            </div>
          </div>

          {/* QR Type selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--qr-text-sub)" }}>
              Loại nội dung
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              {(
                [
                  { key: "url",   icon: "🔗", name: "URL",   desc: "Website link" },
                  { key: "text",  icon: "📝", name: "Text",  desc: "Văn bản tự do" },
                  { key: "email", icon: "✉️",  name: "Email", desc: "Địa chỉ email" },
                  { key: "wifi",  icon: "📶", name: "WiFi",  desc: "Thông tin mạng" },
                ] as const
              ).map(({ key, icon, name, desc }) => (
                <label key={key} className="qr-option-card">
                  <input
                    type="radio"
                    name="qr-type"
                    value={key}
                    checked={qrType === key}
                    onChange={() => { setQrType(key); setText(""); }}
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, pointerEvents: "none" }}>
                    <span style={{ fontSize: "1.1rem" }}>{icon}</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--qr-text)" }}>{name}</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--qr-text-sub)" }}>{desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Input area */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--qr-text-sub)" }}>
              {qrType === "wifi" ? "Tên mạng (SSID)" : "Nội dung"}
            </label>
            <textarea
              className="qr-textarea"
              placeholder={getTypePlaceholder(qrType)}
              value={text}
              maxLength={MAX_CHARS}
              rows={qrType === "wifi" ? 1 : 3}
              onChange={(e) => setText(e.target.value)}
            />
            <div className={`qr-char-count${overLimit ? " warn" : ""}`}>
              {charCount} / {MAX_CHARS}
            </div>

            {/* WiFi extras */}
            {qrType === "wifi" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <input
                  type="password"
                  placeholder="Mật khẩu WiFi"
                  value={wifi.password}
                  onChange={(e) => setWifi((p) => ({ ...p, password: e.target.value }))}
                  style={{
                    background: "var(--qr-input)",
                    border: "1px solid var(--qr-border)",
                    borderRadius: "var(--qr-radius-sm)",
                    padding: "0.6rem 0.85rem",
                    color: "var(--qr-text)",
                    fontSize: "0.9rem",
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  {(["WPA", "WEP", "nopass"] as const).map((enc) => (
                    <label key={enc} className="qr-option-card" style={{ flex: 1 }}>
                      <input
                        type="radio"
                        name="wifi-enc"
                        value={enc}
                        checked={wifi.encryption === enc}
                        onChange={() => setWifi((p) => ({ ...p, encryption: enc }))}
                      />
                      <span style={{ fontSize: "0.78rem", fontWeight: 600, color: wifi.encryption === enc ? "var(--qr-accent)" : "var(--qr-text-sub)", pointerEvents: "none" }}>
                        {enc === "nopass" ? "Mở" : enc}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Size slider */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--qr-text-sub)" }}>
                Kích thước
              </label>
              <span
                style={{
                  background: "var(--qr-accent-glow)",
                  border: "1px solid var(--qr-accent)",
                  color: "var(--qr-accent)",
                  borderRadius: 6,
                  padding: "0.1rem 0.6rem",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {size}px
              </span>
            </div>
            <input
              type="range"
              min={128}
              max={512}
              step={16}
              value={size}
              className="qr-slider"
              style={sliderStyle}
              onChange={(e) => setSize(+e.target.value)}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--qr-text-sub)" }}>
              {["128", "256", "384", "512"].map((t) => <span key={t}>{t}px</span>)}
            </div>
          </div>

          {/* Error correction level */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--qr-text-sub)" }}>
              Mức sửa lỗi
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.4rem" }}>
              {(
                [
                  { key: "L", name: "L", desc: "7%" },
                  { key: "M", name: "M", desc: "15%" },
                  { key: "Q", name: "Q", desc: "25%" },
                  { key: "H", name: "H", desc: "30%" },
                ] as const
              ).map(({ key, name, desc }) => (
                <label key={key} className="qr-option-card" style={{ textAlign: "center" }}>
                  <input
                    type="radio"
                    name="error-level"
                    value={key}
                    checked={errorLevel === key}
                    onChange={() => setErrorLevel(key)}
                  />
                  <div style={{ pointerEvents: "none" }}>
                    <div style={{ fontSize: "1rem", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: errorLevel === key ? "var(--qr-accent)" : "var(--qr-text-sub)" }}>
                      {name}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--qr-text-sub)" }}>{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--qr-text-sub)" }}>
              Màu sắc
            </span>
            <div style={{ display: "flex", gap: "1rem" }}>
              {/* Foreground */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                <input
                  type="color"
                  className="qr-color-swatch"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  title="Màu QR (foreground)"
                />
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--qr-text)" }}>Màu QR</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--qr-text-sub)", fontFamily: "'JetBrains Mono', monospace" }}>{fgColor}</div>
                </div>
              </div>
              {/* Background */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                <input
                  type="color"
                  className="qr-color-swatch"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  title="Màu nền (background)"
                />
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--qr-text)" }}>Màu nền</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--qr-text-sub)", fontFamily: "'JetBrains Mono', monospace" }}>{bgColor}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={doGenerate}
            disabled={!qrText || overLimit}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              background: !qrText || overLimit ? "var(--qr-border)" : "var(--color-brand-dark)",
              color: !qrText || overLimit ? "var(--qr-text-sub)" : "#fff",
              border: "none",
              borderRadius: "var(--qr-radius-sm)",
              padding: "0.85rem 1.5rem",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: !qrText || overLimit ? "not-allowed" : "pointer",
              transition: "opacity 0.2s, transform 0.1s",
              width: "100%",
            }}
            onMouseDown={(e) => { if (qrText) e.currentTarget.style.transform = "scale(0.97)"; }}
            onMouseUp={(e) => (e.currentTarget.style.transform = "")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
          >
            <span>📱</span>
            <span>Tạo QR Code</span>
          </button>
        </section>

        {/* ── Right: Output ── */}
        <section className="qr-panel">
          {/* QR Preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
            <div className={`qr-canvas-wrap${dataUrl ? " has-qr" : ""}`}>
              {dataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={dataUrl}
                  src={dataUrl}
                  alt="QR Code"
                  className={`qr-canvas${generating ? " qr-generating" : ""}`}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <div className="qr-placeholder">
                  <div className="qr-placeholder-icon">▣</div>
                  <div className="qr-placeholder-text">
                    Nhập nội dung bên trái<br />để tạo QR Code
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {dataUrl && (
              <div style={{ display: "flex", gap: "0.5rem", width: "100%", maxWidth: 320 }}>
                <button
                  onClick={doDownload}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                    background: "var(--color-brand-dark)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--qr-radius-sm)",
                    padding: "0.65rem 1rem",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                  }}
                >
                  ⬇️ Tải PNG
                </button>
                <button
                  onClick={doCopyImage}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                    background: "none",
                    color: "var(--qr-text)",
                    border: "1px solid var(--qr-border)",
                    borderRadius: "var(--qr-radius-sm)",
                    padding: "0.65rem 1rem",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--qr-border-focus)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--qr-border)")}
                >
                  📋 Copy ảnh
                </button>
              </div>
            )}
          </div>

          {/* QR info */}
          {dataUrl && qrText && (
            <div
              style={{
                background: "var(--qr-input)",
                border: "1px solid var(--qr-border)",
                borderRadius: "var(--qr-radius-sm)",
                padding: "0.75rem 1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.3rem",
              }}
            >
              <div style={{ fontSize: "0.78rem", color: "var(--qr-text-sub)", fontWeight: 600, marginBottom: "0.25rem" }}>
                📊 Thông tin QR
              </div>
              {[
                ["Loại", qrType.toUpperCase()],
                ["Kích thước", `${size} × ${size}px`],
                ["Sửa lỗi", `${errorLevel} (${errorLevel === "L" ? "7" : errorLevel === "M" ? "15" : errorLevel === "Q" ? "25" : "30"}%)`],
                ["Ký tự", `${charCount}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                  <span style={{ color: "var(--qr-text-sub)" }}>{k}</span>
                  <span style={{ color: "var(--qr-text)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem" }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* History */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--qr-text-sub)" }}>
                🕐 Lịch sử (5 gần nhất)
              </span>
              <button
                onClick={() => setHistory([])}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--qr-text-sub)",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  padding: "0.2rem 0.4rem",
                  borderRadius: 4,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--qr-danger)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--qr-text-sub)")}
              >
                Xóa tất cả
              </button>
            </div>

            {history.length === 0 ? (
              <p style={{ fontSize: "0.8rem", color: "var(--qr-text-sub)", margin: 0 }}>
                Chưa có QR nào được tạo.
              </p>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {history.map((item, i) => (
                  <li
                    key={`${item.text}-${i}`}
                    className="qr-history-item"
                    title={item.text}
                    onClick={() => {
                      setText(item.text);
                      setDataUrl(item.dataUrl);
                    }}
                  >
                    {/* Mini QR preview */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.dataUrl} alt="" style={{ width: 28, height: 28, borderRadius: 3, flexShrink: 0, imageRendering: "pixelated" }} />
                    <span className="qr-history-item-text">{item.label}</span>
                    <span style={{ fontSize: "0.85rem", opacity: 0.6, flexShrink: 0 }}>↩</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Learning log */}
          <details className="qr-log">
            <summary>📚 Learning Log — QR Code & Canvas API</summary>
            <div className="qr-log-content">
              <p>
                <strong>QR Code hoạt động thế nào?</strong>
              </p>
              <p>
                QR Code mã hóa dữ liệu thành ma trận điểm ảnh 2D theo chuẩn ISO 18004. Thư viện <code>qrcode</code> dùng thuật toán Reed-Solomon để tạo error correction, cho phép QR đọc được dù bị che tới 30% (level H).
              </p>
              <p>
                <strong>Error correction levels:</strong> L (7%) → M (15%) → Q (25%) → H (30%). Level cao hơn = QR dày hơn nhưng bền hơn.
              </p>
              <p>
                <strong>WiFi QR format:</strong> <code>WIFI:T:WPA;S:ssid;P:password;;</code> — Android/iOS tự kết nối khi scan.
              </p>
              <p>
                <strong>Download PNG:</strong> dùng <code>QRCode.toDataURL()</code> → tạo thẻ <code>{'<a>'}</code> với <code>download</code> attribute → click programmatically.
              </p>
            </div>
          </details>
        </section>
      </div>

      {/* Toast */}
      <div className={`qr-toast${showToast ? " show" : ""}`}>
        {toastMsg}
      </div>
    </div>
  );
}