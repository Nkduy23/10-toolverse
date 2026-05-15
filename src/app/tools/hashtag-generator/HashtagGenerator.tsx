"use client";

import { useState, useCallback, useRef } from "react";
import "./hashtag-generator.css";

// ── Types ──────────────────────────────────────────────────────────
type Platform = "instagram" | "tiktok" | "twitter" | "linkedin" | "youtube";
type LangOption = "en" | "vi";
type MixOption = "trending" | "niche" | "broad" | "community";

interface PlatformDef {
  key: Platform;
  label: string;
  icon: string;
  color: string;
  maxTags: number;
  idealCount: number;
  tip: string;
}

// ── Platform definitions ───────────────────────────────────────────
const PLATFORMS: PlatformDef[] = [
  {
    key: "instagram",
    label: "Instagram",
    icon: "📸",
    color: "#e1306c",
    maxTags: 30,
    idealCount: 20,
    tip: "Tối đa 30 tags. Mix niche + broad để reach tốt nhất.",
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: "🎵",
    color: "#38AAB2",
    maxTags: 100,
    idealCount: 5,
    tip: "Dùng 3–5 tags trending. #fyp và #foryou luôn hiệu quả.",
  },
  {
    key: "twitter",
    label: "X (Twitter)",
    icon: "𝕏",
    color: "#1d9bf0",
    maxTags: 280,
    idealCount: 2,
    tip: "Chỉ 1–3 tags là đủ. Quá nhiều làm giảm engagement.",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: "💼",
    color: "#0a66c2",
    maxTags: 30,
    idealCount: 5,
    tip: "3–5 tags professional. Dùng industry keywords.",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: "▶️",
    color: "#ff0000",
    maxTags: 500,
    idealCount: 15,
    tip: "Mix broad + specific search terms. Tags ảnh hưởng SEO.",
  },
];

