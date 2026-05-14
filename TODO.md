# ✅ TODO.md — ToolVerse Roadmap & Task Tracker

> Cập nhật liên tục. Format: `- [x]` = done, `- [ ]` = pending, `- [~]` = in progress

---

## 🗓 PHASE 0 — Setup & Foundation
> Mục tiêu: Codebase sạch, có thể ship tool đầu tiên

### Project Setup
- [x] Tạo folder structure `10-toolverse/`
- [x] Viết `README.md`
- [x] Viết `AI_RULES.md`
- [x] Viết `TODO.md`
- [ ] Init Git repo: `git init`
- [ ] Tạo `.gitignore`
- [ ] Tạo `.editorconfig` (chuẩn hóa indent, encoding)
- [ ] Setup VS Code workspace settings

### Shared Foundation (dùng chung mọi tool)
- [ ] Viết `src/shared/styles/reset.css` — CSS reset chuẩn
- [ ] Viết `src/shared/styles/design-tokens.css` — colors, fonts, spacing variables
- [ ] Viết `src/shared/components/header.html` — snippet header
- [ ] Viết `src/shared/components/footer.html` — snippet footer
- [ ] Viết `src/shared/utils/helpers.js` — utils: copyToClipboard, debounce, formatNumber...
- [ ] Viết `src/shared/utils/theme.js` — dark/light mode toggle

### Homepage
- [ ] Design layout trang chủ (wireframe trên giấy trước)
- [ ] Build `public/index.html` — trang chủ danh sách tools
- [ ] Search bar filter tools
- [ ] Category tabs (Text, Image, Dev, Creator)
- [ ] Tool cards với icon, mô tả ngắn, link
- [ ] Responsive mobile-first
- [ ] Dark mode toggle

---

## 🛠 PHASE 1 — 5 Tools Đầu Tiên (Vanilla JS)
> Mục tiêu: Ship thật, học thật, có content để đăng

---

### Tool 01 — Password Generator
**Học:** DOM manipulation, Crypto API, Clipboard API  
**SEO keyword:** "password generator online", "random password generator"

- [ ] Wireframe UI (giấy/Figma free)
- [ ] Build `src/tools/password-generator/index.html`
- [ ] Build `src/tools/password-generator/style.css`
- [ ] Build `src/tools/password-generator/script.js`
  - [ ] Hàm `generatePassword(length, options)`
  - [ ] Options: uppercase, lowercase, numbers, symbols
  - [ ] Slider chọn length (8-128)
  - [ ] Nút Generate
  - [ ] Nút Copy (với feedback animation)
  - [ ] Strength indicator (weak/medium/strong)
  - [ ] Password history (last 5)
- [ ] SEO meta tags
- [ ] Test responsive
- [ ] Test edge cases (length=0, không chọn option nào)
- [ ] Viết learning log

---

### Tool 02 — QR Code Generator
**Học:** Thư viện bên thứ 3, Canvas API, file download  
**SEO keyword:** "qr code generator", "tạo mã qr"  
**Library:** `qrcode.js` (CDN, ~45KB)

- [ ] Wireframe UI
- [ ] Build `src/tools/qr-generator/index.html`
- [ ] Build `src/tools/qr-generator/style.css`
- [ ] Build `src/tools/qr-generator/script.js`
  - [ ] Input text/URL
  - [ ] Real-time preview QR
  - [ ] Chọn size QR
  - [ ] Chọn màu foreground/background
  - [ ] Download PNG
  - [ ] Download SVG (bonus)
  - [ ] Copy to clipboard (bonus)
- [ ] SEO meta tags
- [ ] Test responsive
- [ ] Viết learning log

---

### Tool 03 — Color Palette Generator
**Học:** CSS custom properties, color theory cơ bản, clipboard  
**SEO keyword:** "color palette generator", "random color palette"

- [ ] Wireframe UI
- [ ] Build `src/tools/color-palette/index.html`
- [ ] Build `src/tools/color-palette/style.css`
- [ ] Build `src/tools/color-palette/script.js`
  - [ ] Random palette (5 màu)
  - [ ] Click để lock màu (không random lại)
  - [ ] Copy HEX code
  - [ ] Copy RGB code
  - [ ] Spacebar để generate lại
  - [ ] Export palette (CSS variables format)
  - [ ] Gradient preview mode (bonus)
- [ ] SEO meta tags
- [ ] Test responsive
- [ ] Viết learning log

---

### Tool 04 — Text Formatter
**Học:** String manipulation, textarea API, word counting  
**SEO keyword:** "text formatter online", "uppercase lowercase converter"

- [ ] Wireframe UI
- [ ] Build `src/tools/text-formatter/index.html`
- [ ] Build `src/tools/text-formatter/style.css`
- [ ] Build `src/tools/text-formatter/script.js`
  - [ ] UPPERCASE
  - [ ] lowercase
  - [ ] Title Case
  - [ ] Sentence case
  - [ ] camelCase
  - [ ] snake_case
  - [ ] kebab-case
  - [ ] Remove extra spaces
  - [ ] Remove line breaks
  - [ ] Word count / Char count / Line count
  - [ ] Copy result
  - [ ] Clear button
