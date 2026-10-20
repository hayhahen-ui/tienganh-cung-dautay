// ─────────────────────────────────────────────────────────────────────────────
// Owly English — Auth (bản thương mại)
// Supabase Auth (email + mật khẩu) + bảng profiles (role admin/user, kid_name).
// Session lưu sẵn trong localStorage bởi supabase-js. Trạng thái đăng nhập
// quản lý theo mẫu module-store giống progress.ts (useSyncExternalStore).
// ─────────────────────────────────────────────────────────────────────────────

import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { useSyncExternalStore } from "react";

export type OwlyRole = "admin" | "user";

export type OwlyProfile = {
  id: string;
  email: string;
  role: OwlyRole;
  kid_name: string | null;
  created_at: string;
};

export type AuthSnapshot = {
  /** false khi chưa cấu hình VITE_SUPABASE_URL/KEY (build/test không env). */
  configured: boolean;
  loading: boolean;
  session: Session | null;
  profile: OwlyProfile | null;
};

const SUPABASE_URL = (import.meta.env as Record<string, string | undefined>)["VITE_SUPABASE_URL"];
const SUPABASE_ANON_KEY = (import.meta.env as Record<string, string | undefined>)[
  "VITE_SUPABASE_ANON_KEY"
];

export const AUTH_EVENT = "owly-auth-changed";

let client: SupabaseClient | null | undefined;
export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  if (typeof window === "undefined" || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    client = null;
    return client;
  }
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}

export function isAuthConfigured(): boolean {
  return getSupabase() !== null;
}

// ── Module store ─────────────────────────────────────────────────────────────

let snapshot: AuthSnapshot = {
  configured: isAuthConfigured(),
  loading: true,
  session: null,
  profile: null,
};
let listeners: Array<() => void> = [];

function setSnapshot(next: Partial<AuthSnapshot>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((cb) => cb());
}

export function subscribeAuth(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

export function getAuthSnapshot(): AuthSnapshot {
  return snapshot;
}

const SERVER_SNAPSHOT: AuthSnapshot = {
  configured: false,
  loading: true,
  session: null,
  profile: null,
};

export function useAuth(): AuthSnapshot {
  return useSyncExternalStore(subscribeAuth, getAuthSnapshot, () => SERVER_SNAPSHOT);
}

async function loadProfile(userId: string): Promise<OwlyProfile | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from("profiles").select("*").eq("id", userId).single();
  if (error) {
    console.warn("[auth] loadProfile", error.message);
    return null;
  }
  return data as OwlyProfile;
}

let initialized = false;
/** Gọi 1 lần ở root. Lắng nghe thay đổi session + nạp profile. */
export function initAuth() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  const sb = getSupabase();
  if (!sb) {
    setSnapshot({ loading: false });
    return;
  }
  const applySession = async (session: Session | null) => {
    if (!session?.user) {
      setSnapshot({ session: null, profile: null, loading: false });
      return;
    }
    setSnapshot({ session, loading: false });
    const profile = await loadProfile(session.user.id);
    // Chỉ set profile khi session vẫn là session này (tránh race khi logout nhanh).
    if (getAuthSnapshot().session?.user.id === session.user.id) {
      setSnapshot({ profile });
    }
  };
  void sb.auth.getSession().then(({ data }) => applySession(data.session));
  sb.auth.onAuthStateChange((_event, session) => {
    void applySession(session);
  });
}

// ── Thao tác tài khoản ───────────────────────────────────────────────────────

export async function signIn(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Chưa cấu hình đăng nhập (thiếu Supabase)." };
  const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
  if (error) {
    const msg =
      error.message === "Invalid login credentials"
        ? "Email hoặc mật khẩu chưa đúng."
        : error.message;
    return { ok: false, error: msg };
  }
  return { ok: true };
}

export async function signOut() {
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
  setSnapshot({ session: null, profile: null, loading: false });
}

/** User tự đổi mật khẩu của chính mình. */
export async function changeMyPassword(
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Chưa cấu hình đăng nhập." };
  if (newPassword.length < 6) return { ok: false, error: "Mật khẩu phải từ 6 ký tự trở lên." };
  const { error } = await sb.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Đổi tên bé học (ghi vào profiles.kid_name + cập nhật snapshot). */
export async function updateMyKidName(
  kidName: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sb = getSupabase();
  const userId = snapshot.session?.user.id;
  if (!sb || !userId) return { ok: false, error: "Chưa đăng nhập." };
  const clean = kidName.trim().slice(0, 30);
  if (!clean) return { ok: false, error: "Tên bé không được để trống." };
  const { error } = await sb.from("profiles").update({ kid_name: clean }).eq("id", userId);
  if (error) return { ok: false, error: error.message };
  if (snapshot.profile) setSnapshot({ profile: { ...snapshot.profile, kid_name: clean } });
  return { ok: true };
}

// ── Gọi Admin API (Vercel function, dùng service_role ở phía server) ─────────

const API_BASE = (
  (import.meta.env as Record<string, string | undefined>)["VITE_OWLY_API_URL"] || ""
).replace(/\/$/, "");

/** Gọi API public (không JWT) — chỉ dùng cho status/bootstrap của /setup. */
export async function publicApi(
  action: string,
  body: Record<string, unknown> = {},
): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/admin-users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...body }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string } & Record<string, unknown>;
    if (!res.ok || !json.ok) return { ok: false, error: String(json.error ?? `Lỗi ${res.status}`) };
    return { ok: true, data: json };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi mạng." };
  }
}

export type AdminUserRow = {
  id: string;
  email: string;
  role: OwlyRole;
  kid_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
};

export async function adminApi(
  action: string,
  body: Record<string, unknown> = {},
): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; error: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Chưa cấu hình đăng nhập." };
  const { data: sess } = await sb.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) return { ok: false, error: "Chưa đăng nhập." };
  try {
    const res = await fetch(`${API_BASE}/api/admin-users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action, ...body }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string } & Record<string, unknown>;
    if (!res.ok || !json.ok) return { ok: false, error: String(json.error ?? `Lỗi ${res.status}`) };
    return { ok: true, data: json };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi mạng." };
  }
}