// ── Component ──────────────────────────────────────────────────────
export function HashtagGenerator() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(20);
  const [langs, setLangs] = useState<LangOption[]>(["en"]);
  const [mix, setMix] = useState<MixOption[]>(["trending", "niche", "broad"]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const platformDef = PLATFORMS.find((p) => p.key === platform)!;

  // ── Helpers ────────────────────────────────────────────────────
  const fireToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowToast(false), 2200);
  }, []);

  const toggleLang = (l: LangOption) => {
    setLangs((prev) =>
      prev.includes(l)
        ? prev.length > 1
          ? prev.filter((x) => x !== l)
          : prev
        : [...prev, l],
    );
  };

  const toggleMix = (m: MixOption) => {
    setMix((prev) =>
      prev.includes(m)
        ? prev.length > 1
          ? prev.filter((x) => x !== m)
          : prev
        : [...prev, m],
    );
  };

  const toggleChip = (tag: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(hashtags));
  const selectNone = () => setSelected(new Set());

  // ── Generate ───────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      setError("Vui lòng nhập topic trước!");
      return;
    }
    setError("");
    setLoading(true);
    setHashtags([]);
    setSelected(new Set());

    try {
      const res = await fetch("/api/hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, count, lang: langs, mix }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Có lỗi xảy ra.");
      } else {
        setHashtags(data.hashtags ?? []);
        setSelected(new Set(data.hashtags ?? []));
        fireToast(`✅ Đã generate ${data.hashtags?.length ?? 0} hashtags!`);
      }
    } catch (e) {
      setError(`Lỗi kết nối: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [topic, platform, count, langs, mix, fireToast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
  };

  // ── Copy ───────────────────────────────────────────────────────
  const selectedTags = hashtags.filter((h) => selected.has(h));
  const copyText = selectedTags.join(" ");

  const handleCopy = useCallback(async () => {
    if (!copyText) return;
    await navigator.clipboard.writeText(copyText);
    fireToast("✅ Đã copy hashtags!");
  }, [copyText, fireToast]);

  const handleCopyOne = useCallback(
    async (tag: string) => {
      await navigator.clipboard.writeText(tag);
      fireToast(`✅ Copied: ${tag}`);
    },
    [fireToast],
  );

  // ── Limit bar ─────────────────────────────────────────────────
  const usedChars = copyText.length;
  const limitPct = Math.min(
    100,
    (selectedTags.length / platformDef.maxTags) * 100,
  );
  const overIdeal = selectedTags.length > platformDef.idealCount;

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="hg-root">
      {/* Breadcrumb */}
      <div className="hg-breadcrumb">
        <a href="/">Tất cả tools</a>
        <span>›</span>
        <span>Hashtag Generator</span>
      </div>

      <div className="hg-layout">
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
              background: "var(--hg-accent-glow)",
              border: "1px solid var(--hg-accent)",
              borderRadius: "var(--hg-radius-sm)",
            }}
          >
            #️⃣
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--hg-text)",
              }}
            >
              Hashtag Generator
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "0.82rem",
                color: "var(--hg-text-sub)",
              }}
            >
              AI-powered · 5 platforms · Tiếng Việt & English
            </p>
          </div>
        </div>

        {/* ── Platform selector ── */}
        <div className="hg-panel" style={{ gap: "0.75rem" }}>
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "var(--hg-text-sub)",
            }}
          >
            Platform:
          </span>
          <div className="hg-platforms">
            {PLATFORMS.map((p) => (
              <button
                key={p.key}
                className={`hg-platform-btn${platform === p.key ? " active" : ""}`}
                style={{ "--platform-color": p.color } as React.CSSProperties}
                onClick={() => setPlatform(p.key)}
              >
                <span className="hg-platform-dot" />
                {p.icon} {p.label}
              </button>
            ))}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--hg-text-sub)",
              padding: "0.4rem 0.75rem",
              background: "var(--hg-input)",
              borderRadius: "6px",
              border: "1px solid var(--hg-border)",
            }}
          >
            💡 {platformDef.tip}
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="hg-main-grid">
          {/* Left: Input + options */}
          <div className="hg-panel">
            <div
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--hg-text-sub)",
              }}
            >
              📝 Topic / Mô tả nội dung
            </div>

            <textarea
              className="hg-textarea"
              placeholder={`Nhập topic, mô tả post, hoặc từ khóa...\n\nVí dụ:\n"Cà phê sáng, work from home, aesthetic"`}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
            />

            <div className="hg-options">
              {/* Count slider */}
              <div className="hg-option-row">
                <span className="hg-option-label">Số lượng:</span>
                <input
                  className="hg-slider"
                  type="range"
                  min={5}
                  max={platformDef.maxTags > 30 ? 30 : platformDef.maxTags}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                />
                <span className="hg-slider-val">{count}</span>
              </div>

              {/* Language */}
              <div className="hg-option-row">
                <span className="hg-option-label">Ngôn ngữ:</span>
                <div className="hg-toggle-group">
                  {(["en", "vi"] as LangOption[]).map((l) => (
                    <button
                      key={l}
                      className={`hg-toggle-btn${langs.includes(l) ? " active" : ""}`}
                      onClick={() => toggleLang(l)}
                    >
                      {l === "en" ? "🇺🇸 English" : "🇻🇳 Tiếng Việt"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mix */}
              <div className="hg-option-row">
                <span className="hg-option-label">Mix type:</span>
                <div className="hg-toggle-group">
                  {(
                    ["trending", "niche", "broad", "community"] as MixOption[]
                  ).map((m) => (
                    <button
                      key={m}
                      className={`hg-toggle-btn${mix.includes(m) ? " active" : ""}`}
                      onClick={() => toggleMix(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="hg-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              className="hg-generate-btn"
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              title="Ctrl/Cmd + Enter"
            >
              {loading ? (
                <>
                  <span className="hg-spinner" />
                  Đang generate...
                </>
              ) : (
                <>✨ Generate Hashtags</>
              )}
            </button>

            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--hg-text-sub)",
                textAlign: "center",
              }}
            >
              Ctrl + Enter để generate nhanh
            </div>
          </div>

          {/* Right: Result */}
          <div className="hg-panel">
            <div className="hg-result-header">
              <span className="hg-result-title">
                #️⃣ Hashtags
                {hashtags.length > 0 && (
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "0.15rem 0.55rem",
                      borderRadius: 5,
                      background: "var(--hg-accent-glow)",
                      color: "var(--hg-accent)",
                      border: "1px solid rgba(247,161,48,0.4)",
                    }}
                  >
                    {hashtags.length} tags
                  </span>
                )}
              </span>
              {hashtags.length > 0 && (
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button className="hg-btn" onClick={selectAll}>
                    Chọn tất
                  </button>
                  <button className="hg-btn" onClick={selectNone}>
                    Bỏ chọn
                  </button>
                </div>
              )}
            </div>

            {/* Chips */}
            <div className="hg-chips-wrap">
              {loading &&
                Array.from({ length: count }).map((_, i) => (
                  <div
                    key={i}
                    className="hg-chip-skeleton"
                    style={{ width: `${60 + Math.random() * 60}px` }}
                  />
                ))}

              {!loading && hashtags.length === 0 && (
                <div
                  style={{
                    color: "var(--hg-text-sub)",
                    fontSize: "0.82rem",
                    margin: "auto",
                    textAlign: "center",
                    padding: "2rem",
                  }}
                >
                  <div style={{ fontSize: "2rem", opacity: 0.3 }}>#️⃣</div>
                  <div>Hashtags sẽ xuất hiện ở đây</div>
                </div>
              )}

              {!loading &&
                hashtags.map((tag, i) => (
                  <button
                    key={tag}
                    className={`hg-chip${selected.has(tag) ? " selected" : ""}`}
                    style={
                      {
                        "--platform-color": platformDef.color,
                        animationDelay: `${i * 0.03}s`,
                      } as React.CSSProperties
                    }
                    onClick={() => toggleChip(tag)}
                    onDoubleClick={() => handleCopyOne(tag)}
                    title="Click để chọn/bỏ · Double-click để copy tag này"
                  >
                    <span className="hg-chip-hash">#</span>
                    {tag.replace(/^#/, "")}
                  </button>
                ))}
            </div>

            {/* Platform limit indicator */}
            {hashtags.length > 0 && (
              <div
                className="hg-limit-bar"
                style={
                  {
                    "--platform-color": platformDef.color,
                  } as React.CSSProperties
                }
              >
                <span>
                  {selectedTags.length}/{platformDef.maxTags}
                </span>
                <div className="hg-limit-track">
                  <div
                    className={`hg-limit-fill${overIdeal ? " warn" : ""}`}
                    style={{ width: `${limitPct}%` }}
                  />
                </div>
                <span>
                  {overIdeal
                    ? `⚠️ Vượt ideal (${platformDef.idealCount})`
                    : `✓ Trong giới hạn`}
                </span>
              </div>
            )}

            {/* Copy box */}
            <div className={`hg-copy-box${copyText ? " has-content" : ""}`}>
              {copyText || "Chọn hashtags ở trên để preview..."}
            </div>

            {/* Stats + copy btn */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <div className="hg-stats">
                {[
                  { val: selectedTags.length, lbl: "Đã chọn" },
                  { val: hashtags.length, lbl: "Tổng" },
                  { val: usedChars, lbl: "Ký tự" },
                ].map(({ val, lbl }) => (
                  <div key={lbl} className="hg-stat">
                    <span className="hg-stat-val">{val.toLocaleString()}</span>
                    <span className="hg-stat-lbl">{lbl}</span>
                  </div>
                ))}
              </div>

              <button
                className="hg-btn success"
                onClick={handleCopy}
                disabled={!copyText}
              >
                📋 Copy {selectedTags.length} tags
              </button>
            </div>
          </div>
        </div>

        {/* ── Learning Log ── */}
        <details className="hg-log">
          <summary>
            📚 Learning Log — Gemini API, prompt engineering & UX
          </summary>
          <div className="hg-log-content">
            <p>
              <strong>Gemini API — server-side route</strong>
            </p>
            <p>
              API key để trong <code>process.env.GEMINI_API_KEY</code> và chỉ
              đọc từ Next.js Route Handler (
              <code>app/api/hashtags/route.ts</code>
              ). Client không bao giờ thấy key — đây là pattern chuẩn để giữ
              secret an toàn.
            </p>
            <p>
              <strong>Prompt engineering cho JSON output</strong>
            </p>
            <p>
              Yêu cầu model{" "}
              <code>
                Return ONLY a JSON array, no explanations, no markdown
              </code>
              . Vẫn cần fallback: nếu parse JSON fail, dùng regex{" "}
              <code>/#[\w...]+/g</code> để extract hashtags từ raw text. Robust
              hơn là tin tuyệt đối vào model.
            </p>
            <p>
              <strong>Platform-aware prompting</strong>
            </p>
            <p>
              Mỗi platform có context riêng trong prompt (max tags, tone, best
              practice). Cùng topic nhưng prompt khác → output khác nhau hoàn
              toàn. Đây là cách personalize AI output không cần fine-tune.
            </p>
            <p>
              <strong>Chip selection UX</strong>
            </p>
            <p>
              Click = toggle chọn/bỏ, double-click = copy ngay tag đó.{" "}
              <code>Set&lt;string&gt;</code> cho selected state — O(1) lookup,
              clean toggle logic. Copy box tự động cập nhật theo selection.
            </p>
          </div>
        </details>
      </div>

      {/* Toast */}
      <div className={`hg-toast${showToast ? " show" : ""}`}>{toastMsg}</div>
    </div>
  );
}
