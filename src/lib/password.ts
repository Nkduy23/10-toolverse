/**
 * lib/password.ts
 * Pure logic cho Password Generator — không phụ thuộc DOM
 * Học: Crypto API, Fisher-Yates shuffle
 */

export const CHARS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?",
} as const;

export interface PasswordOptions {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

export interface StrengthResult {
  level: "weak" | "fair" | "good" | "strong" | "";
  score: number;
  label: string;
  hint: string;
}

/**
 * Lấy 1 ký tự ngẫu nhiên dùng Crypto API
 * crypto.getRandomValues() dùng entropy từ OS — khác Math.random() không an toàn
 */
export function randomChar(str: string): string {
  const arr = new Uint32Array(1);
  window.crypto.getRandomValues(arr);
  return str[arr[0] % str.length];
}

/**
 * Fisher-Yates shuffle dùng Crypto API thay Math.random()
 */
export function cryptoShuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1);
    window.crypto.getRandomValues(buf);
    const j = buf[0] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * Tạo mật khẩu với ít nhất 1 ký tự từ mỗi nhóm được chọn,
 * sau đó fill phần còn lại và shuffle toàn bộ.
 */
export function generatePassword(
  length: number,
  options: PasswordOptions,
): string {
  let charset = "";
  const mandatory: string[] = [];

  (Object.keys(options) as Array<keyof PasswordOptions>).forEach((key) => {
    if (options[key]) {
      charset += CHARS[key];
      mandatory.push(randomChar(CHARS[key]));
    }
  });

  if (!charset) return "";

  const remaining = length - mandatory.length;
  const rest = Array.from({ length: remaining }, () => randomChar(charset));
  const all = [...mandatory, ...rest];
  cryptoShuffle(all);
  return all.join("");
}

/**
 * Tính strength dựa trên độ dài + charset diversity
 */
export function calculateStrength(
  password: string,
  options: PasswordOptions,
): StrengthResult {
  if (!password) {
    return {
      level: "",
      score: 0,
      label: "—",
      hint: "Nhấn Generate để tạo mật khẩu",
    };
  }

  let score = 0;
  const len = password.length;

  if (len >= 8) score += 10;
  if (len >= 12) score += 15;
  if (len >= 16) score += 20;
  if (len >= 24) score += 15;
  if (len >= 32) score += 10;

  const typesUsed = Object.values(options).filter(Boolean).length;
  score += typesUsed * 7;
  if (typesUsed === 4) score += 8;
  score = Math.min(100, score);

  if (score < 30)
    return {
      level: "weak",
      score,
      label: "🔴 Yếu",
      hint: "Tăng độ dài hoặc thêm ký tự đặc biệt.",
    };
  if (score < 55)
    return {
      level: "fair",
      score,
      label: "🟡 Trung bình",
      hint: "Tốt hơn rồi! Cân nhắc tăng thêm độ dài.",
    };
  if (score < 80)
    return {
      level: "good",
      score,
      label: "🟢 Mạnh",
      hint: "Mật khẩu đủ mạnh cho hầu hết dịch vụ.",
    };
  return {
    level: "strong",
    score,
    label: "🔵 Rất mạnh",
    hint: "Xuất sắc! Mật khẩu cực kỳ khó bị crack.",
  };
}

export function maskPassword(pwd: string): string {
  if (pwd.length <= 6) return "•".repeat(pwd.length);
  return (
    pwd.slice(0, 3) + "•".repeat(Math.min(pwd.length - 6, 10)) + pwd.slice(-3)
  );
}
