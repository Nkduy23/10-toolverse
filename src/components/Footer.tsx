import Link from "next/link";

const TOOL_LINKS = [
  { href: "/tools/password-generator", label: "Password Generator" },
  { href: "/tools/qr-generator", label: "QR Generator" },
  { href: "/tools/color-palette", label: "Color Palette" },
  { href: "/tools/text-formatter", label: "Text Formatter" },
  { href: "/tools/image-compressor", label: "Image Compressor" },
];

const PROJECT_LINKS = [
  {
    href: "https://github.com/yourusername/toolverse",
    label: "GitHub ↗",
    external: true,
  },
  { href: "/docs/architecture", label: "Architecture" },
  { href: "/docs/seo-guide", label: "SEO Guide" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      style={{
        borderTop: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "48px 24px 32px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: 48,
            marginBottom: 40,
          }}
        >
          {/* Brand */}
          <div>
            <Link
              href="/"
              aria-label="ToolVerse"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background:
                    "linear-gradient(135deg, var(--color-brand), var(--color-accent-2))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                }}
              >
                ⚡
              </div>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 17,
                }}
              >
                Tool<span style={{ color: "var(--color-brand)" }}>Verse</span>
              </span>
            </Link>
            <p
              style={{
                fontSize: 14,
                color: "var(--color-text-muted)",
                lineHeight: 1.6,
              }}
            >
              Công cụ web miễn phí, xây từng ngày,
              <br />
              một tool một bài học.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h3
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 16,
              }}
            >
              Tools
            </h3>
            <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {TOOL_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    fontSize: 14,
                    color: "var(--color-text-secondary)",
                    textDecoration: "none",
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Project */}
          <div>
            <h3
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 16,
              }}
            >
              Dự án
            </h3>
            <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PROJECT_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  {...(l.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  style={{
                    fontSize: 14,
                    color: "var(--color-text-secondary)",
                    textDecoration: "none",
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 24,
            borderTop: "1px solid var(--color-border)",
            fontSize: 13,
            color: "var(--color-text-muted)",
          }}
        >
          <p>© {year} ToolVerse — MIT License</p>
          <p>Made with ☕ by a Vietnamese dev</p>
        </div>
      </div>
    </footer>
  );
}
