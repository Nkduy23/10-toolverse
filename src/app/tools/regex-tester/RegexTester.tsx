"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import "./regex-tester.css";

// ── Types ──────────────────────────────────────────────────────────
interface MatchResult {
  value: string;
  index: number;
  length: number;
  groups: Record<string, string | undefined>;
  groupsArray: (string | undefined)[];
}

interface ExplainToken {
  token: string;
  description: string;
}

// ── Snippet library ────────────────────────────────────────────────
const SNIPPETS = [
  {
    name: "Email",
    pattern: "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}",
    flags: "g",
  },
  {
    name: "URL",
    pattern:
      "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z]{2,6}\\b([-a-zA-Z0-9@:%_+.~#?&/=]*)",
    flags: "g",
  },
  {
    name: "Phone VN",
    pattern: "(\\+84|0)(3[2-9]|5[6-9]|7[06-9]|8[0-9]|9[0-9])[0-9]{7}",
    flags: "g",
  },
  {
    name: "Phone US",
    pattern: "\\+?1?[-.\\s]?\\(?[0-9]{3}\\)?[-.\\s]?[0-9]{3}[-.\\s]?[0-9]{4}",
    flags: "g",
  },
  {
    name: "IPv4",
    pattern:
      "\\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    flags: "g",
  },
  {
    name: "Hex Color",
    pattern: "#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b",
    flags: "g",
  },
  {
    name: "Date DD/MM/YYYY",
    pattern: "(0?[1-9]|[12][0-9]|3[01])[\\/\\-](0?[1-9]|1[012])[\\/\\-]\\d{4}",
    flags: "g",
  },
  { name: "Time HH:MM", pattern: "([01]?[0-9]|2[0-3]):[0-5][0-9]", flags: "g" },
  { name: "Số nguyên", pattern: "-?\\d+", flags: "g" },
  { name: "Số thực", pattern: "-?\\d+(\\.\\d+)?", flags: "g" },
  { name: "Chỉ chữ cái", pattern: "[a-zA-ZÀ-ỹ]+", flags: "g" },
  { name: "Slug", pattern: "[a-z0-9]+(?:-[a-z0-9]+)*", flags: "g" },
  { name: "Hashtag", pattern: "#[\\w\\u00C0-\\u024F]+", flags: "g" },
  {
    name: "HTML tag",
    pattern: "<([a-z][a-z0-9]*)\\b[^>]*>(.*?)<\\/\\1>",
    flags: "gis",
  },
  { name: "Dòng trống", pattern: "^\\s*$", flags: "gm" },
  { name: "Khoảng trắng thừa", pattern: "\\s{2,}", flags: "g" },
];

