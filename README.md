# 🌌 ToolVerse — Kho công cụ miễn phí, xây bởi developer Việt

> **"Mỗi tool nhỏ — một bài học lớn."**  
> Một website tập hợp các utility web hữu ích, được xây từng bước từ zero đến production.

---

## 📖 Giới thiệu

**ToolVerse** là dự án cá nhân của một sinh viên mới ra trường, xây dựng công khai (build in public) một bộ công cụ web miễn phí: chuyển đổi, tạo nội dung, xử lý ảnh, hỗ trợ dev...

Không phụ thuộc AI API. Không cần đăng ký. Vào dùng, xong thoát.

---

## 🎯 Mục tiêu dự án

| Mục tiêu          | Chi tiết                                                         |
| ----------------- | ---------------------------------------------------------------- |
| 🛠 Học thực chiến | Mỗi tool = một concept mới (DOM, Canvas, Clipboard, File API...) |
| 📈 SEO traffic    | Mỗi tool có landing page riêng, target keyword thực              |
| 📱 Content        | Devlog TikTok/Facebook: "Tôi build tool này trong 1 buổi tối"    |
| 💼 CV mạnh        | Project thật, user thật, code thật                               |
| 💰 Monetize sau   | Ads → Premium → API khi có traffic                               |

---

## 🗂 Cấu trúc thư mục

```
10-toolverse/
├── README.md               ← File này
├── AI_RULES.md             ← Quy tắc khi dùng AI hỗ trợ code
├── TODO.md                 ← Danh sách task theo phase
├── docs/                   ← Tài liệu kỹ thuật, ADR, notes
│   ├── architecture.md
│   ├── seo-guide.md
│   └── tool-checklist.md
├── src/
│   ├── shared/             ← Code dùng chung giữa các tools
│   │   ├── components/     ← Header, Footer, Card, Modal...
│   │   ├── utils/          ← helpers.js, clipboard.js, theme.js
│   │   └── styles/         ← design-tokens.css, reset.css
│   ├── assets/
│   │   ├── css/            ← Global CSS
│   │   ├── js/             ← Global JS
│   │   ├── fonts/
│   │   └── icons/
│   └── tools/              ← Mỗi tool = 1 folder con
│       ├── password-generator/
│       │   ├── index.html
│       │   ├── style.css
│       │   └── script.js
│       ├── qr-generator/
│       ├── color-palette/
│       ├── text-formatter/
│       └── image-compressor/
└── public/                 ← Build output (sau này dùng bundler)
    └── index.html          ← Trang chủ ToolVerse
```

---

## ⚙️ Tech Stack theo Phase

### Phase 1 — Vanilla Web (Đang ở đây ✅)

> Học xong nền tảng, ship được tool thật

- **HTML5** — semantic, accessible
- **CSS3** — Custom Properties (variables), Flexbox, Grid, responsive
- **Vanilla JS (ES6+)** — modules, async/await, Web APIs
- **Thư viện CDN nhỏ** (không cần build tool):
  - `qrcode.js` — QR Generator
  - `highlight.js` — JSON/Code Viewer
  - `canvas-confetti` — micro delight UX

### Phase 2 — Backend nhẹ

> Khi cần lưu data, auth, analytics

- **PHP 8** + **MySQL** — đơn giản, hosting rẻ
- **SQLite** — dùng cho analytics đơn giản không cần server lớn
- Tính năng: Favorites, history, account

### Phase 3 — Modern Stack

> Khi traffic tăng, cần scale

- **Vite** — bundler nhanh, thay thế webpack
- **React 18** — component-based, tái sử dụng tốt
- **TailwindCSS** — utility-first, nhanh style
- **Cloudflare Pages** — deploy free, CDN toàn cầu
- **Supabase** — Postgres-as-a-service, free tier ngon

### Phase 4 — AI Features (Tùy chọn)

> Khi muốn differentiate với các tool khác

- **Claude API / Gemini API** — chỉ cho một số tool cụ thể
- Caption generator, bio writer, tone changer
- **Không phụ thuộc AI hoàn toàn** — vẫn giữ core tools chạy độc lập

---

## 🚀 Chạy local

```bash
# Không cần build tool ở Phase 1
# Chỉ cần mở file hoặc dùng live server

# Cách 1: VS Code Live Server extension (khuyến nghị)
# Click chuột phải index.html → Open with Live Server

# Cách 2: Python
python -m http.server 8000

# Cách 3: Node.js
npx serve .
```

---

## 📦 Danh sách Tools

Xem chi tiết tại [TODO.md](./TODO.md)

| Tool               | Status      | Category |
| ------------------ | ----------- | -------- |
| Password Generator | 🔨 Building | Security |
| QR Generator       | 📋 Planned  | Utility  |
| Color Palette      | 📋 Planned  | Design   |
| Text Formatter     | 📋 Planned  | Text     |
| Image Compressor   | 📋 Planned  | Image    |
| JSON Viewer        | 📋 Planned  | Dev      |
| Base64 Converter   | 📋 Planned  | Dev      |
| Markdown Preview   | 📋 Planned  | Text     |
| Regex Tester       | 📋 Planned  | Dev      |
| Hashtag Generator  | 📋 Planned  | Creator  |

---

## 📊 SEO Strategy

Mỗi tool page cần có:

- `<title>` riêng: `"Password Generator — ToolVerse"`
- `<meta description>` unique
- `<h1>` chứa keyword chính
- Canonical URL
- Open Graph tags (cho share social)

Xem hướng dẫn đầy đủ: [docs/seo-guide.md](./docs/seo-guide.md)

---

## 📝 Build in Public

- 🎥 TikTok: Devlog ngắn mỗi tool
- 📘 Facebook: Before/After, process
- 💬 Reddit/groups: Share tool khi xong

---

## 📄 License

MIT — Miễn phí dùng, học, fork.

---

_Made with ☕ by a Vietnamese dev, one tool at a time._
