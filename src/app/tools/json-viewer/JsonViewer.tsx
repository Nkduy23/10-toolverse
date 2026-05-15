"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import "./json-viewer.css";

// ── Types ──────────────────────────────────────────────────────────
type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

interface TreeNodeProps {
  keyName?: string;
  value: JsonValue;
  depth: number;
  path: string;
  searchTerm: string;
  defaultCollapsed: boolean;
  onCopy: (val: string, label: string) => void;
}

// ── Helpers ────────────────────────────────────────────────────────
function getType(val: JsonValue): string {
  if (val === null) return "null";
  if (Array.isArray(val)) return "array";
  return typeof val;
}

function countNodes(val: JsonValue): number {
  if (val === null) return 1;

  if (typeof val !== "object") return 1;

  if (Array.isArray(val)) {
    let total = 0;
    for (const v of val) {
      total += countNodes(v);
    }
    return total;
  }

  let total = 0;
  for (const v of Object.values(val)) {
    total += countNodes(v);
  }
  return total;
}

function countKeys(val: JsonValue): number {
  if (val === null) return 0;

  if (typeof val !== "object") return 0;

  if (Array.isArray(val)) {
    let total = 0;
    for (const v of val) {
      total += countKeys(v);
    }
    return total;
  }

  let total = Object.keys(val).length;

  for (const v of Object.values(val)) {
    total += countKeys(v);
  }

  return total;
}

function matchSearch(s: string, term: string): boolean {
  return term.length > 0 && s.toLowerCase().includes(term.toLowerCase());
}

function countMatches(val: JsonValue, term: string): number {
  if (!term) return 0;
  let count = 0;
  function walk(v: JsonValue, k?: string) {
    if (k && matchSearch(k, term)) count++;
    if (v === null) {
      if (matchSearch("null", term)) count++;
      return;
    }
    if (typeof v === "object") {
      if (Array.isArray(v)) v.forEach((item, i) => walk(item, String(i)));
      else Object.entries(v).forEach(([key, child]) => walk(child, key));
    } else {
      if (matchSearch(String(v), term)) count++;
    }
  }
  walk(val);
  return count;
}

// ── Tree Node ──────────────────────────────────────────────────────
function TreeNode({
  keyName,
  value,
  depth,
  path,
  searchTerm,
  defaultCollapsed,
  onCopy,
}: TreeNodeProps) {
  const type = getType(value);
  const isCollapsible = type === "object" || type === "array";
  const [collapsed, setCollapsed] = useState(
    () => defaultCollapsed && depth > 0,
  );
  const [copyFlash, setCopyFlash] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const childCount = isCollapsible
    ? Array.isArray(value)
      ? value.length
      : Object.keys(value as object).length
    : 0;

  const keyHighlight = keyName && matchSearch(keyName, searchTerm);

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const serialized =
        typeof value === "string" ? value : JSON.stringify(value, null, 2);
      onCopy(serialized, path || "root");
      setCopyFlash(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopyFlash(false), 1000);
    },
    [value, path, onCopy],
  );

  const indent = depth * 0;

  // ── Leaf value rendering ──────────────────────────────────────
  if (!isCollapsible) {
    const raw =
      type === "string"
        ? `"${value}"`
        : value === null
          ? "null"
          : String(value);
    const valHighlight = matchSearch(raw, searchTerm);

    return (
      <div className="jv-node">
        <div className="jv-node-row" style={{ paddingLeft: indent }}>
          <span className="jv-toggle-spacer" />
          {keyName !== undefined && (
            <>
              <span
                className={`jv-node-key${keyHighlight ? " highlight" : ""}`}
              >
                "{keyName}"
              </span>
              <span className="jv-node-colon">:</span>
            </>
          )}
          <span
            className={`jv-node-val type-${type}${valHighlight ? " highlight" : ""}`}
          >
            {raw}
          </span>
          <button
            className={`jv-node-copy${copyFlash ? " flash" : ""}`}
            onClick={handleCopy}
          >
            {copyFlash ? "✓" : "copy"}
          </button>
        </div>
      </div>
    );
  }

  // ── Collapsible object/array ──────────────────────────────────
  const openBracket = type === "array" ? "[" : "{";
  const closeBracket = type === "array" ? "]" : "}";
  const entries: [string, JsonValue][] = Array.isArray(value)
    ? value.map((v, i) => [String(i), v])
    : Object.entries(value as Record<string, JsonValue>);

  return (
    <div className="jv-node">
      <div className="jv-node-row" style={{ paddingLeft: indent }}>
        <button
          className="jv-toggle"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "▶" : "▼"}
        </button>
        {keyName !== undefined && (
          <>
            <span className={`jv-node-key${keyHighlight ? " highlight" : ""}`}>
              "{keyName}"
            </span>
            <span className="jv-node-colon">:</span>
          </>
        )}
        <span className="jv-bracket">{openBracket}</span>
        {collapsed && (
          <span
            style={{
              color: "var(--jv-text-sub)",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
            onClick={() => setCollapsed(false)}
          >
            &nbsp;{childCount} {type === "array" ? "items" : "keys"}&nbsp;
          </span>
        )}
        {collapsed && <span className="jv-bracket">{closeBracket}</span>}
        <button
          className={`jv-node-copy${copyFlash ? " flash" : ""}`}
          onClick={handleCopy}
        >
          {copyFlash ? "✓" : "copy"}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="jv-node-children">
            {entries.map(([k, v]) => (
              <TreeNode
                key={k}
                keyName={type === "array" ? undefined : k}
                value={v}
                depth={depth + 1}
                path={path ? `${path}.${k}` : k}
                searchTerm={searchTerm}
                defaultCollapsed={defaultCollapsed}
                onCopy={onCopy}
              />
            ))}
          </div>
          <div className="jv-node-row" style={{ paddingLeft: indent }}>
            <span className="jv-toggle-spacer" />
            <span className="jv-bracket">{closeBracket}</span>
          </div>
        </>
      )}
    </div>
  );
}

