"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/#tools", label: "Tất cả tools" },
  { href: "/#tools?cat=text", label: "Text" },
  { href: "/#tools?cat=design", label: "Design" },
  { href: "/#tools?cat=dev", label: "Dev" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on resize to desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <style>{`
        .header-nav-desktop {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        .header-hamburger {
          display: none;
        }
        .header-github {
          display: flex;
        }

        /* Tablet: hide some nav items */
        @media (max-width: 900px) {
          .header-nav-desktop .nav-link-text { font-size: 13px; }
          .header-nav-desktop .nav-link { padding: 6px 10px; }
        }

        /* Mobile: hide desktop nav, show hamburger */
        @media (max-width: 767px) {
          .header-nav-desktop {
            display: none;
          }
          .header-hamburger {
            display: flex;
          }
          .header-github {
            display: none;
          }
        }

        /* Mobile drawer */
        .mobile-drawer {
          position: fixed;
          inset: 0;
          z-index: 99;
          pointer-events: none;
        }
        .mobile-drawer.open {
          pointer-events: all;
        }
        .mobile-drawer-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .mobile-drawer.open .mobile-drawer-backdrop {
          opacity: 1;
        }
        .mobile-drawer-panel {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: min(320px, 85vw);
          background: var(--color-surface);
          border-left: 1px solid var(--color-border);
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          padding: 0;
          box-shadow: -8px 0 32px rgba(0,0,0,0.12);
        }
        .mobile-drawer.open .mobile-drawer-panel {
          transform: translateX(0);
        }
        .mobile-drawer-header {
          height: var(--header-height, 60px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          border-bottom: 1px solid var(--color-border);
          flex-shrink: 0;
        }
        .mobile-drawer-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 16px 12px;
          gap: 4px;
          overflow-y: auto;
        }
        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: var(--radius-md, 10px);
          font-size: 15px;
          font-weight: 500;
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .mobile-nav-link:hover {
          background: var(--color-border);
          color: var(--color-text-primary, var(--color-text));
        }
        .mobile-drawer-footer {
          padding: 16px 20px;
          border-top: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .hamburger-btn {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md, 8px);
          border: 1px solid var(--color-border);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--color-text-secondary);
          transition: all 0.15s ease;
          flex-shrink: 0;
        }
        .hamburger-btn:hover {
          background: var(--color-border);
        }

        /* Hamburger lines animation */
        .hamburger-lines {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 16px;
        }
        .hline {
          height: 1.5px;
          background: currentColor;
          border-radius: 2px;
          transition: all 0.25s ease;
          transform-origin: center;
        }
        .hamburger-btn[aria-expanded="true"] .hline:nth-child(1) {
          transform: translateY(5.5px) rotate(45deg);
        }
        .hamburger-btn[aria-expanded="true"] .hline:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }
        .hamburger-btn[aria-expanded="true"] .hline:nth-child(3) {
          transform: translateY(-5.5px) rotate(-45deg);
        }

        /* Nav link hover */
        .nav-link {
          padding: 6px 14px;
          border-radius: var(--radius-full, 999px);
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .nav-link:hover {
          color: var(--color-text-primary, var(--color-text));
          background: var(--color-border);
        }

        /* GitHub button hover */
        .github-btn {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md, 8px);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
          transition: all 0.15s ease;
          flex-shrink: 0;
        }
        .github-btn:hover {
          background: var(--color-border);
          color: var(--color-text-primary, var(--color-text));
        }
      `}</style>

      <header
        className="site-header"
        role="banner"
        id="site-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          height: "var(--header-height, 60px)",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          className="container header-inner"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Logo */}
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
              width={0}
              height={0}
              sizes="150px"
              priority
              style={{
                width: "150px",
                height: "auto",
                borderRadius: 10,
                flexShrink: 0,
              }}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="header-nav-desktop" aria-label="Navigation chính">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link">
                <span className="nav-link-text">{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <ThemeToggle />

            {/* GitHub — hidden on mobile */}
            <a
              href="https://github.com/Nkduy23/10-toolverse"
              aria-label="GitHub"
              target="_blank"
              rel="noopener noreferrer"
              className="github-btn header-github"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>

            {/* Hamburger — shown on mobile */}
            <button
              className="hamburger-btn header-hamburger"
              aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-drawer"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <div className="hamburger-lines" aria-hidden="true">
                <span className="hline" />
                <span className="hline" />
                <span className="hline" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        id="mobile-drawer"
        className={`mobile-drawer${menuOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu điều hướng"
        style={{ top: 0 }}
      >
        {/* Backdrop */}
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Panel */}
        <div className="mobile-drawer-panel">
          {/* Drawer header */}
          <div className="mobile-drawer-header">
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 18,
                letterSpacing: "-0.02em",
              }}
            >
              Tool<span style={{ color: "var(--color-brand)" }}>Verse</span>
            </span>
            <button
              className="hamburger-btn"
              aria-label="Đóng menu"
              onClick={() => setMenuOpen(false)}
              style={{ border: "none" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M2 2l12 12M14 2L2 14" />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <nav className="mobile-drawer-nav" aria-label="Navigation mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="mobile-nav-link"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Footer actions */}
          <div className="mobile-drawer-footer">
            <a
              href="https://github.com/Nkduy23/10-toolverse"
              aria-label="GitHub"
              target="_blank"
              rel="noopener noreferrer"
              className="github-btn"
              style={{
                width: "auto",
                gap: 8,
                padding: "0 14px",
                borderRadius: "var(--radius-full, 999px)",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span style={{ fontSize: 14, fontWeight: 500 }}>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
