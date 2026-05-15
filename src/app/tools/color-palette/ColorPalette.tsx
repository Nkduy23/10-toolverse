"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import "./color-palette.css";

// ── Types ──────────────────────────────────────────────────────────
type HarmonyMode =
  | "analogous"
  | "complementary"
  | "triadic"
  | "split-complementary"
  | "monochromatic"
  | "tetradic";

type ExportFormat = "css" | "tailwind" | "scss" | "json";

interface ColorSwatch {
  hex: string;
  rgb: string;
  hsl: string;
}

interface PaletteHistory {
  baseHex: string;
  mode: HarmonyMode;
  colors: string[]; // hex array
}

// ── Pure color math helpers ─────────────────────────────────────────

/** Parse "#rrggbb" → { r, g, b } (0–255). Returns null if invalid. */
function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

/** RGB (0–255) → HSL (h: 0–360, s: 0–100, l: 0–100) */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255;
  const max = Math.max(rn, gn, bn),
    min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/** HSL → RGB */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hn = h / 360,
    sn = s / 100,
    ln = l / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return [v, v, v];
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hue2rgb = (t: number) => {
    const tt = ((t % 1) + 1) % 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return [
    Math.round(hue2rgb(hn + 1 / 3) * 255),
    Math.round(hue2rgb(hn) * 255),
    Math.round(hue2rgb(hn - 1 / 3) * 255),
  ];
}

/** RGB → hex string "#rrggbb" */
function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
      .join("")
  );
}

/** Rotate hue by degrees, return new hex */
function rotateHue(baseHex: string, deg: number): string {
  const rgb = parseHex(baseHex);
  if (!rgb) return baseHex;
  const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const newH = (((h + deg) % 360) + 360) % 360;
  const [r, g, b] = hslToRgb(newH, s, l);
  return rgbToHex(r, g, b);
}

/** Shift lightness by delta (for monochromatic) */
function shiftLightness(baseHex: string, deltaL: number): string {
  const rgb = parseHex(baseHex);
  if (!rgb) return baseHex;
  const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const newL = Math.max(5, Math.min(95, l + deltaL));
  const [r, g, b] = hslToRgb(h, s, newL);
  return rgbToHex(r, g, b);
}

/** Generate palette based on harmony mode */
function generatePalette(
  baseHex: string,
  mode: HarmonyMode,
  count: number,
): string[] {
  const rgb = parseHex(baseHex);
  if (!rgb) return [];
  const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b);

  let anchors: string[] = [];
  switch (mode) {
    case "analogous": {
      const step = 30;
      anchors = [
        rotateHue(baseHex, -step * 2),
        rotateHue(baseHex, -step),
        baseHex,
        rotateHue(baseHex, step),
        rotateHue(baseHex, step * 2),
      ];
      break;
    }
    case "complementary": {
      const comp = rotateHue(baseHex, 180);
      anchors = [
        baseHex,
        shiftLightness(baseHex, -15),
        shiftLightness(baseHex, 15),
        shiftLightness(comp, -15),
        comp,
      ];
      break;
    }
    case "triadic": {
      const t1 = rotateHue(baseHex, 120);
      const t2 = rotateHue(baseHex, 240);
      anchors = [
        baseHex,
        shiftLightness(baseHex, 15),
        t1,
        shiftLightness(t1, 15),
        t2,
      ];
      break;
    }
    case "split-complementary": {
      const s1 = rotateHue(baseHex, 150);
      const s2 = rotateHue(baseHex, 210);
      anchors = [
        baseHex,
        shiftLightness(baseHex, -10),
        s1,
        s2,
        shiftLightness(s2, -10),
      ];
      break;
    }
    case "monochromatic": {
      // spread lightness evenly 15% → 85%
      anchors = Array.from({ length: 5 }, (_, i) => {
        const newL = Math.round(15 + (i * 70) / 4);
        const [r, g, b] = hslToRgb(h, s, newL);
        return rgbToHex(r, g, b);
      });
      break;
    }
    case "tetradic": {
      anchors = [
        baseHex,
        rotateHue(baseHex, 90),
        rotateHue(baseHex, 180),
        rotateHue(baseHex, 270),
        shiftLightness(baseHex, 20),
      ];
      break;
    }
  }

  // Trim or pad to `count`
  if (count <= anchors.length) return anchors.slice(0, count);
  // Pad by interpolating between anchor pairs
  const result: string[] = [...anchors];
  while (result.length < count) {
    const extra: string[] = [];
    for (
      let i = 0;
      i < result.length - 1 && extra.length + result.length < count;
      i++
    ) {
      const rgbA = parseHex(result[i])!;
      const rgbB = parseHex(result[i + 1])!;
      const mid = rgbToHex(
        Math.round((rgbA.r + rgbB.r) / 2),
        Math.round((rgbA.g + rgbB.g) / 2),
        Math.round((rgbA.b + rgbB.b) / 2),
      );
      extra.push(mid);
    }
    if (extra.length === 0) break;
    extra.forEach((c, i) => result.splice(2 * i + 1, 0, c));
  }
  return result.slice(0, count);
}