// ── Stats helper ───────────────────────────────────────────────────
function computeStats(raw: string, parsed: JsonValue | null) {
  const chars = raw.length;
  const lines = raw === "" ? 0 : raw.split("\n").length;
  const keys = parsed !== null ? countKeys(parsed) : 0;
  const nodes = parsed !== null ? countNodes(parsed) : 0;
  return { chars, lines, keys, nodes };
}

// ── Main Component ─────────────────────────────────────────────────
export function JsonViewer() {
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [indent, setIndent] = useState(2);
  const [autoCollapse, setAutoCollapse] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Parse JSON ─────────────────────────────────────────────────
  const { parsed, parseError } = useMemo(() => {
    if (input.trim() === "") return { parsed: null, parseError: null };
    try {
      return { parsed: JSON.parse(input) as JsonValue, parseError: null };
    } catch (e) {
      return { parsed: null, parseError: (e as Error).message };
    }
  }, [input]);

  const prettified = useMemo(
    () => (parsed !== null ? JSON.stringify(parsed, null, indent) : ""),
    [parsed, indent],
  );

  const minified = useMemo(
    () => (parsed !== null ? JSON.stringify(parsed) : ""),
    [parsed],
  );

  const matchCount = useMemo(
    () => (parsed !== null ? countMatches(parsed, searchTerm) : 0),
    [parsed, searchTerm],
  );

  const stats = computeStats(input, parsed);

  // ── Toast ──────────────────────────────────────────────────────
  const fireToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowToast(false), 2000);
  }, []);

  // ── Actions ────────────────────────────────────────────────────
  const handleCopyNode = useCallback(
    (val: string, label: string) => {
      navigator.clipboard.writeText(val);
      fireToast(`✅ Đã copy node: ${label}`);
    },
    [fireToast],
  );

  const handleCopyAll = useCallback(async () => {
    if (!prettified) return;
    await navigator.clipboard.writeText(prettified);
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1200);
    fireToast("✅ Đã copy toàn bộ JSON!");
  }, [prettified, fireToast]);

  const handleCopyMinified = useCallback(async () => {
    if (!minified) return;
    await navigator.clipboard.writeText(minified);
    fireToast("✅ Đã copy JSON minified!");
  }, [minified, fireToast]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      fireToast("📋 Đã paste từ clipboard!");
    } catch {
      fireToast("⚠️ Không thể đọc clipboard.");
    }
  }, [fireToast]);

  const handleFormat = useCallback(() => {
    if (!prettified) return;
    setInput(prettified);
    fireToast("✨ Đã format JSON!");
  }, [prettified]);

  const handleMinify = useCallback(() => {
    if (!minified) return;
    setInput(minified);
    fireToast("📦 Đã minify JSON!");
  }, [minified]);

  const handleClear = useCallback(() => {
    setInput("");
    setSearchTerm("");
  }, []);

  // ── Validation status ──────────────────────────────────────────
  const validStatus =
    input.trim() === "" ? "empty" : parsed !== null ? "valid" : "error";

  const validLabel =
    validStatus === "empty"
      ? "Chờ nhập JSON..."
      : validStatus === "valid"
        ? `✅ JSON hợp lệ`
        : `❌ ${parseError}`;

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="jv-root">
      {/* Breadcrumb */}
      <div className="jv-breadcrumb">
        <a href="/">Tất cả tools</a>
        <span>›</span>
        <span>JSON Viewer</span>
      </div>

      <div className="jv-layout">
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
              background: "var(--jv-accent-glow)",
              border: "1px solid var(--jv-accent)",
              borderRadius: "var(--jv-radius-sm)",
            }}
          >
            🔍
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--jv-text)",
              }}
            >
              JSON Viewer
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "0.82rem",
                color: "var(--jv-text-sub)",
              }}
            >
              Validate · Format · Minify · Tree view · Search · Copy node
            </p>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="jv-toolbar">
          {/* Format / Minify */}
          <div className="jv-toolbar-group">
            <span className="jv-toolbar-label">Transform:</span>
            <button
              className="jv-btn"
              onClick={handleFormat}
              disabled={!parsed}
              title="Prettify JSON với indent"
            >
              ✨ Format
            </button>
            <button
              className="jv-btn"
              onClick={handleMinify}
              disabled={!parsed}
              title="Minify JSON thành 1 dòng"
            >
              📦 Minify
            </button>
          </div>

          <div className="jv-divider" />

          {/* Indent selector */}
          <div className="jv-toolbar-group">
            <span className="jv-toolbar-label">Indent:</span>
            <select
              className="jv-indent-select"
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              title="Số space indent khi format"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={8}>8 spaces</option>
            </select>
          </div>

          <div className="jv-divider" />

          {/* Collapse toggle */}
          <div className="jv-toolbar-group">
            <button
              className={`jv-btn${autoCollapse ? " active" : ""}`}
              onClick={() => setAutoCollapse((v) => !v)}
              title="Auto-collapse các node con khi render"
            >
              {autoCollapse ? "▶ Collapsed" : "▼ Expanded"}
            </button>
          </div>

          <div className="jv-divider" />

          {/* Search */}
          <div className="jv-search-wrap">
            <span className="jv-search-icon">🔎</span>
            <input
              className="jv-search"
              type="text"
              placeholder="Tìm key / value..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!parsed}
            />
            {searchTerm && parsed && (
              <span className="jv-search-count">{matchCount}</span>
            )}
          </div>

          <div className="jv-divider" />

          {/* Copy / Paste / Clear */}
          <div className="jv-toolbar-group" style={{ marginLeft: "auto" }}>
            <button
              className="jv-btn"
              onClick={handlePaste}
              title="Paste từ clipboard"
            >
              📋 Paste
            </button>
            <button
              className="jv-btn success"
              onClick={handleCopyAll}
              disabled={!parsed}
              title="Copy JSON đã format"
            >
              {copied ? "✅ Copied!" : "📋 Copy"}
            </button>
            <button
              className="jv-btn"
              onClick={handleCopyMinified}
              disabled={!parsed}
              title="Copy JSON minified"
            >
              Copy min
            </button>
            <button
              className="jv-btn danger"
              onClick={handleClear}
              title="Xóa toàn bộ"
            >
              ✕ Clear
            </button>
          </div>
        </div>

        {/* ── Editor: Raw / Tree ── */}
        <div className="jv-editor-row">
          {/* Left: Raw Input */}
          <div className="jv-panel">
            <div className="jv-panel-header">
              <span className="jv-panel-title">📝 Raw JSON</span>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--jv-text-sub)",
                    alignSelf: "center",
                  }}
                >
                  {input.length.toLocaleString()} chars
                </span>
              </div>
            </div>

            <textarea
              className={`jv-textarea${
                validStatus === "error"
                  ? " error"
                  : validStatus === "valid"
                    ? " valid"
                    : ""
              }`}
              placeholder={`Nhập JSON vào đây...\n\nVí dụ:\n{\n  "name": "ToolVerse",\n  "version": 1,\n  "tools": ["json-viewer", "text-formatter"]\n}`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
            />

            {/* Validation bar */}
            <div className={`jv-validate-bar ${validStatus}`}>{validLabel}</div>

            {/* Stats */}
            <div className="jv-stats">
              {[
                { val: stats.chars, lbl: "Ký tự" },
                { val: stats.lines, lbl: "Dòng" },
                { val: stats.keys, lbl: "Keys" },
                { val: stats.nodes, lbl: "Nodes" },
              ].map(({ val, lbl }) => (
                <div key={lbl} className="jv-stat">
                  <span className="jv-stat-val">{val.toLocaleString()}</span>
                  <span className="jv-stat-lbl">{lbl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Tree View */}
          <div className="jv-panel">
            <div className="jv-panel-header">
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <span className="jv-panel-title">🌳 Tree View</span>
                {searchTerm && parsed && (
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "0.15rem 0.55rem",
                      borderRadius: 5,
                      background: "rgba(247,201,72,0.15)",
                      color: "var(--jv-number)",
                      border: "1px solid rgba(247,201,72,0.35)",
                    }}
                  >
                    {matchCount} matches
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "var(--jv-text-sub)",
                }}
              >
                Hover node → copy
              </span>
            </div>

            <div className={`jv-tree-wrap${searchTerm ? " has-search" : ""}`}>
              {parsed !== null ? (
                <TreeNode
                  value={parsed}
                  depth={0}
                  path=""
                  searchTerm={searchTerm}
                  defaultCollapsed={autoCollapse}
                  onCopy={handleCopyNode}
                />
              ) : (
                <div className="jv-tree-empty">
                  <div className="jv-tree-empty-icon">
                    {validStatus === "error" ? "⚠️" : "🌳"}
                  </div>
                  <div>
                    {validStatus === "error"
                      ? "JSON không hợp lệ"
                      : "Tree view sẽ hiện ở đây"}
                  </div>
                  {validStatus === "error" && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--jv-danger)",
                        maxWidth: 280,
                      }}
                    >
                      {parseError}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tree stats */}
            <div className="jv-stats">
              {[
                { val: stats.keys, lbl: "Keys" },
                { val: stats.nodes, lbl: "Nodes" },
                {
                  val: minified.length,
                  lbl: "Min size",
                },
                {
                  val: prettified.length,
                  lbl: "Pretty size",
                },
              ].map(({ val, lbl }) => (
                <div key={lbl} className="jv-stat">
                  <span className="jv-stat-val">{val.toLocaleString()}</span>
                  <span className="jv-stat-lbl">{lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Learning Log ── */}
        <details className="jv-log">
          <summary>
            📚 Learning Log — JSON parsing, tree recursion & search
          </summary>
          <div className="jv-log-content">
            <p>
              <strong>JSON.parse() — built-in nhưng cần try/catch</strong>
            </p>
            <p>
              Bọc trong <code>try/catch</code> để bắt <code>SyntaxError</code>.
              Message lỗi từ browser rất mô tả (vị trí ký tự bị lỗi), có thể
              hiển thị trực tiếp cho user.
            </p>
            <p>
              <strong>Recursive Tree rendering với React</strong>
            </p>
            <p>
              Component <code>TreeNode</code> tự gọi lại chính nó cho mỗi child.
              Dùng <code>useMemo</code> ở root để tránh re-parse mỗi keystroke.
              State <code>collapsed</code> nằm trong từng node — mỗi node quản
              lý trạng thái của mình độc lập.
            </p>
            <p>
              <strong>Search/highlight</strong> — walk toàn bộ cây để đếm
              matches trước, sau đó mỗi node tự kiểm tra key/value của mình có
              chứa search term không qua <code>toLowerCase().includes()</code>.
              Class <code>.highlight</code> được thêm inline.
            </p>
            <p>
              <strong>Copy node</strong> — mỗi node nhận <code>onCopy</code>{" "}
              callback từ parent, khi click sẽ{" "}
              <code>JSON.stringify(value, null, 2)</code> rồi write vào
              clipboard. Node lá thì copy raw value (string không có quotes).
            </p>
            <p>
              <strong>Minify vs Prettify</strong> —{" "}
              <code>JSON.stringify(obj)</code> = minified (không space),{" "}
              <code>JSON.stringify(obj, null, 2)</code> = prettified với indent
              2 space. Replacer parameter (thứ 2) để <code>null</code> = giữ
              toàn bộ keys.
            </p>
          </div>
        </details>
      </div>

      {/* Toast */}
      <div className={`jv-toast${showToast ? " show" : ""}`}>{toastMsg}</div>
    </div>
  );
}
