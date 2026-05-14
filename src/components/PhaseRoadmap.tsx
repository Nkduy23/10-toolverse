const PHASES = [
  {
    num: "✓",
    name: "Phase 0 — Setup & Foundation",
    detail: "Shared styles, components, homepage",
    status: "done" as const,
    badge: "Done",
  },
  {
    num: "1",
    name: "Phase 1 — 5 Tools Đầu Tiên",
    detail: "Vanilla JS, Web APIs, ship thật",
    status: "active" as const,
    badge: "Đang build",
  },
  {
    num: "2",
    name: "Phase 2 — 10 Tools + Backend",
    detail: "PHP + MySQL, auth, analytics",
    status: "upcoming" as const,
    badge: "Sắp tới",
  },
  {
    num: "3",
    name: "Phase 3 — Modern Stack",
    detail: "Vite, React 18, TailwindCSS, Cloudflare",
    status: "upcoming" as const,
    badge: "Sắp tới",
  },
  {
    num: "4",
    name: "Phase 4 — AI Features",
    detail: "Caption AI, bio writer, code explainer",
    status: "upcoming" as const,
    badge: "Sắp tới",
  },
];

const BADGE_STYLE: Record<string, { bg: string; color: string }> = {
  done: { bg: "rgba(34,197,94,0.1)", color: "#22c55e" },
  active: { bg: "rgba(14,165,233,0.1)", color: "var(--color-brand)" },
  upcoming: { bg: "var(--color-surface-2)", color: "var(--color-text-muted)" },
};

export function PhaseRoadmap() {
  return (
    <section
      aria-labelledby="phase-heading"
      style={{
        background: "var(--color-surface-2)",
        padding: "80px 24px",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1.6fr",
          gap: 64,
          alignItems: "start",
        }}
      >
        {/* Left */}
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--color-brand)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 16,
            }}
          >
            Lộ trình
          </div>
          <h2
            id="phase-heading"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              marginBottom: 16,
            }}
          >
            Build từng bước,
            <br />
            học từng ngày
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
            }}
          >
            Dự án được chia thành 5 phase rõ ràng — từ Vanilla JS thuần đến full
            stack với React, backend, và AI features.
          </p>
        </div>

        {/* Right — phase list */}
        <div
          role="list"
          style={{ display: "flex", flexDirection: "column", gap: 4 }}
        >
          {PHASES.map((phase) => {
            const isDone = phase.status === "done";
            const isActive = phase.status === "active";
            const badge = BADGE_STYLE[phase.status];

            return (
              <div
                key={phase.num}
                role="listitem"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 20px",
                  borderRadius: "var(--radius-md)",
                  background: isActive ? "var(--color-surface)" : "transparent",
                  border: isActive
                    ? "1px solid var(--color-border)"
                    : "1px solid transparent",
                  boxShadow: isActive ? "var(--shadow-sm)" : "none",
                  opacity: phase.status === "upcoming" ? 0.7 : 1,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--radius-md)",
                    background: isDone
                      ? "rgba(34,197,94,0.1)"
                      : isActive
                        ? "linear-gradient(135deg, var(--color-brand), var(--color-accent-2))"
                        : "var(--color-surface-3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    color: isDone
                      ? "#22c55e"
                      : isActive
                        ? "#fff"
                        : "var(--color-text-muted)",
                    flexShrink: 0,
                  }}
                >
                  {phase.num}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 15,
                      color: "var(--color-text)",
                    }}
                  >
                    {phase.name}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-muted)",
                      marginTop: 2,
                    }}
                  >
                    {phase.detail}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    padding: "4px 10px",
                    borderRadius: "var(--radius-full)",
                    background: badge.bg,
                    color: badge.color,
                    flexShrink: 0,
                  }}
                >
                  {phase.badge}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
