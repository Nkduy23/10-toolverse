"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { TOOLS, CATEGORIES, ToolCategory } from "@/lib/tools-data";
import { ToolCard } from "./ToolCard";
import { debounce } from "@/lib/utils";

export function ToolsGrid() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");

  // Debounce search
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((val: string) => setSearchQuery(val), 200),
    [],
  );

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
    debouncedSearch(e.target.value);
  }

  // ⌘K shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("searchInput")?.focus();
      }
      if (e.key === "Escape") {
        (document.getElementById("searchInput") as HTMLInputElement)?.blur();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = useMemo(() => {
    return TOOLS.filter((t) => {
      const matchCat =
        activeCategory === "all" || t.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        [t.name, t.desc, ...t.tags, ...t.keywords].some((s) =>
          s.toLowerCase().includes(q),
        );
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: TOOLS.length };
    TOOLS.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + 1;
    });
    return map;
  }, []);

  return (
    <section
      id="tools"
      aria-labelledby="tools-heading"
      style={{ padding: "0 0 80px" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Search */}
        <div
          style={{
            margin: "0 0 40px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            role="search"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 560,
            }}
          >
            <svg
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-muted)",
                pointerEvents: "none",
              }}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              id="searchInput"
              type="search"
              value={inputValue}
              onChange={handleSearchChange}
              placeholder="Tìm tool... (ví dụ: password, qr, color)"
              aria-label="Tìm kiếm tool"
              autoComplete="off"
              style={{
                width: "100%",
                padding: "14px 48px 14px 48px",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                fontSize: 15,
                color: "var(--color-text)",
                outline: "none",
                transition:
                  "border-color var(--transition-fast), box-shadow var(--transition-fast)",
              }}
            />
            <kbd
              aria-hidden="true"
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 11,
                padding: "2px 6px",
                borderRadius: 4,
                background: "var(--color-surface-2)",
                color: "var(--color-text-muted)",
                border: "1px solid var(--color-border)",
              }}
            >
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ marginBottom: 32 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 12,
            }}
          >
            Danh mục
          </p>
          <div
            role="tablist"
            aria-label="Danh mục tools"
            style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() =>
                    setActiveCategory(cat.id as ToolCategory | "all")
                  }
                  style={{
                    padding: "8px 16px",
                    borderRadius: "var(--radius-full)",
                    fontSize: 14,
                    fontWeight: 500,
                    border: `1px solid ${isActive ? "var(--color-brand)" : "var(--color-border)"}`,
                    background: isActive
                      ? "var(--color-brand)"
                      : "var(--color-surface)",
                    color: isActive ? "#fff" : "var(--color-text-secondary)",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {cat.label}
                  <span
                    style={{
                      fontSize: 12,
                      padding: "1px 6px",
                      borderRadius: "var(--radius-full)",
                      background: isActive
                        ? "rgba(255,255,255,0.25)"
                        : "var(--color-surface-2)",
                      color: isActive ? "#fff" : "var(--color-text-muted)",
                    }}
                  >
                    {counts[cat.id] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 24 }}>
          <h2
            id="tools-heading"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            Tất cả Tools{" "}
            <span
              style={{
                fontWeight: 400,
                color: "var(--color-text-muted)",
                fontSize: 18,
              }}
            >
              — {filtered.length} tool{filtered.length !== 1 ? "s" : ""}
            </span>
          </h2>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div
            role="list"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {filtered.map((tool, i) => (
              <ToolCard key={tool.id} tool={tool} index={i} />
            ))}
          </div>
        ) : (
          <div
            aria-live="polite"
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: "var(--color-text-muted)",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 8,
                color: "var(--color-text)",
              }}
            >
              Không tìm thấy tool nào
            </div>
            <div style={{ fontSize: 14 }}>
              Thử từ khóa khác, hoặc xem tất cả tools.
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
