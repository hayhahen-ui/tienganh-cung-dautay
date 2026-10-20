// ─────────────────────────────────────────────────────────────────────────────
// Owly English — Đồng bộ tiến độ theo tài khoản (bản thương mại)
// Mỗi user đăng nhập có tiến độ riêng trong bảng `progress` (Supabase).
// localStorage vẫn là cache + nguồn hiển thị; cloud là bản gốc đa thiết bị.
// Chiến lược: bản có updated_at mới hơn thắng (last-write-wins).
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabase, subscribeAuth, getAuthSnapshot } from "./auth";
import {
  getProgress,
  replaceProgress,
  resetProgress,
  subscribeProgress,
  type ProgressState,
} from "./progress";

const SYNC_MARKER_KEY = "owly-progress-synced-at";
const SAVE_DEBOUNCE_MS = 6000;

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let currentUserId: string | null = null;
let syncing = false;

function getMarker(): string | null {
  try {
    return window.localStorage.getItem(SYNC_MARKER_KEY);
  } catch {
    return null;
  }
}

function setMarker(iso: string) {
  try {
    window.localStorage.setItem(SYNC_MARKER_KEY, iso);
  } catch {
    // ignore
  }
}

function clearMarker() {
  try {
    window.localStorage.removeItem(SYNC_MARKER_KEY);
  } catch {
    // ignore
  }
}

function hasMeaningfulData(p: ProgressState): boolean {
  return (
    p.xp > 0 ||
    Object.keys(p.lessons).length > 0 ||
    Object.keys(p.srs).length > 0 ||
    p.badges.length > 0
  );
}

async function pushNow(): Promise<boolean> {
  const sb = getSupabase();
  const uid = currentUserId;
  // Tài khoản đăng nhập nhưng KHÔNG có hồ sơ Owly (vd tài khoản app khác
  // dùng chung project) → không đồng bộ gì cả.
  if (!sb || !uid || !getAuthSnapshot().profile) return false;
  const now = new Date().toISOString();
  const { error } = await sb
    .from("owly_progress")
    .upsert({ user_id: uid, data: getProgress(), updated_at: now });
  if (error) {
    console.warn("[sync] push", error.message);
    return false;
  }
  setMarker(now);
  return true;
}

/** Lưu tiến độ lên cloud (chờ 6s sau thay đổi cuối, chống spam ghi). */
export function schedulePush() {
  if (!currentUserId) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    void pushNow();
  }, SAVE_DEBOUNCE_MS);
}

/** Đẩy ngay lập tức (dùng trước khi đăng xuất). */
export async function flushProgress() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  await pushNow();
}

async function pullAndMerge(userId: string) {
  const sb = getSupabase();
  if (!sb) return;
  // Chờ profile nạp xong; không có hồ sơ Owly thì bỏ qua (tránh vi phạm FK).
  for (let i = 0; i < 20 && !getAuthSnapshot().profile && getAuthSnapshot().session; i++) {
    await new Promise((r) => setTimeout(r, 250));
  }
  if (!getAuthSnapshot().profile) return;
  syncing = true;
  try {
    const { data, error } = await sb
      .from("owly_progress")
      .select("data, updated_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      console.warn("[sync] pull", error.message);
      return;
    }
    const local = getProgress();
    const marker = getMarker();
    if (data?.data && hasMeaningfulData(data.data as ProgressState)) {
      const remote = data.data as ProgressState;
      const remoteIsNewer = !marker || data.updated_at > marker;
      if (remoteIsNewer) {
        // Cloud mới hơn → dùng bản cloud (đồng bộ đa thiết bị).
        replaceProgress(remote);
        setMarker(data.updated_at as string);
      } else if (hasMeaningfulData(local)) {
        // Local có thay đổi chưa sync → đẩy lên.
        await pushNow();
      }
    } else if (hasMeaningfulData(local)) {
      // Cloud trống (lần đầu) → đẩy tiến độ đang có trên máy lên.
      await pushNow();
    }
  } finally {
    syncing = false;
  }
}

let started = false;
/** Gọi 1 lần ở root (sau initAuth). */
export function initProgressSync() {
  if (started || typeof window === "undefined") return;
  started = true;

  subscribeAuth(() => {
    const snap = getAuthSnapshot();
    const uid = snap.session?.user.id ?? null;
    if (uid && uid !== currentUserId) {
      currentUserId = uid;
      void pullAndMerge(uid);
    } else if (!uid && currentUserId) {
      // Đăng xuất → flush trước rồi mới xoá dấu vết trên máy dùng chung.
      const wasUser = currentUserId;
      currentUserId = null;
      void (async () => {
        currentUserId = wasUser;
        await flushProgress();
        currentUserId = null;
        resetProgress();
        clearMarker();
      })();
    }
  });

  subscribeProgress(() => {
    if (!syncing) schedulePush();
  });

  // Thoát tab/app → cố gắng flush (best-effort, không await được).
  window.addEventListener("beforeunload", () => {
    void flushProgress();
  });
}
