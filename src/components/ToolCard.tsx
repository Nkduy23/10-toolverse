"use client";

import Link from "next/link";
import { Tool } from "@/lib/tools-data";
import { showToast } from "@/lib/utils";

interface ToolCardProps {
  tool: Tool;
  index?: number;
}

const STATUS_STYLES: Record<string, string> = {
  building: "bg-orange-500/10 text-orange-400",
  planned: "bg-slate-500/10 text-[var(--color-text-muted)]",
  done: "bg-green-500/10 text-green-400",
};

export function ToolCard({ tool, index = 0 }: ToolCardProps) {
  const isPlanned = tool.status === "planned";

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
      className="tool-card flex flex-col gap-4 p-5 pb-[18px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] no-underline cursor-pointer transition-all duration-[var(--transition-base)]"
      style={{
        animationDelay: `${index * 0.05}s`,
        opacity: isPlanned ? 0.8 : 1,
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div
          className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center text-xl shrink-0"
          style={{ background: tool.iconBg }}
        >
          {tool.icon}
        </div>

        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            STATUS_STYLES[tool.status] ?? STATUS_STYLES.planned
          }`}
        >
          {tool.statusLabel}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1">
        <div className="font-bold text-base mb-1.5 text-[var(--color-text)]">
          {tool.name}
        </div>

        <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {tool.desc}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {tool.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="text-[var(--color-brand)] shrink-0">
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
