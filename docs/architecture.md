# 🏛 Architecture — ToolVerse

## Triết lý kiến trúc

```
Đơn giản → Chạy được → Refactor → Scale
```

Không over-engineer từ đầu. Mỗi decision phải có lý do thực tế.

---

## Phase 1 — File-based Architecture (Vanilla)

### Tại sao không dùng framework ngay?

1. **Học nền tảng trước**: Hiểu DOM, CSS, JS thật sự trước khi React abstraction ẩn đi
2. **Zero config**: Không cần build tool, mở file là chạy
3. **Deploy siêu đơn giản**: Upload lên GitHub Pages là xong
4. **Tốc độ build**: Không bị vướng config, focus vào feature

### Cấu trúc mỗi Tool

```
src/tools/[tool-name]/
├── index.html      ← Standalone page, tự chứa mọi thứ
├── style.css       ← CSS riêng của tool
└── script.js       ← Logic riêng của tool
```

### Shared Code

Vấn đề: Copy-paste header/footer vào mọi tool sẽ khó maintain.

**Giải pháp Phase 1**: JS `fetch()` để load shared HTML partials:

```javascript
// src/shared/utils/loader.js
async function loadComponent(selector, path) {
  const el = document.querySelector(selector);
  if (!el) return;
  const res = await fetch(path);
  el.innerHTML = await res.text();
}

// Dùng trong mỗi tool
loadComponent('#header', '/src/shared/components/header.html');
loadComponent('#footer', '/src/shared/components/footer.html');
```

**Giải pháp Phase 3**: React components tái sử dụng → clean hơn nhiều.

---

## Naming Conventions

### Files & Folders
```
kebab-case cho tất cả
✅ password-generator/
✅ design-tokens.css
✅ helpers.js
❌ PasswordGenerator/
❌ designTokens.css
```

### CSS Classes
```
BEM (Block Element Modifier)
✅ .tool-card
✅ .tool-card__title
✅ .tool-card--featured
❌ .toolCard
❌ .tool_card
```

### JavaScript
```javascript
// Variables & functions: camelCase
const passwordLength = 16;
function generatePassword() {}

// Constants: SCREAMING_SNAKE_CASE
const MAX_PASSWORD_LENGTH = 128;
const DEFAULT_CHARSET = 'abcdefghijklmnopqrstuvwxyz';

// Classes: PascalCase (ít dùng ở Phase 1)
class ColorPalette {}
```

### Git Commits
```
Format: type(scope): message

Types:
- feat: tính năng mới
- fix: sửa bug
- style: CSS/UI (không đổi logic)
- refactor: tái cấu trúc code
- docs: cập nhật tài liệu
- chore: task lặt vặt (update deps, config)

Ví dụ:
feat(password-gen): add strength indicator
fix(qr-gen): handle special characters in URL
style(homepage): improve card hover animation
docs: update README with deployment guide
```

---

## CSS Architecture

### Design Tokens (CSS Variables)

```css
/* src/shared/styles/design-tokens.css */
:root {
  /* Colors */
  --color-primary: #6366f1;
  --color-primary-dark: #4f46e5;
  --color-surface: #ffffff;
  --color-surface-2: #f8fafc;
  --color-text: #0f172a;
  --color-text-muted: #64748b;
  --color-border: #e2e8f0;
  --color-danger: #ef4444;
  --color-success: #22c55e;

  /* Dark mode overrides (dùng class .dark trên body) */

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;

  /* Spacing (8px grid) */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */

  /* Borders */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
}
```

---

## URL Structure

```
toolverse.com/                    ← Homepage
toolverse.com/tools/              ← All tools listing
toolverse.com/tools/[tool-slug]/  ← Individual tool
toolverse.com/category/[name]/    ← Category page (Phase 2)
toolverse.com/blog/               ← Devlog (Phase 2+)
```

---

## Performance Budget (Phase 1)

| Asset | Limit |
|-------|-------|
| HTML per page | < 50KB |
| CSS per page | < 30KB |
| JS per page | < 100KB |
| External libraries | < 150KB total |
| Images | < 200KB, WebP preferred |
| Lighthouse score | > 85 |

---

## SEO Architecture

Mỗi tool page phải có:

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO cơ bản -->
  <title>Password Generator Online Free — ToolVerse</title>
  <meta name="description" content="Generate strong, secure passwords instantly. Choose length, symbols, uppercase. Free, no signup required.">
  <link rel="canonical" href="https://toolverse.com/tools/password-generator/">
  
  <!-- Open Graph (share social) -->
  <meta property="og:title" content="Password Generator — ToolVerse">
  <meta property="og:description" content="Generate strong passwords instantly. Free, no signup.">
  <meta property="og:image" content="https://toolverse.com/assets/og/password-generator.png">
  <meta property="og:url" content="https://toolverse.com/tools/password-generator/">
  
  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Password Generator",
    "description": "...",
    "url": "...",
    "applicationCategory": "UtilityApplication",
    "offers": {
      "@type": "Offer",
      "price": "0"
    }
  }
  </script>
</head>
```

---

## Deployment Strategy

### Phase 1: GitHub Pages (Free)
```
GitHub repo → Settings → Pages → Deploy from /public branch
URL: username.github.io/10-toolverse
```

### Phase 2: Custom domain + PHP hosting
```
Mua domain: toolverse.com (~$10-15/năm)
Hosting: TinoHost / Hostinger (~$3-5/tháng)
```

### Phase 3: Cloudflare Pages (Free tier ngon)
```
Connect GitHub → Auto deploy on push
CDN toàn cầu, HTTPS free, custom domain free
```
