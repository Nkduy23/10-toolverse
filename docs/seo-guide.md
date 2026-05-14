# 📈 SEO Guide — ToolVerse

## Tại sao SEO quan trọng với ToolVerse?

Utility tools có traffic tự nhiên từ Google rất cao vì:
- Người dùng search với **intent rõ ràng** ("password generator online")
- **Low competition** với domain authority cao nhưng bạn có thể win keyword đuôi dài
- Traffic ổn định, không phụ thuộc social media algorithm

---

## Keyword Research

### Cách tìm keyword cho mỗi tool

1. **Google Suggest**: Gõ "password generator" → xem gợi ý phía dưới
2. **People Also Ask**: Xem box "Mọi người cũng hỏi" trên Google
3. **Ubersuggest** (free tier): Volume + difficulty
4. **Ahrefs Free**: Keyword difficulty checker

### Keyword target cho 5 tools đầu

| Tool | Primary Keyword | Secondary Keywords |
|------|----------------|-------------------|
| Password Generator | "password generator" | "random password", "strong password generator", "tạo mật khẩu" |
| QR Generator | "qr code generator" | "tạo mã qr", "free qr generator", "qr code maker" |
| Color Palette | "color palette generator" | "random color palette", "color scheme generator" |
| Text Formatter | "text formatter online" | "uppercase converter", "text case converter" |
| Image Compressor | "image compressor" | "compress image online", "reduce image size" |

---

## On-Page SEO Checklist

### Title Tag
```
Format: [Keyword] Online Free — ToolVerse
Length: 50-60 ký tự

✅ "Password Generator Online Free — ToolVerse"
✅ "QR Code Generator — ToolVerse"
❌ "Tool - ToolVerse" (quá ngắn, không có keyword)
❌ "Free Online Password Generator Tool No Signup Required — ToolVerse" (quá dài)
```

### Meta Description
```
Length: 150-160 ký tự
Chứa: primary keyword, call-to-action, unique value

✅ "Generate strong, secure passwords instantly. Choose length, uppercase, symbols. Free online tool, no signup required."
```

### Heading Structure
```html
<h1>Password Generator</h1>           <!-- 1 cái duy nhất, chứa keyword -->
  <h2>How to Use</h2>
  <h2>Frequently Asked Questions</h2>
    <h3>Is this password generator secure?</h3>
    <h3>Can I use this offline?</h3>
```

### URL Structure
```
✅ toolverse.com/tools/password-generator/
✅ toolverse.com/tools/qr-code-generator/
❌ toolverse.com/tools/tool1/
❌ toolverse.com/tools/passwordGenerator/
```

---

## Schema.org Markup

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Password Generator",
  "url": "https://toolverse.com/tools/password-generator/",
  "description": "Generate strong, secure passwords instantly. Free online tool.",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "Custom password length",
    "Uppercase letters",
    "Special characters",
    "Copy to clipboard"
  ]
}
</script>
```

---

## Content Strategy (Tăng SEO)

### FAQ Section (mỗi tool nên có)

FAQ giúp rank "People Also Ask" trên Google.

```html
<section class="faq">
  <h2>Frequently Asked Questions</h2>
  
  <details>
    <summary>Is this password generator secure?</summary>
    <p>Yes. We use the Web Crypto API (crypto.getRandomValues()) 
    which is cryptographically secure and runs entirely in your browser. 
    No passwords are sent to our servers.</p>
  </details>
  
  <details>
    <summary>Can I use this tool offline?</summary>
    <p>The tool works entirely in your browser. Once the page loads, 
    you can use it without internet connection.</p>
  </details>
</section>
```

### Internal Linking
- Mỗi tool page link về homepage
- Homepage link đến tất cả tools
- Tool A link sang Tool B liên quan (password gen → qr gen)

---

## Technical SEO

### Page Speed
- Mục tiêu: Load < 2 giây trên 3G
- Minify CSS/JS (Phase 3 với Vite)
- Lazy load images dưới fold
- Preload critical CSS

### Robots.txt
```
User-agent: *
Allow: /
Sitemap: https://toolverse.com/sitemap.xml
```

### Sitemap.xml (tự generate hoặc viết tay ban đầu)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://toolverse.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://toolverse.com/tools/password-generator/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## Tracking

Khi deploy, setup Google Search Console ngay:
1. Vào search.google.com/search-console
2. Add property → URL prefix → verify bằng HTML file
3. Submit sitemap
4. Theo dõi: Impressions, Clicks, Average Position

Sau 3 tháng sẽ thấy keyword nào đang rank.
