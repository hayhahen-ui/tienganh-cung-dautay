/**
 * owlyKeys.ts — Kho API key của ba mẹ, lưu ở localStorage TRÊN MÁY CỦA BÉ.
 * Mẫu từ mt5-mrbit-2026 (aiKeys.ts):
 * - Key KHÔNG BAO GIỜ gửi đi đâu ngoài nhà cung cấp AI do ba mẹ chọn
 *   (đi qua proxy /api/ask-owly — proxy chỉ chuyển tiếp, không lưu, không log).
 * - UI chỉ hiện dạng ••••abcd (4 ký tự cuối), không bao giờ hiện key đầy đủ.
 * - Không có key → app vẫn chạy đầy đủ ở chế độ "📚 Giáo trình".
 */
import { detectOwlyProvider, type OwlyProviderMeta } from "./owlyProviders";

const KEY_STORAGE = "owly-ai-key-v1";

function readStored(): string | null {
  try {
    const raw = localStorage.getItem(KEY_STORAGE);
    if (!raw) return null;
    const o = JSON.parse(raw) as { key?: unknown };
    return typeof o.key === "string" && o.key.trim() ? o.key.trim() : null;
  } catch {
    return null;
  }
}

/** Lưu key của ba mẹ vào máy (ghi đè key cũ nếu có). */
export function saveOwlyKey(apiKey: string): void {
  const key = apiKey.trim();
  if (!key) return;
  try {
    localStorage.setItem(KEY_STORAGE, JSON.stringify({ key, savedAt: Date.now() }));
  } catch {
    /* bộ nhớ đầy hoặc bị chặn — bỏ qua */
  }
}

/** Key đang lưu, hoặc null nếu chưa có. */
export function getOwlyKey(): string | null {
  return readStored();
}

/** true khi ba mẹ đã dán key. */
export function hasOwlyKey(): boolean {
  return !!readStored();
}

/** Xóa key khỏi máy. */
export function removeOwlyKey(): void {
  try {
    localStorage.removeItem(KEY_STORAGE);
  } catch {
    /* noop */
  }
}

/** "••••abcd" — hiện ở UI, không bao giờ hiện key đầy đủ. */
export function owlyKeyHint(): string | null {
  const k = readStored();
  return k ? `••••${k.slice(-4)}` : null;
}

/** Provider được nhận diện từ key đang lưu (để hiện tên + link lấy key). */
export function owlyKeyProvider(): OwlyProviderMeta | null {
  const k = readStored();
  return k ? detectOwlyProvider(k) : null;
}
