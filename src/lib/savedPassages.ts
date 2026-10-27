/**
 * savedPassages.ts — Thư viện bài đọc của bé (trang Đọc chạm).
 *
 * Lưu trên trình duyệt của máy bé (localStorage, giống cài đặt giọng đọc
 * và key) — không cần tài khoản, không cần mạng khi đọc lại. Mỗi máy có
 * thư viện riêng; đồng bộ cloud là bước tiếp theo nếu ba mẹ cần.
 *
 * - Bài AI tạo ra được TỰ ĐỘNG lưu khi tạo thành công.
 * - Bài mẫu / bài dán tay: bấm "Lưu bài này" để lưu.
 * - Tối đa 50 bài, bài cũ nhất tự rơi ra khi đầy; trùng nội dung thì
 *   không lưu trùng.
 */
import type { TouchLine } from "@/components/TouchRead";

export type SavedPassage = {
  id: string;
  title: string;
  lines: TouchLine[];
  level?: "starters" | "movers" | "flyers";
  model?: "kimi" | "qwen";
  createdAt: number;
};

const SLOT = "owly-saved-passages-v1";
const MAX_SAVED = 50;

export function loadSavedPassages(): SavedPassage[] {
  try {
    const raw = localStorage.getItem(SLOT);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (p): p is SavedPassage =>
        p && typeof p.id === "string" && typeof p.title === "string" && Array.isArray(p.lines),
    );
  } catch {
    return [];
  }
}

function persist(list: SavedPassage[]) {
  try {
    localStorage.setItem(SLOT, JSON.stringify(list));
  } catch {
    // localStorage đầy: bỏ bài cũ nhất rồi thử lại 1 lần.
    try {
      localStorage.setItem(SLOT, JSON.stringify(list.slice(0, 10)));
    } catch {
      /* không lưu được thì thôi, bài hiện tại vẫn đọc được */
    }
  }
}

/** Lưu 1 bài; trả về true nếu lưu mới, false nếu đã có sẵn. */
export function savePassage(entry: Omit<SavedPassage, "id" | "createdAt">): boolean {
  const list = loadSavedPassages();
  const fingerprint = JSON.stringify(entry.lines);
  if (list.some((p) => p.title === entry.title && JSON.stringify(p.lines) === fingerprint)) {
    return false;
  }
  const item: SavedPassage = {
    ...entry,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  persist([item, ...list].slice(0, MAX_SAVED));
  return true;
}

export function deletePassage(id: string) {
  persist(loadSavedPassages().filter((p) => p.id !== id));
}

export function formatSavedDate(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  } catch {
    return "";
  }
}
