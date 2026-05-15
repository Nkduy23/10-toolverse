import { Fragment } from "react";
import Link from "next/link";

const STATS = [
  { num: "10", label: "Tools sẵn dùng" },
  { num: "100%", label: "Miễn phí" },
  { num: "0", label: "Cần đăng ký" },
  { num: "MIT", label: "Open source" },
];

const FLOATERS = ["🔑", "📱", "🎨", "📝", "🗜️", "⚙️"];

export function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      {/* Blobs + dot grid */}
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />
        <div className="hero-grid" />
      </div>

      {/* Floating icons */}
      <div className="hero-floaters" aria-hidden="true">
        {FLOATERS.map((f) => (
          <div key={f} className="floater">
            {f}
          </div>
        ))}
      </div>

      <div className="container hero-inner">
        {/* Badge */}
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          "Open source · Miễn phí mãi mãi"
        </div>

        {/* Title */}
        <h1 className="hero-title" id="hero-heading">
          Công cụ web
          <br />
          <span className="hero-title-gradient">miễn phí &amp; mạnh mẽ</span>
        </h1>

        {/* Description */}
        <p className="hero-desc">
          Bộ utility tools được xây từng ngày, bởi developer Việt. Không cần
          đăng ký. Vào dùng, xong thoát.
        </p>

        {/* CTAs */}
        <div className="hero-cta">
          <Link href="#tools" className="btn btn-primary">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="m5 12 7-7 7 7M12 5v14" />
            </svg>
            Khám phá tools
          </Link>
          <a
            href="https://github.com/Nkduy23/10-toolverse"
            className="btn btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Xem GitHub
          </a>
        </div>

        {/* Stats */}
        <div className="hero-stats" role="list" aria-label="Thống kê dự án">
          {STATS.map((s, i) => (
            <Fragment key={s.label}>
              <div className="stat-item" role="listitem">
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
              {i < STATS.length - 1 && (
                <div className="stat-divider" aria-hidden="true" />
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
