/**
 * utils.ts — ToolVerse shared utilities
 * Tái sử dụng cho mọi tool page
 */

// ─── CLIPBOARD ───────────────────────────────────────────

export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("Clipboard API failed, trying fallback:", err);
    }
  }
  // Fallback for iOS Safari / old browsers
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;opacity:0;";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.error("Copy failed:", err);
    return false;
  }
}

// ─── PERFORMANCE ─────────────────────────────────────────

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay = 300,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  limit = 100,
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return function (...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
}

// ─── FORMATTING ──────────────────────────────────────────

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("vi-VN").format(num);
}

export function formatFileSize(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function truncate(text: string, maxLength = 50): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// ─── VALIDATION ──────────────────────────────────────────

export function isEmpty(str: string): boolean {
  return !str || str.trim().length === 0;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ─── TOAST ───────────────────────────────────────────────
// Used via the <Toast> component or this imperative helper for non-React contexts

export type ToastType = "success" | "error" | "info" | "warning";

export function showToast(
  message: string,
  type: ToastType = "success",
  duration = 3000,
): void {
  if (typeof window === "undefined") return;

  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const icons: Record<ToastType, string> = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };
  const colors: Record<
    ToastType,
    { bg: string; color: string; border: string }
  > = {
    success: { bg: "#dcfce7", color: "#166534", border: "#86efac" },
    info: { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" },
    warning: { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" },
    error: { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
  };

  const c = colors[type];
  const toast = document.createElement("div");
  toast.setAttribute("role", "status");
  Object.assign(toast.style, {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
    pointerEvents: "auto",
    maxWidth: "320px",
    background: c.bg,
    color: c.color,
    border: `1px solid ${c.border}`,
    boxShadow: "0 10px 20px rgba(0,0,0,.1)",
    transform: "translateX(100px)",
    opacity: "0",
    transition: "all 220ms cubic-bezier(.34,1.56,.64,1)",
  });
  toast.innerHTML = `<span style="font-size:16px">${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.transform = "translateX(0)";
      toast.style.opacity = "1";
    });
  });
  setTimeout(() => {
    toast.style.transform = "translateX(100px)";
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 220);
  }, duration);
}