- [ ] SEO meta tags
- [ ] Test responsive
- [ ] Viết learning log

---

### Tool 05 — Image Compressor
**Học:** File API, Canvas API, Blob, FileReader  
**SEO keyword:** "image compressor online", "compress image free"

- [ ] Wireframe UI
- [ ] Build `src/tools/image-compressor/index.html`
- [ ] Build `src/tools/image-compressor/style.css`
- [ ] Build `src/tools/image-compressor/script.js`
  - [ ] Drag & Drop upload
  - [ ] File input fallback
  - [ ] Preview ảnh gốc + ảnh đã nén
  - [ ] Slider chọn quality (10%-100%)
  - [ ] Hiển thị: kích thước gốc vs sau nén
  - [ ] Download ảnh đã nén
  - [ ] Support JPG, PNG, WebP
  - [ ] Batch compress nhiều ảnh (bonus)
- [ ] SEO meta tags
- [ ] Test responsive
- [ ] Viết learning log

---

## 📣 PHASE 1.5 — Content & Launch
> Sau khi có 3+ tools

- [ ] Đăng tool đầu lên GitHub Pages (deploy free)
- [ ] Quay TikTok/Reel đầu tiên: "Tôi build tool này trong 1 buổi tối"
- [ ] Post vào Facebook group developer Việt
- [ ] Share lên Reddit r/webdev (tiếng Anh)
- [ ] Xin feedback từ bạn bè

---

## ⚡ PHASE 2 — 10 Tools + Backend Nhẹ

### Tools mới (Phase 2)
- [ ] JSON Viewer/Formatter (Dev Tools)
- [ ] Base64 Encoder/Decoder (Dev Tools)
- [ ] Markdown Preview (Text Tools)
- [ ] Regex Tester (Dev Tools)
- [ ] Slug Generator (SEO Tools)
- [ ] Word Counter (Text Tools)
- [ ] Timestamp Converter (Dev Tools)
- [ ] UUID Generator (Dev Tools)
- [ ] CSS Gradient Generator (Design Tools)
- [ ] Favicon Generator (Design Tools)

### Backend (PHP + MySQL)
- [ ] Setup hosting (TinoHost/Hostinger rẻ)
- [ ] Database schema (users, favorites, tool_views)
- [ ] API endpoint: log tool usage (analytics đơn giản)
- [ ] Favorites system (lưu tool yêu thích)
- [ ] Simple auth (email/password)
- [ ] Analytics dashboard cho bản thân (xem tool nào popular)

---

## 🚀 PHASE 3 — Modern Stack Rebuild

### Migration
- [ ] Học Vite cơ bản (1 tuần)
- [ ] Học React cơ bản (2-3 tuần)
- [ ] Học TailwindCSS (3-5 ngày)
- [ ] Rebuild homepage dùng React
- [ ] Convert dần từng tool sang React component
- [ ] Setup Cloudflare Pages (deploy)
- [ ] Migrate database sang Supabase

### Performance
- [ ] Lazy loading cho tool list
- [ ] Image optimization pipeline
- [ ] Lighthouse score > 90 mọi trang
- [ ] PWA (Progressive Web App) support

---

## 💰 PHASE 4 — Monetization

- [ ] Google AdSense (khi đủ traffic)
- [ ] Premium plan: no ads, bulk export, history
- [ ] API plan: cho developer dùng tools qua API
- [ ] Affiliate: recommend hosting, tools liên quan

---

## 📐 PHASE 5 — AI Features (Selective)

> Chỉ thêm AI vào tool nơi AI thực sự cần thiết

- [ ] Caption Generator (AI viết caption mạng xã hội)
- [ ] Bio Generator (AI viết bio Twitter/LinkedIn)
- [ ] Content Tone Changer (AI rewrite theo tone)
- [ ] Alt Text Generator (AI mô tả ảnh)
- [ ] Code Explainer (AI giải thích code snippet)

---

## 🐛 Backlog / Ideas

> Chưa có thứ tự ưu tiên

- [ ] Pomodoro Timer
- [ ] Unit Converter (km/miles, kg/lbs...)
- [ ] Currency Converter (cần API)
- [ ] Lorem Ipsum Generator
- [ ] CSV to JSON Converter
- [ ] HTML to Markdown
- [ ] URL Encoder/Decoder
- [ ] IP Address Lookup
- [ ] Cron Expression Builder
- [ ] JWT Decoder

---

## 📊 Metrics theo dõi

| Metric | Phase 1 Target | Phase 2 Target | Phase 3 Target |
|--------|---------------|---------------|---------------|
| Số tools | 5 | 15 | 30+ |
| GitHub stars | 10 | 50 | 200 |
| Monthly visits | 100 | 1,000 | 10,000 |
| Tools hoàn chỉnh | 5 | 15 | 30 |

---

*Cập nhật lần cuối: Tháng 5/2025*  
*Nguyên tắc: Done > Perfect. Ship rồi improve.*
