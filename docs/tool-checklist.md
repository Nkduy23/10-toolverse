# ✅ Tool Checklist — Template cho mỗi tool mới

> Copy file này khi bắt đầu build tool mới.  
> File: `docs/tools/[tool-name]-checklist.md`

---

## Tool: [Tên Tool]

**Ngày bắt đầu:** ___  
**Ngày ship:** ___  
**Category:** Text / Image / Dev / Creator / Utility  
**SEO Keywords chính:** ___

---

## 1. Planning (Trước khi code)

- [ ] Định nghĩa rõ: Tool này làm gì? (1 câu)
- [ ] Vẽ wireframe UI trên giấy / Excalidraw
- [ ] List tất cả tính năng (core + bonus)
- [ ] Xác định Web API sẽ dùng (Clipboard, Canvas, File...)
- [ ] Research thư viện cần (nếu có): tên, CDN link, size
- [ ] Check đối thủ: Tool tương tự trên TinyWow / iLovePDF làm gì?

---

## 2. File Structure

- [ ] Tạo folder: `src/tools/[tool-name]/`
- [ ] Tạo `index.html`
- [ ] Tạo `style.css`
- [ ] Tạo `script.js`
- [ ] Import shared CSS: design-tokens + reset
- [ ] Import shared header/footer component

---

## 3. HTML

- [ ] Doctype + lang="vi" (hoặc "en" tùy tool)
- [ ] Semantic tags (main, section, article, nav...)
- [ ] Form elements có label liên kết đúng (for/id)
- [ ] Aria labels cho interactive elements
- [ ] Loading state placeholder (nếu có async)
- [ ] Error state (empty state, invalid input)

---

## 4. CSS

- [ ] Mobile-first (viết mobile trước, desktop sau)
- [ ] Dùng CSS variables từ design-tokens
- [ ] Dark mode support
- [ ] Responsive: 320px → 768px → 1024px → 1440px
- [ ] Hover states cho interactive elements
- [ ] Focus states (keyboard navigation)
- [ ] Transitions smooth (không choppy)

---

## 5. JavaScript — Core Logic

- [ ] Input validation (empty, invalid format, edge cases)
- [ ] Core function hoạt động đúng
- [ ] Error handling (try/catch cho async)
- [ ] Loading state khi xử lý chậm
- [ ] Success feedback (copy notification, download started...)

---

## 6. JavaScript — UX Details

- [ ] Copy to clipboard với feedback ("Copied!" 2 giây)
- [ ] Keyboard shortcuts (Enter để submit, Escape để clear...)
- [ ] Drag and drop (nếu là tool upload file)
- [ ] Real-time preview (nếu phù hợp)
- [ ] Local storage cho settings (nếu cần)

---

## 7. SEO

- [ ] `<title>` unique, chứa keyword
- [ ] `<meta description>` 150-160 ký tự
- [ ] `<h1>` duy nhất, chứa keyword
- [ ] `<link rel="canonical">` đúng URL
- [ ] Open Graph tags (og:title, og:description, og:image)
- [ ] Schema.org JSON-LD (WebApplication type)
- [ ] Alt text cho mọi ảnh
- [ ] Internal links về homepage và tools liên quan

---

## 8. Testing

- [ ] Test trên Chrome
- [ ] Test trên Firefox
- [ ] Test trên Safari (nếu có Mac/iOS)
- [ ] Test trên mobile (Chrome DevTools → Toggle device)
- [ ] Test với input rỗng
- [ ] Test với input rất dài
- [ ] Test với ký tự đặc biệt (emoji, tiếng Việt, HTML tags)
- [ ] Test keyboard-only navigation
- [ ] Lighthouse score > 85

---

## 9. Content

- [ ] Mô tả ngắn tool (dùng trên homepage card)
- [ ] Tiêu đề trang h1
- [ ] Hướng dẫn sử dụng ngắn (nếu cần)
- [ ] FAQ 3-5 câu hỏi thường gặp (tốt cho SEO)

---

## 10. Ship

- [ ] Commit code với message chuẩn
- [ ] Thêm tool vào trang chủ (homepage tool list)
- [ ] Test URL hoạt động trên GitHub Pages
- [ ] Update TODO.md (check done)
- [ ] Viết learning log: `docs/learnings/[tool-name].md`

---

## 11. Content (Sau khi ship)

- [ ] Quay video build process (nếu có)
- [ ] Post announcement (TikTok / Facebook / Reddit)
- [ ] Share link cho bạn bè test

---

## Learning Log (Điền sau khi xong)

**Thời gian build:** ___ giờ

**Concept mới học được:**
1. 
2. 
3. 

**Khó khăn và cách giải quyết:**
| Vấn đề | Giải pháp |
|--------|-----------|
| | |

**AI đã giúp gì:** 

**Sẽ làm khác gì lần sau:**

**Rating độ khó (1-10):** ___
