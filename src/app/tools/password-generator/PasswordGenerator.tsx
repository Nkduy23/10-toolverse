"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import "./password-generator.css";

// ── Character sets ─────────────────────────────────────────────────
const CHARS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?",
};

// ── Types ──────────────────────────────────────────────────────────
interface Options {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

interface StrengthResult {
  level: "weak" | "fair" | "good" | "strong" | "";
  score: number;
  label: string;
  hint: string;
}

// ── Pure helpers (no DOM, safe to call anywhere) ───────────────────
function randomChar(str: string): string {
  const arr = new Uint32Array(1);
  window.crypto.getRandomValues(arr);
  return str[arr[0] % str.length];
}

function cryptoShuffle(arr: string[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1);
    window.crypto.getRandomValues(buf);
    const j = buf[0] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function generatePassword(length: number, options: Options): string {
  let charset = "";
  const mandatory: string[] = [];

  if (options.uppercase) {
    charset += CHARS.uppercase;
    mandatory.push(randomChar(CHARS.uppercase));
  }
  if (options.lowercase) {
    charset += CHARS.lowercase;
    mandatory.push(randomChar(CHARS.lowercase));
  }
  if (options.numbers) {
    charset += CHARS.numbers;
    mandatory.push(randomChar(CHARS.numbers));
  }
  if (options.symbols) {
    charset += CHARS.symbols;
    mandatory.push(randomChar(CHARS.symbols));
  }

  if (!charset) return "";

  const remaining = length - mandatory.length;
  const rest = Array.from({ length: remaining }, () => randomChar(charset));
  const all = [...mandatory, ...rest];
  cryptoShuffle(all);
  return all.join("");
}

function calculateStrength(password: string, options: Options): StrengthResult {
  if (!password)
    return {
      level: "",
      score: 0,
      label: "—",
      hint: "Nhấn Generate để tạo mật khẩu",
    };

  let score = 0;
  const len = password.length;
  if (len >= 8) score += 10;
  if (len >= 12) score += 15;
  if (len >= 16) score += 20;
  if (len >= 24) score += 15;
  if (len >= 32) score += 10;

  const typesUsed = [
    options.uppercase,
    options.lowercase,
    options.numbers,
    options.symbols,
  ].filter(Boolean).length;
  score += typesUsed * 7;
  if (typesUsed === 4) score += 8;
  score = Math.min(100, score);

  if (score < 30)
    return {
      level: "weak",
      score,
      label: "🔴 Yếu",
      hint: "Tăng độ dài hoặc thêm ký tự đặc biệt.",
    };
  if (score < 55)
    return {
      level: "fair",
      score,
      label: "🟡 Trung bình",
      hint: "Tốt hơn rồi! Cân nhắc tăng thêm độ dài.",
    };
  if (score < 80)
    return {
      level: "good",
      score,
      label: "🟢 Mạnh",
      hint: "Mật khẩu đủ mạnh cho hầu hết dịch vụ.",
    };
  return {
    level: "strong",
    score,
    label: "🔵 Rất mạnh",
    hint: "Xuất sắc! Mật khẩu cực kỳ khó bị crack.",
  };
}

function maskPassword(pwd: string): string {
  if (pwd.length <= 6) return "•".repeat(pwd.length);
  return (
    pwd.slice(0, 3) + "•".repeat(Math.min(pwd.length - 6, 10)) + pwd.slice(-3)
  );
}

// ── Component ──────────────────────────────────────────────────────
export function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState<Options>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
  });
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState<StrengthResult>({
    level: "",
    score: 0,
    label: "—",
    hint: "Nhấn Generate để tạo mật khẩu",
  });
  const [history, setHistory] = useState<string[]>([]);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [showToast, setShowToast] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [optionError, setOptionError] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const noOptionSelected =
    !options.uppercase &&
    !options.lowercase &&
    !options.numbers &&
    !options.symbols;

  // ── Slider fill track ──────────────────────────────────────────
  const sliderStyle = {
    background: `linear-gradient(to right, var(--pg-accent) ${((length - 8) / (128 - 8)) * 100}%, var(--pg-border) ${((length - 8) / (128 - 8)) * 100}%)`,
  };

  // ── Generate ───────────────────────────────────────────────────
  const doGenerate = useCallback(() => {
    if (noOptionSelected) {
      setOptionError(true);
      return;
    }
    setOptionError(false);
    setGenerating(true);
    setTimeout(() => setGenerating(false), 400);

    const pwd = generatePassword(length, options);
    setPassword(pwd);
    setStrength(calculateStrength(pwd, options));
    setHistory((prev) => [pwd, ...prev].slice(0, 5));
  }, [length, options, noOptionSelected]);

  // Auto-generate on mount
  useEffect(() => {
    doGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Enter key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") doGenerate();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [doGenerate]);

  // ── Copy ───────────────────────────────────────────────────────
  const doCopy = useCallback(async (text: string) => {
    if (!text) return;
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
    setCopyState("copied");
    setShowToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setShowToast(false);
      setCopyState("idle");
    }, 2200);
  }, []);

  // ── Option toggle ──────────────────────────────────────────────
  const toggleOption = (key: keyof Options) => {
    setOptions((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const anySelected = Object.values(next).some(Boolean);
      setOptionError(!anySelected);
      return next;
    });
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="pg-root">
      {/* Breadcrumb */}
      <div className="pg-breadcrumb">
        <a href="/">Tất cả tools</a>
        <span>›</span>
        <span>Password Generator</span>
      </div>

      <div className="pg-layout">
        {/* ── Left: Controls ── */}
        <section className="pg-panel">
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
                background: "var(--pg-accent-glow)",
                border: "1px solid var(--pg-accent)",
                borderRadius: "var(--pg-radius-sm)",
              }}
            >
              🔑
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--pg-text)",
                }}
              >
                Password Generator
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.82rem",
                  color: "var(--pg-text-sub)",
                }}
              >
                Tạo mật khẩu mạnh với Crypto API
              </p>
            </div>
          </div>

          {/* Length slider */}
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
                htmlFor="pg-length"
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--pg-text-sub)",
                }}
              >
                Độ dài mật khẩu
              </label>
              <span
                style={{
                  background: "var(--pg-accent-glow)",
                  border: "1px solid var(--pg-accent)",
                  color: "var(--pg-accent)",
                  borderRadius: 6,
                  padding: "0.1rem 0.6rem",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  minWidth: 36,
                  textAlign: "center",
                }}
              >
                {length}
              </span>
            </div>
            <input
              id="pg-length"
              type="range"
              min={8}
              max={128}
              value={length}
              className="pg-slider"
              style={sliderStyle}
              onChange={(e) => setLength(+e.target.value)}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.72rem",
                color: "var(--pg-text-sub)",
                paddingTop: 2,
              }}
            >
              {["8", "32", "64", "96", "128"].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>

          {/* Options */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--pg-text-sub)",
              }}
            >
              Loại ký tự
            </span>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.5rem",
              }}
            >
              {(
                [
                  {
                    key: "uppercase",
                    icon: "A",
                    name: "Uppercase",
                    desc: "A–Z",
                  },
                  {
                    key: "lowercase",
                    icon: "a",
                    name: "Lowercase",
                    desc: "a–z",
                  },
                  { key: "numbers", icon: "1", name: "Numbers", desc: "0–9" },
                  { key: "symbols", icon: "@", name: "Symbols", desc: "!@#$%" },
                ] as const
              ).map(({ key, icon, name, desc }) => (
                <label key={key} className="pg-option-card">
                  <input
                    type="checkbox"
                    checked={options[key]}
                    onChange={() => toggleOption(key)}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      pointerEvents: "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: options[key]
                          ? "var(--pg-accent)"
                          : "var(--pg-text-sub)",
                      }}
                    >
                      {icon}
                    </span>
                    <span
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: "var(--pg-text)",
                      }}
                    >
                      {name}
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--pg-text-sub)",
                      }}
                    >
                      {desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            {optionError && (
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--pg-weak)",
                  margin: 0,
                }}
              >
                ⚠️ Chọn ít nhất một loại ký tự!
              </p>
            )}
          </div>

          {/* Generate button */}
          <button
            onClick={doGenerate}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              background: "var(--pg-accent)",
              color: "#0d1117",
              border: "none",
              borderRadius: "var(--pg-radius-sm)",
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
            <span>🎲</span>
            <span>Generate Password</span>
          </button>
        </section>

        {/* ── Right: Output ── */}
        <section className="pg-panel">
          {/* Password display */}
          <div
            style={{ display: "flex", gap: "0.5rem", alignItems: "stretch" }}
          >
            <div className="pg-password-display">
              <span
                className={`pg-password-text${generating ? " pg-generating" : ""}${!password ? " placeholder" : ""}`}
              >
                {password || "Click Generate →"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              <button
                onClick={() => doCopy(password)}
                title="Copy to clipboard"
                style={{
                  background: "var(--pg-card-hover)",
                  border: "1px solid var(--pg-border)",
                  borderRadius: "var(--pg-radius-sm)",
                  width: 42,
                  height: 42,
                  cursor: "pointer",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "border-color 0.2s",
                  flexShrink: 0,
                }}
              >
                {copyState === "copied" ? "✅" : "📋"}
              </button>
              <button
                onClick={doGenerate}
                title="Regenerate"
                style={{
                  background: "var(--pg-card-hover)",
                  border: "1px solid var(--pg-border)",
                  borderRadius: "var(--pg-radius-sm)",
                  width: 42,
                  height: 42,
                  cursor: "pointer",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "border-color 0.2s",
                  flexShrink: 0,
                }}
              >
                🔄
              </button>
            </div>
          </div>

          {/* Strength */}
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
                  color: "var(--pg-text-sub)",
                  fontWeight: 600,
                }}
              >
                Độ mạnh
              </span>
              {strength.level && (
                <span className={`pg-strength-badge ${strength.level}`}>
                  {strength.label}
                </span>
              )}
            </div>
            <div className="pg-strength-bar-track">
              <div
                className={`pg-strength-bar-fill${strength.level ? ` ${strength.level}` : ""}`}
              />
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "0.8rem",
                color: "var(--pg-text-sub)",
              }}
            >
              {strength.hint}
            </p>
          </div>

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
                  color: "var(--pg-text-sub)",
                }}
              >
                🕐 Lịch sử (5 gần nhất)
              </span>
              <button
                onClick={() => setHistory([])}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--pg-text-sub)",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  padding: "0.2rem 0.4rem",
                  borderRadius: 4,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--pg-weak)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--pg-text-sub)")
                }
              >
                Xóa tất cả
              </button>
            </div>

            {history.length === 0 ? (
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--pg-text-sub)",
                  margin: 0,
                }}
              >
                Chưa có mật khẩu nào được tạo.
              </p>
            ) : (
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                {history.map((pwd, i) => (
                  <li
                    key={`${pwd}-${i}`}
                    className="pg-history-item"
                    title={`Click để copy`}
                    onClick={() => doCopy(pwd)}
                  >
                    <span className="pg-history-item-text">
                      {maskPassword(pwd)}
                    </span>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        opacity: 0.6,
                        flexShrink: 0,
                      }}
                    >
                      📋
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Learning log */}
          <details className="pg-log">
            <summary>📚 Learning Log — Crypto API</summary>
            <div className="pg-log-content">
              <p>
                <strong>Tại sao dùng Crypto API thay vì Math.random()?</strong>
              </p>
              <p>
                <code>Math.random()</code> không cryptographically secure — kẻ
                tấn công có thể dự đoán output.{" "}
                <code>crypto.getRandomValues()</code> dùng entropy từ OS, đảm
                bảo unpredictability thực sự.
              </p>
              <pre>
                <code>{`const arr = new Uint32Array(1);
crypto.getRandomValues(arr);
// arr[0] là số random an toàn`}</code>
              </pre>
              <p>
                <strong>Clipboard API:</strong>{" "}
                <code>navigator.clipboard.writeText()</code> — async, cần HTTPS
                hoặc localhost.
              </p>
            </div>
          </details>
        </section>
      </div>

      {/* Toast */}
      <div className={`pg-toast${showToast ? " show" : ""}`}>
        ✅ Đã copy vào clipboard!
      </div>
    </div>
  );
}