/** hex → ColorSwatch with rgb + hsl strings */
function toSwatch(hex: string): ColorSwatch {
  const rgb = parseHex(hex) ?? { r: 0, g: 0, b: 0 };
  const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return {
    hex: hex.toUpperCase(),
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl: `hsl(${h}, ${s}%, ${l}%)`,
  };
}

/** Determine if text on a bg color should be dark or light */
function textOnColor(hex: string): string {
  const rgb = parseHex(hex);
  if (!rgb) return "#fff";
  const lum = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return lum > 0.55 ? "#1a1a1a" : "#ffffff";
}

/** Build export string */
function buildExport(
  swatches: ColorSwatch[],
  format: ExportFormat,
  mode: HarmonyMode,
): string {
  switch (format) {
    case "css":
      return `:root {\n${swatches.map((s, i) => `  --color-${mode}-${i + 1}: ${s.hex};`).join("\n")}\n}`;
    case "scss":
      return swatches
        .map((s, i) => `$color-${mode}-${i + 1}: ${s.hex};`)
        .join("\n");
    case "tailwind":
      return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        ${mode}: {\n${swatches.map((s, i) => `          ${(i + 1) * 100}: '${s.hex}',`).join("\n")}\n        },\n      },\n    },\n  },\n};`;
    case "json":
      return JSON.stringify(
        Object.fromEntries(
          swatches.map((s, i) => [
            `${mode}-${i + 1}`,
            { hex: s.hex, rgb: s.rgb, hsl: s.hsl },
          ]),
        ),
        null,
        2,
      );
  }
}

// ── Component ──────────────────────────────────────────────────────
export function ColorPalette() {
  const [baseHex, setBaseHex] = useState("#f7a130");
  const [hexInput, setHexInput] = useState("#F7A130");
  const [hexInvalid, setHexInvalid] = useState(false);
  const [mode, setMode] = useState<HarmonyMode>("analogous");
  const [count, setCount] = useState(5);
  const [swatches, setSwatches] = useState<ColorSwatch[]>([]);
  const [generating, setGenerating] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("✅ Đã copy!");
  const [history, setHistory] = useState<PaletteHistory[]>([]);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("css");
  const [showExport, setShowExport] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Slider fill ────────────────────────────────────────────────
  const sliderStyle = {
    background: `linear-gradient(to right, var(--cp-accent) ${((count - 3) / (10 - 3)) * 100}%, var(--cp-border) ${((count - 3) / (10 - 3)) * 100}%)`,
  };

  // ── Generate ───────────────────────────────────────────────────
  const doGenerate = useCallback(
    (hex = baseHex, m = mode, n = count) => {
      const rgb = parseHex(hex);
      if (!rgb) return;
      setGenerating(true);
      setTimeout(() => setGenerating(false), 400);

      const colors = generatePalette(hex, m, n);
      const sw = colors.map(toSwatch);
      setSwatches(sw);
      setHistory((prev) =>
        [{ baseHex: hex, mode: m, colors }, ...prev].slice(0, 8),
      );
      setShowExport(false);
    },
    [baseHex, mode, count],
  );

  useEffect(() => {
    doGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Hex input sync ─────────────────────────────────────────────
  const handleHexInput = (val: string) => {
    setHexInput(val);
    const normalized = val.startsWith("#") ? val : "#" + val;
    if (parseHex(normalized)) {
      setHexInvalid(false);
      setBaseHex(normalized);
    } else {
      setHexInvalid(true);
    }
  };

  const handleColorPicker = (val: string) => {
    setBaseHex(val);
    setHexInput(val.toUpperCase());
    setHexInvalid(false);
  };

  // ── Copy ───────────────────────────────────────────────────────
  const doCopy = useCallback(
    async (text: string, label: string, idx?: number, fmt?: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      if (idx !== undefined) {
        setCopiedIdx(idx);
        setCopiedFormat(fmt ?? null);
      }
      setToastMsg(`✅ Đã copy ${label}!`);
      setShowToast(true);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => {
        setShowToast(false);
        setCopiedIdx(null);
        setCopiedFormat(null);
      }, 2000);
    },
    [],
  );

  // ── Restore from history ────────────────────────────────────────
  const restoreHistory = (h: PaletteHistory) => {
    setBaseHex(h.baseHex);
    setHexInput(h.baseHex.toUpperCase());
    setMode(h.mode);
    setCount(h.colors.length);
    setSwatches(h.colors.map(toSwatch));
  };

  // ── Export string ───────────────────────────────────────────────
  const exportStr = swatches.length
    ? buildExport(swatches, exportFormat, mode)
    : "";

  // ── Harmony modes config ───────────────────────────────────────
  const MODES: {
    key: HarmonyMode;
    icon: string;
    name: string;
    desc: string;
  }[] = [
    { key: "analogous", icon: "〰️", name: "Analogous", desc: "Màu kề nhau" },
    {
      key: "complementary",
      icon: "⚖️",
      name: "Complementary",
      desc: "Đối diện nhau",
    },
    { key: "triadic", icon: "🔺", name: "Triadic", desc: "3 góc đều nhau" },
    {
      key: "split-complementary",
      icon: "⛏️",
      name: "Split-Comp",
      desc: "Bổ sung chéo",
    },
    {
      key: "monochromatic",
      icon: "🎨",
      name: "Monochromatic",
      desc: "Cùng màu, khác tone",
    },
    { key: "tetradic", icon: "🟦", name: "Tetradic", desc: "4 góc đều nhau" },
  ];

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="cp-root">
      {/* Breadcrumb */}
      <div className="cp-breadcrumb">
        <a href="/">Tất cả tools</a>
        <span>›</span>
        <span>Color Palette Generator</span>
      </div>

      <div className="cp-layout">
        {/* ── Left: Controls ── */}
        <section className="cp-panel">
          {/* Header */}
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div
              style={{
                fontSize: "2rem",
                width: 52,
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--cp-accent-glow)",
                border: "1px solid var(--cp-accent)",
                borderRadius: "var(--cp-radius-sm)",
              }}
            >
              🎨
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--cp-text)",
                }}
              >
                Color Palette Generator
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.82rem",
                  color: "var(--cp-text-sub)",
                }}
              >
                Tạo bảng màu đẹp theo lý thuyết màu sắc
              </p>
            </div>
          </div>

          {/* Base color picker */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--cp-text-sub)",
              }}
            >
              Màu gốc (Base Color)
            </span>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
            >
              <div
                className="cp-color-picker-wrap"
                style={{ background: baseHex }}
              >
                <input
                  type="color"
                  value={baseHex}
                  onChange={(e) => handleColorPicker(e.target.value)}
                  title="Chọn màu"
                />
              </div>
              <input
                className={`cp-hex-input${hexInvalid ? " invalid" : ""}`}
                type="text"
                value={hexInput}
                maxLength={7}
                placeholder="#F7A130"
                onChange={(e) => handleHexInput(e.target.value)}
                spellCheck={false}
              />
            </div>
            {hexInvalid && (
              <p style={{ fontSize: "0.8rem", color: "#f85149", margin: 0 }}>
                ⚠️ Hex không hợp lệ. VD: #F7A130
              </p>
            )}
          </div>

          {/* Count slider */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <label
                htmlFor="cp-count"
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--cp-text-sub)",
                }}
              >
                Số màu
              </label>
              <span
                style={{
                  background: "var(--cp-accent-glow)",
                  border: "1px solid var(--cp-accent)",
                  color: "var(--cp-accent)",
                  borderRadius: 6,
                  padding: "0.1rem 0.6rem",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  minWidth: 32,
                  textAlign: "center",
                }}
              >
                {count}
              </span>
            </div>
            <input
              id="cp-count"
              type="range"
              min={3}
              max={10}
              value={count}
              className="cp-slider"
              style={sliderStyle}
              onChange={(e) => setCount(+e.target.value)}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.72rem",
                color: "var(--cp-text-sub)",
                paddingTop: 2,
              }}
            >
              {["3", "5", "7", "10"].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>

          {/* Harmony mode */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--cp-text-sub)",
              }}
            >
              Chế độ hòa hợp
            </span>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.45rem",
              }}
            >
              {MODES.map(({ key, icon, name, desc }) => (
                <label key={key} className="cp-mode-card">
                  <input
                    type="radio"
                    name="cp-mode"
                    checked={mode === key}
                    onChange={() => setMode(key)}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      pointerEvents: "none",
                    }}
                  >
                    <span style={{ fontSize: "0.95rem" }}>{icon}</span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color:
                          mode === key ? "var(--cp-accent)" : "var(--cp-text)",
                      }}
                    >
                      {name}
                    </span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--cp-text-sub)",
                      }}
                    >
                      {desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={() => doGenerate()}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              background: "var(--color-brand-dark)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--cp-radius-sm)",
              padding: "0.85rem 1.5rem",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "opacity 0.2s, transform 0.1s",
              width: "100%",
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.97)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
          >
            <span>✨</span>
            <span>Generate Palette</span>
          </button>
        </section>

        {/* ── Right: Output ── */}
        <section className="cp-panel">
          {/* Swatches */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--cp-text-sub)",
                }}
              >
                Bảng màu — {MODES.find((m) => m.key === mode)?.name}
              </span>
              <button
                onClick={() => doGenerate()}
                title="Tạo lại"
                style={{
                  background: "none",
                  border: "1px solid var(--cp-border)",
                  borderRadius: 6,
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                🔄
              </button>
            </div>

            <div
              className={`cp-swatch-grid${generating ? " cp-generating" : ""}`}
            >
              {swatches.length === 0 && (
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--cp-text-sub)",
                    margin: "1rem 0",
                  }}
                >
                  Nhấn Generate để tạo bảng màu →
                </p>
              )}
              {swatches.map((sw, i) => (
                <div key={`${sw.hex}-${i}`} className="cp-swatch-row">
                  <div
                    className="cp-swatch-color"
                    style={{ background: sw.hex }}
                    title={sw.hex}
                  />
                  <div className="cp-swatch-info">
                    <span className="cp-swatch-hex">{sw.hex}</span>
                    <span className="cp-swatch-sub">{sw.rgb}</span>
                    <span className="cp-swatch-sub">{sw.hsl}</span>
                  </div>
                  <div className="cp-swatch-actions">
                    {(["HEX", "RGB", "HSL"] as const).map((fmt) => {
                      const val =
                        fmt === "HEX"
                          ? sw.hex
                          : fmt === "RGB"
                            ? sw.rgb
                            : sw.hsl;
                      const isCopied = copiedIdx === i && copiedFormat === fmt;
                      return (
                        <button
                          key={fmt}
                          className={`cp-swatch-btn${isCopied ? " copied" : ""}`}
                          onClick={() =>
                            doCopy(val, `${fmt} ${sw.hex}`, i, fmt)
                          }
                          title={`Copy ${fmt}`}
                        >
                          {isCopied ? "✓" : fmt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export */}
          {swatches.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--cp-text-sub)",
                  }}
                >
                  📤 Export
                </span>
                <button
                  className={`cp-export-btn${showExport ? " active" : ""}`}
                  onClick={() => setShowExport((v) => !v)}
                >
                  {showExport ? "Ẩn" : "Xem code"}
                </button>
              </div>

              {showExport && (
                <>
                  <div className="cp-export-bar">
                    {(
                      ["css", "scss", "tailwind", "json"] as ExportFormat[]
                    ).map((f) => (
                      <button
                        key={f}
                        className={`cp-export-btn${exportFormat === f ? " active" : ""}`}
                        onClick={() => setExportFormat(f)}
                      >
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <pre className="cp-export-code">{exportStr}</pre>
                  <button
                    className="cp-export-btn"
                    style={{ alignSelf: "flex-start" }}
                    onClick={() =>
                      doCopy(exportStr, `${exportFormat.toUpperCase()} code`)
                    }
                  >
                    📋 Copy {exportFormat.toUpperCase()}
                  </button>
                </>
              )}
            </div>
          )}

          {/* History */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--cp-text-sub)",
                }}
              >
                🕐 Lịch sử palette
              </span>
              <button
                onClick={() => setHistory([])}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--cp-text-sub)",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  padding: "0.2rem 0.4rem",
                  borderRadius: 4,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f85149")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--cp-text-sub)")
                }
              >
                Xóa tất cả
              </button>
            </div>
            {history.length === 0 ? (
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--cp-text-sub)",
                  margin: 0,
                }}
              >
                Chưa có palette nào được tạo.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                }}
              >
                {history.map((h, i) => (
                  <div
                    key={`${h.baseHex}-${i}`}
                    className="cp-history-item"
                    title={`Khôi phục palette ${h.mode}`}
                    onClick={() => restoreHistory(h)}
                  >
                    {h.colors.slice(0, 5).map((c, ci) => (
                      <span
                        key={ci}
                        className="cp-history-dot"
                        style={{ background: c }}
                      />
                    ))}
                    <span className="cp-history-label">
                      {h.baseHex.toUpperCase()} · {h.mode} · {h.colors.length}{" "}
                      màu
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Learning log */}
          <details className="cp-log">
            <summary>📚 Learning Log — Color Theory</summary>
            <div className="cp-log-content">
              <p>
                <strong>Hệ màu HSL là gì?</strong>
              </p>
              <p>
                HSL (<code>Hue</code>, <code>Saturation</code>,{" "}
                <code>Lightness</code>) mô tả màu theo góc trên bánh xe màu
                (0–360°), độ bão hòa và độ sáng — dễ dàng tính toán hòa hợp màu
                hơn RGB.
              </p>
              <p>
                <strong>Các chế độ harmony:</strong>
              </p>
              <p>
                <strong>Analogous:</strong> Xoay ±30° — màu cảm giác hài hòa, tự
                nhiên. <strong>Complementary:</strong> Xoay 180° — tương phản
                cao, nổi bật. <strong>Triadic:</strong> 3 màu cách đều 120° —
                cân bằng và phong phú. <strong>Monochromatic:</strong> Cùng hue,
                đổi lightness — sang trọng, nhất quán.
              </p>
              <p>
                <strong>Chuyển đổi hex → hsl trong JS:</strong>
              </p>
              <p>
                Parse hex → RGB (0–255) → chuẩn hóa 0–1 → tính <code>max</code>,{" "}
                <code>min</code> → tính <code>l = (max+min)/2</code> → tính{" "}
                <code>s</code> và <code>h</code>. Xoay hue bằng cộng/trừ và mod
                360.
              </p>
            </div>
          </details>
        </section>
      </div>

      {/* Toast */}
      <div className={`cp-toast${showToast ? " show" : ""}`}>{toastMsg}</div>
    </div>
  );
}
