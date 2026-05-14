# 🤖 AI_RULES.md — Quy tắc dùng AI trong dự án ToolVerse

> Mục tiêu: Dùng AI để **học nhanh hơn**, không phải để **skip việc học**.

---

## 🧠 Triết lý cốt lõi

```
AI = Mentor thông minh, không phải người làm thay
```

Bạn là sinh viên mới ra trường. AI giúp bạn:
- Giải thích concept khó
- Review code của bạn
- Suggest hướng giải quyết

AI **KHÔNG** làm thay bạn:
- Paste AI code vào mà không đọc hiểu
- Dùng AI để skip debug
- Copy nguyên solution mà không hiểu tại sao

---

## ✅ ĐƯỢC PHÉP dùng AI cho

### 1. Học concept mới
```
✅ "Giải thích Clipboard API hoạt động như nào?"
✅ "Canvas API khác gì với DOM manipulation?"
✅ "Tại sao cần dùng async/await ở đây?"
```

### 2. Review code bạn tự viết
```
✅ "Review đoạn code này của mình, có vấn đề gì không?"
✅ "Code này có thể refactor gọn hơn không?"
✅ "Mình handle edge case này đúng chưa?"
```

### 3. Debug khi bị stuck > 20 phút
```
✅ "Mình đã thử X, Y, Z nhưng vẫn lỗi này, hint gì không?"
✅ "Error message này nghĩa là gì?"
```

### 4. Boilerplate lặp lại nhàm
```
✅ HTML structure cơ bản của 1 trang tool mới
✅ Meta tags SEO template
✅ Reset CSS chuẩn
```

### 5. Research & So sánh
```
✅ "Thư viện QR nào nhẹ nhất cho CDN?"
✅ "Vite vs Parcel vs Webpack — cái nào phù hợp Phase 2?"
```

---

## ❌ KHÔNG được dùng AI cho

### 1. Core logic của tool
```
❌ "Viết hàm generate password cho mình"
→ Tự viết, AI review sau
```

### 2. CSS / UI toàn bộ
```
❌ "Làm UI cho tool này đẹp lên"
→ Tự design, AI suggest cải thiện
```

### 3. Thay thế debug
```
❌ Lỗi 5 phút → hỏi AI ngay
→ Phải tự debug ít nhất 20 phút trước
```

### 4. Paste code AI mà không đọc
```
❌ Copy code AI → paste → chạy được → xong
→ Phải đọc từng dòng, comment để hiểu
```

---

## 📋 Checklist trước khi commit code có AI hỗ trợ

- [ ] Mình đã đọc và hiểu từng dòng code này
- [ ] Mình có thể giải thích logic này cho người khác
- [ ] Mình biết tại sao cần dùng cách này (không phải cách khác)
- [ ] Mình đã test edge cases thủ công
- [ ] Comment giải thích đã được viết bởi mình (không phải AI)

---

## 🏷 Convention khi commit code có AI

Nếu AI giúp một phần đáng kể, ghi vào commit message:

```bash
# Format
git commit -m "feat: add password copy button [ai-reviewed]"
git commit -m "fix: handle empty input edge case [ai-hint]"
git commit -m "refactor: simplify color logic [ai-suggest]"
```

**Tags:**
- `[ai-reviewed]` — Code bạn tự viết, AI review
- `[ai-hint]` — AI gợi ý hướng, bạn tự implement
- `[ai-suggest]` — AI suggest refactor/pattern

---

## 📚 Workflow học đúng cách

```
1. Đọc yêu cầu tool
2. Tự nghĩ approach (5-10 phút)
3. Bắt đầu code, không nhìn solution
4. Bị stuck > 20 phút → hỏi AI "hint" (không phải solution)
5. Implement theo hint
6. Xong → nhờ AI review
7. Refactor theo feedback
8. Commit + document lại những gì học được
```

---

## 📝 Learning Log

Sau mỗi tool, ghi vào `docs/learnings/tool-name.md`:

```markdown
## Tool: Password Generator
**Ngày:** 2025-xx-xx
**Thời gian build:** ~2 tiếng

### Concept mới học được
- Clipboard API: navigator.clipboard.writeText()
- Crypto API: crypto.getRandomValues() an toàn hơn Math.random()

### Khó khăn gặp phải
- Vấn đề: iOS không support clipboard API
- Giải pháp: Fallback dùng document.execCommand('copy')

### AI đã giúp gì
- Explain tại sao crypto.getRandomValues() > Math.random() cho security
- Review edge case khi length = 0

### Sẽ làm khác gì lần sau
- Viết unit test từ đầu
```

---

*Quy tắc này tồn tại vì: Tool chạy được không quan trọng bằng việc BẠN hiểu tại sao nó chạy được.*
