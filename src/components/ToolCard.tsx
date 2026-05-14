"use client";

import Link from "next/link";
import { Tool } from "@/lib/tools-data";
import { showToast } from "@/lib/utils";

interface ToolCardProps {
  tool: Tool;
  index?: number;
}

const STATUS_CLASS: Record<string, string> = {
  building: "status-building",
  planned: "status-planned",
  done: "status-done",
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  building: { bg: "rgba(249,115,22,0.1)", color: "#f97316" },
  planned: { bg: "rgba(100,116,139,0.1)", color: "var(--color-text-muted)" },
  done: { bg: "rgba(34,197,94,0.1)", color: "#22c55e" },
};

export function ToolCard({ tool, index = 0 }: ToolCardProps) {
  const isPlanned = tool.status === "planned";
  const statusStyle = STATUS_COLORS[tool.status] || STATUS_COLORS.planned;

  function handleClick(e: React.MouseEvent) {
    if (isPlanned) {
      e.preventDefault();
      showToast(`${tool.name} đang trong kế hoạch — sắp ra mắt! 🚀`, "info");
    }
  }

  return (
    <Link
      href={tool.href}
      onClick={handleClick}
      role="listitem"
      aria-label={`${tool.name} — ${tool.desc}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "20px 20px 18px",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        textDecoration: "none",
        transition: "all var(--transition-base)",
        cursor: "pointer",
        animationDelay: `${index * 0.05}s`,
        opacity: isPlanned ? 0.8 : 1,
      }}
      className="tool-card"
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "var(--radius-md)",
            background: tool.iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {tool.icon}
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            padding: "4px 10px",
            borderRadius: "var(--radius-full)",
            background: statusStyle.bg,
            color: statusStyle.color,
          }}
        >
          {tool.statusLabel}
        </span>
      </div>

      {/* Body */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 6,
            color: "var(--color-text)",
          }}
        >
          {tool.name}
        </div>
        <div
          style={{
            fontSize: 14,
            color: "var(--color-text-secondary)",
            lineHeight: 1.5,
          }}
        >
          {tool.desc}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {tool.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 11,
                padding: "3px 8px",
                borderRadius: "var(--radius-full)",
                background: "var(--color-surface-2)",
                color: "var(--color-text-muted)",
                fontWeight: 500,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <div style={{ color: "var(--color-brand)", flexShrink: 0 }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
