"use client";

const STEPS = [
  {
    num: "01",
    icon: "🎯",
    title: "Chọn tool bạn cần",
    desc: "Dùng thanh tìm kiếm hoặc lọc theo danh mục. 10 tools đang hoạt động, từ dev đến creator.",
  },
  {
    num: "02",
    icon: "⚡",
    title: "Dùng ngay, không cần gì cả",
    desc: "Không đăng ký, không cài app. Mở browser là chạy — mọi xử lý diễn ra ngay trên máy bạn.",
  },
  {
    num: "03",
    icon: "📋",
    title: "Lấy kết quả, thoát ra",
    desc: "Copy, download, hoặc dùng trực tiếp. Dữ liệu của bạn không bao giờ rời khỏi trình duyệt.",
  },
];

const HIGHLIGHTS = [
  { icon: "🔒", text: "Xử lý 100% client-side" },
  { icon: "🌐", text: "Không cần internet sau khi load" },
  { icon: "⚙️", text: "Mã nguồn mở trên GitHub" },
  { icon: "🇻🇳", text: "Build bởi developer Việt" },
];

export function HowItWorks() {
  return (
    <section
      aria-labelledby="how-heading"
      style={{
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
        padding: "80px 0 88px",
      }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div
            style={{
              display: "inline-block",
              fontSize: 12,
              fontWeight: 700,
              color: "var(--color-brand)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 14,
            }}
          >
            Cách hoạt động
          </div>
          <h2
            id="how-heading"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: 16,
            }}
          >
            Đơn giản đến mức{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, var(--color-brand), var(--color-accent-2))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              không cần hướng dẫn
            </span>
          </h2>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "1rem",
              maxWidth: 480,
              margin: "0 auto",
              lineHeight: 1.65,
            }}
          >
            Mỗi tool được thiết kế để dùng ngay — không friction, không bloat,
            không dark pattern.
          </p>
        </div>

        {/* Steps */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 24,
            marginBottom: 64,
          }}
        >
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              style={{
                position: "relative",
                background: "var(--color-bg)",
                border: "1.5px solid var(--color-border)",
                borderRadius: "var(--radius-xl)",
                padding: "28px 28px 32px",
                transition: "all var(--transition-bounce)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--color-brand)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "var(--shadow-lg)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--color-border)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Step number watermark */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 16,
                  right: 20,
                  fontFamily: "var(--font-display)",
                  fontSize: "3.5rem",
                  fontWeight: 900,
                  color: "var(--color-border)",
                  lineHeight: 1,
                  userSelect: "none",
                }}
              >
                {step.num}
              </div>

              {/* Icon */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  background:
                    i === 0
                      ? "linear-gradient(135deg,#0ea5e9,#6366f1)"
                      : i === 1
                        ? "linear-gradient(135deg,#22c55e,#0ea5e9)"
                        : "linear-gradient(135deg,#a855f7,#ec4899)",
                  borderRadius: "var(--radius-lg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  marginBottom: 20,
                }}
              >
                {step.icon}
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  marginBottom: 10,
                  letterSpacing: "-0.01em",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.65,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Highlights strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {HIGHLIGHTS.map((h, i) => (
            <div
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-full)",
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
                fontWeight: 500,
              }}
            >
              <span>{h.icon}</span>
              {h.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
