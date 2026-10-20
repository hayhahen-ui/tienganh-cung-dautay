/**
 * Vercel Serverless Function — Quản trị tài khoản (bản thương mại). URL: /api/admin-users
 *
 * Mọi action quản trị yêu cầu: (1) JWT hợp lệ của user có profiles.role='admin'
 * (verify bằng anon key + đọc bảng profiles), (2) thao tác thực tế bằng
 * SERVICE_ROLE — key này chỉ tồn tại ở server, KHÔNG BAO GIỜ tới frontend.
 *
 * Env (Vercel → Settings → Environment Variables):
 *   SUPABASE_URL               (bắt buộc)
 *   SUPABASE_ANON_KEY          (bắt buộc — verify JWT)
 *   SUPABASE_SERVICE_ROLE_KEY  (bắt buộc — KHÔNG dùng VITE_ prefix)
 *   OWLY_SETUP_TOKEN           (bắt buộc cho /setup lần đầu; tự bịa chuỗi dài)
 *
 * Actions (POST JSON):
 *   { action: "status" } → { setupDone }                                   (public)
 *   { action: "bootstrap", token, adminEmail, adminPassword, users? } → tạo admin + 5 user,
 *       trả mật khẩu tạm 1 LẦN DUY NHẤT (chỉ chạy khi chưa có tài khoản nào)
 *   { action: "list" } → danh sách user + profile                       (admin)
 *   { action: "create", email, kidName?, role? } → tạo user, trả mật khẩu 1 lần (admin)
 *   { action: "resetPassword", userId, password }                        (admin)
 *   { action: "updateUser", userId, kidName?, email? }                    (admin)
 *   { action: "deleteUser", userId }                                     (admin)
 *   { action: "progress", userId } → tiến độ học của user                (admin)
 */
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { applyCors } from "./_owly-proxy.js";

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Thiếu biến môi trường ${name}.`);
  return v;
}

function anonClient() {
  return createClient(mustEnv("SUPABASE_URL"), mustEnv("SUPABASE_ANON_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function serviceClient() {
  return createClient(mustEnv("SUPABASE_URL"), mustEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function isSetupDone() {
  const { count, error } = await serviceClient()
    .from("profiles")
    .select("id", { count: "exact", head: true });
  if (error) throw new Error("Không đọc được bảng profiles: " + error.message);
  return (count ?? 0) > 0;
}

/** Trả về auth user nếu caller là admin, ngược lại null. */
async function callerIsAdmin(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const { data, error } = await anonClient().auth.getUser(token);
  if (error || !data.user) return null;
  const { data: profile } = await serviceClient()
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();
  return profile?.role === "admin" ? data.user : null;
}

function randomPassword(len = 10) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(len);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

async function createAccount({ email, password, role, kidName }) {
  const svc = serviceClient();
  const { data, error } = await svc.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role },
  });
  if (error) throw new Error(`Không tạo được ${email}: ${error.message}`);
  const { error: pErr } = await svc.from("profiles").insert({
    id: data.user.id,
    email,
    role,
    kid_name: kidName || null,
  });
  if (pErr) {
    // rollback: xoá auth user vừa tạo
    await svc.auth.admin.deleteUser(data.user.id);
    throw new Error(`Không tạo được hồ sơ ${email}: ${pErr.message}`);
  }
  return { id: data.user.id, email, role, kid_name: kidName || null };
}

export default async function handler(req, res) {
  applyCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    if (req.method === "GET") {
      const action = req.query.action;
      if (action === "status") {
        return res.status(200).json({ ok: true, setupDone: await isSetupDone() });
      }
      return res.status(404).json({ ok: false, error: "Unknown action." });
    }

    if (req.method !== "POST")
      return res.status(405).json({ ok: false, error: "Method not allowed." });
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const action = body.action;

    // ── Public: kiểm tra đã setup chưa ─────────────────────────────────────
    if (action === "status") {
      return res.status(200).json({ ok: true, setupDone: await isSetupDone() });
    }

    // ── Public nhưng khóa bằng token: khởi tạo lần đầu ────────────────────
    if (action === "bootstrap") {
      if (await isSetupDone()) {
        return res.status(403).json({ ok: false, error: "Đã khởi tạo rồi — trang này đã khóa." });
      }
      const setupToken = mustEnv("OWLY_SETUP_TOKEN");
      if (!body.token || body.token !== setupToken) {
        return res.status(403).json({ ok: false, error: "Mã setup chưa đúng." });
      }
      const adminEmail = String(body.adminEmail || "")
        .trim()
        .toLowerCase();
      const adminPassword = String(body.adminPassword || "");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adminEmail)) {
        return res.status(400).json({ ok: false, error: "Email admin chưa hợp lệ." });
      }
      if (adminPassword.length < 6) {
        return res.status(400).json({ ok: false, error: "Mật khẩu admin từ 6 ký tự trở lên." });
      }
      const users = Array.isArray(body.users) ? body.users.slice(0, 20) : [];
      const cleanUsers = [];
      const seen = new Set([adminEmail]);
      for (const u of users) {
        const email = String(u?.email || "")
          .trim()
          .toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || seen.has(email)) continue;
        seen.add(email);
        cleanUsers.push({
          email,
          kidName:
            String(u?.kidName || "")
              .trim()
              .slice(0, 30) || null,
        });
      }
      const admin = await createAccount({
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        kidName: "Quản trị",
      });
      const created = [];
      for (const u of cleanUsers) {
        const password = randomPassword();
        const acc = await createAccount({
          email: u.email,
          password,
          role: "user",
          kidName: u.kidName,
        });
        created.push({ ...acc, tempPassword: password });
      }
      // Mật khẩu tạm CHỈ trả 1 lần trong response này — không lưu ở đâu cả.
      return res.status(200).json({ ok: true, admin: { email: admin.email }, users: created });
    }

    // ── Từ đây yêu cầu admin ───────────────────────────────────────────────
    const caller = await callerIsAdmin(req);
    if (!caller) {
      return res.status(403).json({ ok: false, error: "Cần quyền admin." });
    }
    const svc = serviceClient();

    if (action === "list") {
      const { data: authUsers } = await svc.auth.admin.listUsers({ perPage: 1000 });
      const signInMap = new Map(
        (authUsers?.users ?? []).map((u) => [u.id, u.last_sign_in_at ?? null]),
      );
      const { data: profiles, error } = await svc
        .from("profiles")
        .select("id, email, role, kid_name, created_at")
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return res.status(200).json({
        ok: true,
        users: (profiles ?? []).map((p) => ({
          ...p,
          last_sign_in_at: signInMap.get(p.id) ?? null,
        })),
      });
    }

    if (action === "create") {
      const email = String(body.email || "")
        .trim()
        .toLowerCase();
      const kidName =
        String(body.kidName || "")
          .trim()
          .slice(0, 30) || null;
      const role = body.role === "admin" ? "admin" : "user";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return res.status(400).json({ ok: false, error: "Email chưa hợp lệ." });
      }
      const password = randomPassword();
      const acc = await createAccount({ email, password, role, kidName });
      return res.status(200).json({ ok: true, user: { ...acc, tempPassword: password } });
    }

    if (action === "resetPassword") {
      const userId = String(body.userId || "");
      const password = String(body.password || "");
      if (!userId) return res.status(400).json({ ok: false, error: "Thiếu userId." });
      if (password.length < 6) {
        return res.status(400).json({ ok: false, error: "Mật khẩu từ 6 ký tự trở lên." });
      }
      if (userId === caller.id) {
        return res.status(400).json({
          ok: false,
          error: "Đang đổi mật khẩu của chính mình — dùng trang Tài khoản.",
        });
      }
      const { error } = await svc.auth.admin.updateUserById(userId, { password });
      if (error) throw new Error(error.message);
      return res.status(200).json({ ok: true });
    }

    if (action === "updateUser") {
      const userId = String(body.userId || "");
      if (!userId) return res.status(400).json({ ok: false, error: "Thiếu userId." });
      const patch = {};
      if (body.kidName !== undefined)
        patch.kid_name = String(body.kidName).trim().slice(0, 30) || null;
      if (Object.keys(patch).length) {
        const { error } = await svc.from("profiles").update(patch).eq("id", userId);
        if (error) throw new Error(error.message);
      }
      return res.status(200).json({ ok: true });
    }

    if (action === "deleteUser") {
      const userId = String(body.userId || "");
      if (!userId) return res.status(400).json({ ok: false, error: "Thiếu userId." });
      if (userId === caller.id) {
        return res
          .status(400)
          .json({ ok: false, error: "Không thể xóa chính tài khoản admin đang dùng." });
      }
      const { error } = await svc.auth.admin.deleteUser(userId);
      if (error) throw new Error(error.message);
      return res.status(200).json({ ok: true });
    }

    if (action === "progress") {
      const userId = String(body.userId || "");
      if (!userId) return res.status(400).json({ ok: false, error: "Thiếu userId." });
      const { data, error } = await svc
        .from("progress")
        .select("data, updated_at")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return res.status(200).json({ ok: true, progress: data ?? null });
    }

    return res.status(400).json({ ok: false, error: "Unknown action." });
  } catch (e) {
    console.error("[admin-users]", e);
    return res.status(500).json({ ok: false, error: e?.message ?? "Lỗi server." });
  }
}