// ── Regex explainer ────────────────────────────────────────────────
function explainRegex(pattern: string): ExplainToken[] {
  const tokens: ExplainToken[] = [];
  let i = 0;

  const CHAR_CLASS_NAMES: Record<string, string> = {
    d: "chữ số [0-9]",
    D: "không phải chữ số",
    w: "ký tự word [a-zA-Z0-9_]",
    W: "không phải ký tự word",
    s: "whitespace (space, tab, newline)",
    S: "không phải whitespace",
    b: "word boundary",
    B: "không phải word boundary",
    n: "newline",
    r: "carriage return",
    t: "tab",
    0: "null character",
  };

  while (i < pattern.length) {
    const ch = pattern[i];

    // Escaped sequence
    if (ch === "\\" && i + 1 < pattern.length) {
      const next = pattern[i + 1];
      const desc = CHAR_CLASS_NAMES[next];
      if (desc) {
        tokens.push({
          token: `\\${next}`,
          description: `**Ký tự đặc biệt:** ${desc}`,
        });
      } else if (/[1-9]/.test(next)) {
        tokens.push({
          token: `\\${next}`,
          description: `**Backreference:** tham chiếu lại capture group #${next}`,
        });
      } else {
        tokens.push({
          token: `\\${next}`,
          description: `**Escape:** ký tự literal "${next}"`,
        });
      }
      i += 2;
      continue;
    }

    // Character class [...]
    if (ch === "[") {
      let j = i + 1;
      let cls = "[";
      if (j < pattern.length && pattern[j] === "^") {
        cls += "^";
        j++;
      }
      while (j < pattern.length && pattern[j] !== "]") {
        cls += pattern[j];
        j++;
      }
      cls += "]";
      const negated = cls[1] === "^";
      const inner = negated ? cls.slice(2, -1) : cls.slice(1, -1);
      tokens.push({
        token: cls,
        description: `**Character class:** khớp ${negated ? "bất kỳ ký tự NGOÀI" : "bất kỳ ký tự trong"} tập \`${inner}\``,
      });
      i = j + 1;
      continue;
    }

    // Groups
    if (ch === "(") {
      if (pattern.slice(i, i + 3) === "(?:") {
        tokens.push({
          token: "(?:",
          description: "**Non-capturing group:** nhóm nhưng không lưu kết quả",
        });
        i += 3;
        continue;
      }
      if (pattern.slice(i, i + 4) === "(?=") {
        tokens.push({
          token: "(?=",
          description:
            "**Lookahead:** khớp nếu theo sau bởi pattern (không consume)",
        });
        i += 4;
        continue;
      }
      if (pattern.slice(i, i + 4) === "(?!") {
        tokens.push({
          token: "(?!",
          description:
            "**Negative lookahead:** khớp nếu KHÔNG theo sau bởi pattern",
        });
        i += 4;
        continue;
      }
      if (pattern.slice(i, i + 5) === "(?<=") {
        tokens.push({
          token: "(?<=",
          description: "**Lookbehind:** khớp nếu đứng trước bởi pattern",
        });
        i += 5;
        continue;
      }
      if (pattern.slice(i, i + 5) === "(?<!") {
        tokens.push({
          token: "(?<!",
          description:
            "**Negative lookbehind:** khớp nếu KHÔNG đứng trước bởi pattern",
        });
        i += 5;
        continue;
      }
      // Named group (?<name>
      const namedMatch = pattern.slice(i).match(/^\(\?<([^>]+)>/);
      if (namedMatch) {
        tokens.push({
          token: `(?<${namedMatch[1]}>`,
          description: `**Named capture group:** \`${namedMatch[1]}\` — lưu match vào groups.${namedMatch[1]}`,
        });
        i += namedMatch[0].length;
        continue;
      }
      tokens.push({
        token: "(",
        description:
          "**Capture group:** bắt đầu nhóm, lưu kết quả vào groups array",
      });
      i++;
      continue;
    }

    if (ch === ")") {
      tokens.push({ token: ")", description: "**Kết thúc group**" });
      i++;
      continue;
    }

    // Quantifiers
    if (ch === "{") {
      let j = i + 1;
      let quant = "{";
      while (j < pattern.length && pattern[j] !== "}") {
        quant += pattern[j];
        j++;
      }
      quant += "}";
      const lazy = pattern[j + 1] === "?" ? "?" : "";
      const inner = quant.slice(1, -1);
      const [min, max] = inner.split(",").map((s) => s.trim());
      let desc = "";
      if (max === undefined) desc = `**Quantifier:** lặp đúng ${min} lần`;
      else if (max === "") desc = `**Quantifier:** lặp ít nhất ${min} lần`;
      else desc = `**Quantifier:** lặp từ ${min} đến ${max} lần`;
      if (lazy) desc += " *(lazy — ít nhất có thể)*";
      tokens.push({ token: quant + lazy, description: desc });
      i = j + 1 + (lazy ? 1 : 0);
      continue;
    }

    // Simple quantifiers
    const QUANTS: Record<string, string> = {
      "*": "**Quantifier `*`:** 0 hoặc nhiều lần (greedy)",
      "+": "**Quantifier `+`:** 1 hoặc nhiều lần (greedy)",
      "?": "**Quantifier `?`:** 0 hoặc 1 lần (optional)",
    };
    if (QUANTS[ch]) {
      const lazy = pattern[i + 1] === "?" ? "?" : "";
      tokens.push({
        token: ch + lazy,
        description: QUANTS[ch] + (lazy ? " *(lazy)*" : ""),
      });
      i += 1 + (lazy ? 1 : 0);
      continue;
    }

    // Anchors
    if (ch === "^") {
      tokens.push({
        token: "^",
        description: "**Anchor `^`:** đầu chuỗi (hoặc đầu dòng với flag `m`)",
      });
      i++;
      continue;
    }
    if (ch === "$") {
      tokens.push({
        token: "$",
        description: "**Anchor `$`:** cuối chuỗi (hoặc cuối dòng với flag `m`)",
      });
      i++;
      continue;
    }
    if (ch === ".") {
      tokens.push({
        token: ".",
        description:
          "**Wildcard `.`:** bất kỳ ký tự nào (trừ newline, trừ khi có flag `s`)",
      });
      i++;
      continue;
    }
    if (ch === "|") {
      tokens.push({
        token: "|",
        description:
          "**Alternation `|`:** OR — khớp pattern bên trái HOẶC bên phải",
      });
      i++;
      continue;
    }

    // Literal char
    tokens.push({ token: ch, description: `**Literal:** ký tự "${ch}"` });
    i++;
  }

  return tokens;
}

// ── Build highlighted HTML ─────────────────────────────────────────
function buildHighlightedHtml(text: string, matches: MatchResult[]): string {
  if (matches.length === 0) return escapeHtml(text);

  let result = "";
  let cursor = 0;
  const COLORS = 5;

  matches.forEach((m, idx) => {
    if (m.index > cursor) {
      result += escapeHtml(text.slice(cursor, m.index));
    }
    const colorIdx = idx % COLORS;
    result += `<span class="rt-match" data-idx="${colorIdx}" title="Match #${idx + 1}: ${escapeHtml(m.value)}">${escapeHtml(m.value)}</span>`;
    cursor = m.index + m.length;
  });

  if (cursor < text.length) {
    result += escapeHtml(text.slice(cursor));
  }

  return result;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Component ──────────────────────────────────────────────────────
export function RegexTester() {
  const [pattern, setPattern] = useState("(\\w+)@(\\w+\\.\\w+)");
  const [flags, setFlags] = useState<Set<string>>(new Set(["g"]));
  const [testStr, setTestStr] = useState(
    "Liên hệ: hello@toolverse.dev hoặc support@example.com\nEmail khác: user.name+tag@domain.co.vn",
  );
  const [replaceStr, setReplaceStr] = useState("[email]");
  const [showReplace, setShowReplace] = useState(false);
  const [showExplain, setShowExplain] = useState(true);
  const [showSnippets, setShowSnippets] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Toast ──────────────────────────────────────────────────────
  const fireToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowToast(false), 2000);
  }, []);

  // ── Flag toggle ────────────────────────────────────────────────
  const toggleFlag = (f: string) => {
    setFlags((prev) => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });
  };

  const flagStr = [...flags].join("");

  // ── Build regex ────────────────────────────────────────────────
  const { regex, regexError } = useMemo(() => {
    if (!pattern.trim()) return { regex: null, regexError: null };
    try {
      return { regex: new RegExp(pattern, flagStr), regexError: null };
    } catch (e) {
      return { regex: null, regexError: (e as Error).message };
    }
  }, [pattern, flagStr]);

  // ── Run matches ────────────────────────────────────────────────
  const matches = useMemo<MatchResult[]>(() => {
    if (!regex || !testStr) return [];
    const results: MatchResult[] = [];
    if (flags.has("g") || flags.has("y")) {
      regex.lastIndex = 0;
      let m: RegExpExecArray | null;
      let safety = 0;
      while ((m = regex.exec(testStr)) !== null && safety++ < 500) {
        results.push({
          value: m[0],
          index: m.index,
          length: m[0].length,
          groups: m.groups ?? {},
          groupsArray: m.slice(1),
        });
        if (!flags.has("g") && !flags.has("y")) break;
        if (m[0].length === 0) regex.lastIndex++;
      }
    } else {
      const m = regex.exec(testStr);
      if (m) {
        results.push({
          value: m[0],
          index: m.index,
          length: m[0].length,
          groups: m.groups ?? {},
          groupsArray: m.slice(1),
        });
      }
    }
    return results;
  }, [regex, testStr, flags]);

  // ── Highlighted HTML ───────────────────────────────────────────
  const highlightedHtml = useMemo(
    () => buildHighlightedHtml(testStr, matches),
    [testStr, matches],
  );

  // ── Replace result ─────────────────────────────────────────────
  const replaceResult = useMemo(() => {
    if (!regex || !testStr) return "";
    try {
      const r = new RegExp(pattern, flagStr);
      return testStr.replace(r, replaceStr);
    } catch {
      return "";
    }
  }, [regex, pattern, flagStr, testStr, replaceStr]);

  // ── Explain tokens ─────────────────────────────────────────────
  const explainTokens = useMemo(
    () => (pattern.trim() && !regexError ? explainRegex(pattern) : []),
    [pattern, regexError],
  );

  // ── Apply snippet ──────────────────────────────────────────────
  const applySnippet = (s: (typeof SNIPPETS)[0]) => {
    setPattern(s.pattern);
    setFlags(new Set(s.flags.split("")));
    fireToast(`✅ Đã load: ${s.name}`);
  };

  // ── Copy ──────────────────────────────────────────────────────
  const copyRegex = useCallback(async () => {
    await navigator.clipboard.writeText(`/${pattern}/${flagStr}`);
    fireToast("✅ Đã copy regex!");
  }, [pattern, flagStr, fireToast]);

  const copyMatches = useCallback(async () => {
    const text = matches.map((m) => m.value).join("\n");
    await navigator.clipboard.writeText(text);
    fireToast(`✅ Đã copy ${matches.length} matches!`);
  }, [matches, fireToast]);

  const copyReplace = useCallback(async () => {
    await navigator.clipboard.writeText(replaceResult);
    fireToast("✅ Đã copy kết quả replace!");
  }, [replaceResult, fireToast]);

  // ── Render ─────────────────────────────────────────────────────
  const hasError = !!regexError;
  const hasMatches = matches.length > 0;

  return (
    <div className="rt-root">
      {/* Breadcrumb */}
      <div className="rt-breadcrumb">
        <a href="/">Tất cả tools</a>
        <span>›</span>
        <span>Regex Tester</span>
      </div>

      <div className="rt-layout">
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
              background: "var(--rt-accent-glow)",
              border: "1px solid var(--rt-accent)",
              borderRadius: "var(--rt-radius-sm)",
            }}
          >
            🔎
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--rt-text)",
              }}
            >
              Regex Tester
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "0.82rem",
                color: "var(--rt-text-sub)",
              }}
            >
              Match highlight · Explain · Replace · 16 snippet patterns
            </p>
          </div>
        </div>

        {/* ── Regex input panel ── */}
        <div className="rt-panel">
          <div className="rt-panel-header">
            <span className="rt-panel-title">⚡ Regular Expression</span>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <button
                className="rt-btn"
                onClick={copyRegex}
                disabled={!pattern}
              >
                📋 Copy /{pattern}/{flagStr}
              </button>
            </div>
          </div>

          {/* Regex input */}
          <div
            className={`rt-regex-row${hasError ? " error" : pattern && !regexError ? " valid" : ""}`}
          >
            <span className="rt-regex-slash">/</span>
            <input
              className="rt-regex-input"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="nhập regex pattern..."
              spellCheck={false}
              autoComplete="off"
            />
            <span className="rt-regex-slash">/</span>
            <div className="rt-regex-flags-wrap">
              {["g", "i", "m", "s", "u"].map((f) => (
                <button
                  key={f}
                  className={`rt-flag-btn${flags.has(f) ? " active" : ""}`}
                  onClick={() => toggleFlag(f)}
                  title={
                    f === "g"
                      ? "global — tìm tất cả matches"
                      : f === "i"
                        ? "insensitive — không phân biệt hoa/thường"
                        : f === "m"
                          ? "multiline — ^ $ khớp đầu/cuối từng dòng"
                          : f === "s"
                            ? "dotAll — . khớp cả newline"
                            : "unicode — hỗ trợ Unicode đầy đủ"
                  }
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {hasError && (
            <div className="rt-error-bar">
              <span>⚠️</span> {regexError}
            </div>
          )}

          {/* Quick toggle buttons */}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            <button
              className={`rt-btn${showReplace ? " active" : ""}`}
              onClick={() => setShowReplace((v) => !v)}
            >
              🔄 Replace
            </button>
            <button
              className={`rt-btn${showExplain ? " active" : ""}`}
              onClick={() => setShowExplain((v) => !v)}
            >
              📖 Explain
            </button>
            <button
              className={`rt-btn${showSnippets ? " active" : ""}`}
              onClick={() => setShowSnippets((v) => !v)}
            >
              📚 Snippets
            </button>
          </div>
        </div>

        {/* ── Snippet library ── */}
        {showSnippets && (
          <div className="rt-panel">
            <span className="rt-panel-title">📚 Regex Snippets</span>
            <div className="rt-snippet-grid">
              {SNIPPETS.map((s) => (
                <button
                  key={s.name}
                  className="rt-snippet-btn"
                  onClick={() => applySnippet(s)}
                >
                  <span className="rt-snippet-name">{s.name}</span>
                  <span className="rt-snippet-pattern">
                    /{s.pattern.slice(0, 40)}
                    {s.pattern.length > 40 ? "…" : ""}/{s.flags}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Main grid: Test string + Highlight ── */}
        <div className="rt-main-grid">
          {/* Left: Test string */}
          <div className="rt-panel">
            <div className="rt-panel-header">
              <span className="rt-panel-title">📝 Test String</span>
              <div
                style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}
              >
                {hasMatches && (
                  <span className="rt-match-badge">
                    {matches.length} match{matches.length > 1 ? "es" : ""}
                  </span>
                )}
                {!hasError && pattern && testStr && !hasMatches && (
                  <span className="rt-match-badge zero">0 matches</span>
                )}
              </div>
            </div>

            <textarea
              className="rt-textarea"
              value={testStr}
              onChange={(e) => setTestStr(e.target.value)}
              placeholder="Nhập chuỗi để test regex..."
              spellCheck={false}
            />

            <div className="rt-stats">
              {[
                { val: testStr.length, lbl: "Ký tự" },
                { val: testStr.split("\n").length, lbl: "Dòng" },
                { val: matches.length, lbl: "Matches" },
                {
                  val: [...new Set(matches.map((m) => m.value))].length,
                  lbl: "Unique",
                },
              ].map(({ val, lbl }) => (
                <div key={lbl} className="rt-stat">
                  <span className="rt-stat-val">{val}</span>
                  <span className="rt-stat-lbl">{lbl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Highlight + Match list */}
          <div className="rt-panel">
            <div className="rt-panel-header">
              <span className="rt-panel-title">✨ Highlighted Matches</span>
              {hasMatches && (
                <button className="rt-btn success" onClick={copyMatches}>
                  📋 Copy matches
                </button>
              )}
            </div>

            {/* Highlight display */}
            <div
              className={`rt-highlight-wrap${!testStr ? " empty" : ""}`}
              dangerouslySetInnerHTML={{
                __html: testStr
                  ? highlightedHtml
                  : "Kết quả highlight sẽ hiện ở đây...",
              }}
            />

            {/* Match list */}
            {hasMatches && (
              <>
                <span
                  className="rt-panel-title"
                  style={{ marginTop: "0.25rem" }}
                >
                  📋 Match List
                </span>
                <div className="rt-match-list">
                  {matches.map((m, idx) => (
                    <div
                      key={idx}
                      className="rt-match-item"
                      style={{ animationDelay: `${idx * 0.04}s` }}
                    >
                      <span className="rt-match-idx" data-idx={idx % 5}>
                        {idx + 1}
                      </span>
                      <span className="rt-match-val">"{m.value}"</span>
                      <span className="rt-match-pos">
                        [{m.index}–{m.index + m.length - 1}]
                      </span>
                      {m.groupsArray.filter(Boolean).length > 0 && (
                        <div className="rt-match-groups">
                          {m.groupsArray.map((g, gi) =>
                            g !== undefined ? (
                              <span key={gi} className="rt-match-group-tag">
                                ${gi + 1}: {g}
                              </span>
                            ) : null,
                          )}
                          {Object.entries(m.groups).map(([k, v]) =>
                            v !== undefined ? (
                              <span key={k} className="rt-match-group-tag">
                                {k}: {v}
                              </span>
                            ) : null,
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Replace panel ── */}
        {showReplace && (
          <div className="rt-panel">
            <div className="rt-panel-header">
              <span className="rt-panel-title">🔄 Replace</span>
              <button
                className="rt-btn success"
                onClick={copyReplace}
                disabled={!replaceResult}
              >
                📋 Copy result
              </button>
            </div>
            <div className="rt-replace-row">
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "var(--rt-text-sub)",
                  flexShrink: 0,
                }}
              >
                Thay bằng:
              </span>
              <input
                className="rt-replace-input"
                value={replaceStr}
                onChange={(e) => setReplaceStr(e.target.value)}
                placeholder="Chuỗi thay thế... ($1, $2 cho groups)"
              />
            </div>
            <div className="rt-replace-result">
              {replaceResult || "Kết quả replace sẽ hiện ở đây..."}
            </div>
          </div>
        )}

        {/* ── Explain panel ── */}
        {showExplain && explainTokens.length > 0 && (
          <div className="rt-panel">
            <span className="rt-panel-title">📖 Pattern Explanation</span>
            <div className="rt-explain-list">
              {explainTokens.map((t, i) => (
                <div
                  key={i}
                  className="rt-explain-item"
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <span className="rt-explain-token">{t.token}</span>
                  <span
                    className="rt-explain-desc"
                    dangerouslySetInnerHTML={{
                      __html: t.description
                        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                        .replace(
                          /`(.+?)`/g,
                          "<code style='font-family:JetBrains Mono,monospace;font-size:0.78rem;background:rgba(247,161,48,0.12);padding:0.05rem 0.3rem;border-radius:3px;color:#f7a130'>$1</code>",
                        ),
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Learning Log ── */}
        <details className="rt-log">
          <summary>
            📚 Learning Log — RegExp, exec loop & explain parser
          </summary>
          <div className="rt-log-content">
            <p>
              <strong>RegExp.exec() loop với flag g</strong>
            </p>
            <p>
              Dùng <code>regex.exec(str)</code> trong vòng lặp thay vì{" "}
              <code>str.matchAll()</code> để có thêm index và groups. Quan
              trọng: phải reset <code>regex.lastIndex = 0</code> trước mỗi lần
              chạy vì regex có flag <code>g</code> nhớ vị trí giữa các lần exec.
              Nếu không reset → kết quả bị lệch hoặc bỏ sót.
            </p>
            <p>
              <strong>Highlight bằng HTML string inject</strong>
            </p>
            <p>
              Thay vì React component cho từng char, build HTML string với{" "}
              <code>dangerouslySetInnerHTML</code>. Phải{" "}
              <code>escapeHtml()</code> tất cả text thuần để tránh XSS — đặc
              biệt quan trọng vì user tự nhập test string.
            </p>
            <p>
              <strong>Regex explainer — hand-rolled parser</strong>
            </p>
            <p>
              Không dùng thư viện — parse từng ký tự bằng vòng lặp{" "}
              <code>while</code>, nhận diện escape sequences (<code>\d</code>,{" "}
              <code>\w</code>…), character classes (<code>[...]</code>), groups
              (<code>(?:</code>, <code>(?=</code>…), quantifiers (
              <code>
                {"{"}
                {"}"}m,n
              </code>
              ) và lazy modifier (<code>?</code> sau quantifier). Đủ cho 95%
              regex thực tế.
            </p>
            <p>
              <strong>Replace với capture groups</strong>
            </p>
            <p>
              <code>str.replace(regex, replacement)</code> tự hiểu{" "}
              <code>$1</code>, <code>$2</code> là group references và{" "}
              <code>${"<name>"}</code> cho named groups. Không cần xử lý thủ
              công.
            </p>
          </div>
        </details>
      </div>

      {/* Toast */}
      <div className={`rt-toast${showToast ? " show" : ""}`}>{toastMsg}</div>
    </div>
  );
}
