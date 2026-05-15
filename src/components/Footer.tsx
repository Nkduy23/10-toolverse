import Link from "next/link";
import Image from "next/image";

const TOOL_LINKS = [
  { href: "/tools/password-generator", label: "Password Generator" },
  { href: "/tools/qr-generator", label: "QR Generator" },
  { href: "/tools/color-palette", label: "Color Palette" },
  { href: "/tools/text-formatter", label: "Text Formatter" },
  { href: "/tools/image-compressor", label: "Image Compressor" },
];

const PROJECT_LINKS = [
  {
    href: "https://github.com/Nkduy23/10-toolverse",
    label: "GitHub ↗",
    external: true,
  },
  // { href: "/docs/architecture", label: "Architecture" },
  // { href: "/docs/seo-guide", label: "SEO Guide" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 40px;
        }

        /* Tablet */
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
          .footer-brand {
            grid-column: 1 / -1;
          }
        }

        /* Mobile */
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .footer-brand {
            grid-column: auto;
          }
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 24px;
          border-top: 1px solid var(--color-border);
          font-size: 13px;
          color: var(--color-text-muted);
          gap: 12px;
        }

        @media (max-width: 480px) {
          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
        }

        .footer-link {
          font-size: 14px;
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .footer-link:hover {
          color: var(--color-brand);
        }

        .footer-padding {
          padding: 48px 24px 32px;
        }

        @media (max-width: 480px) {
          .footer-padding {
            padding: 36px 20px 24px;
          }
        }
      `}</style>

      <footer
        role="contentinfo"
        style={{
          borderTop: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          marginTop: "auto",
        }}
      >
        <div
          style={{ maxWidth: 1200, margin: "0 auto" }}
          className="footer-padding"
        >
          <div className="footer-grid">
            {/* Brand */}
            <div className="footer-brand">
              <Link
                href="/"
                aria-label="NKVerse - Về trang chủ"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  textDecoration: "none",
                  flexShrink: 0,
                }}
              >
                <Image
                  src="/logo-nkverse.png"
                  alt="NKVerse Logo"
                  width={150}
                  height={50}
                  priority
                  style={{
                    borderRadius: 10,
                    flexShrink: 0,
                  }}
                />
              </Link>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--color-text-muted)",
                  lineHeight: 1.6,
                  maxWidth: 280,
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
              <nav
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {TOOL_LINKS.map((l) => (
                  <Link key={l.href} href={l.href} className="footer-link">
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
              <nav
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {PROJECT_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="footer-link"
                    {...(l.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="footer-bottom">
            <p style={{ margin: 0 }}>© {year} ToolVerse — MIT License</p>
            <p style={{ margin: 0 }}>Built by Nkduy23</p>
          </div>
        </div>
      </footer>
    </>
  );
}
