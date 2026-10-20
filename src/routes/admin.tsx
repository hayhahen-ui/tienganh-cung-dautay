import { Fragment, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { adminApi, useAuth, type AdminUserRow } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type ProgressSummary = {
  xp: number;
  streak: number;
  lessonsDone: number;
  stars: number;
  updatedAt: string | null;
};

function summarizeProgress(json: unknown): ProgressSummary {
  const p = (json as { progress?: { data?: unknown; updated_at?: string } | null })?.progress;
  const d = (p?.data ?? {}) as {
    xp?: number;
    streak?: { count?: number };
    lessons?: Record<string, { stars?: number }>;
  };
  const lessons = d.lessons ?? {};
  return {
    xp: d.xp ?? 0,
    streak: d.streak?.count ?? 0,
    lessonsDone: Object.values(lessons).filter((l) => (l.stars ?? 0) > 0).length,
    stars: Object.values(lessons).reduce((s, l) => s + (l.stars ?? 0), 0),
    updatedAt: p?.updated_at ?? null,
  };
}

function AdminPage() {
  const auth = useAuth();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  // form tạo user
  const [newEmail, setNewEmail] = useState("");
  const [newKid, setNewKid] = useState("");
  const [newRole, setNewRole] = useState<"user" | "admin">("user");
  const [createdPw, setCreatedPw] = useState<{ email: string; pw: string } | null>(null);
  // reset mật khẩu inline
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [resetPw, setResetPw] = useState("");
  // tiến độ user đang xem
  const [progFor, setProgFor] = useState<string | null>(null);
  const [prog, setProg] = useState<ProgressSummary | null>(null);
  const [progBusy, setProgBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    const r = await adminApi("list");
    if (!r.ok) setError(r.error);
    else setUsers((r.data["users"] as AdminUserRow[] | undefined) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (auth.profile?.role === "admin") void load();
  }, [auth.profile?.role]);

  if (auth.loading)
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center">Đang tải…</div>;
  if (!auth.session)
    return (
      <LockBox title="Trang quản trị" hint="Đăng nhập tài khoản admin để tiếp tục.">
        <Link
          to="/dang-nhap"
          className="mt-4 inline-block rounded-full bg-primary px-6 py-2 font-bold text-primary-foreground"
        >
          🔑 Đăng nhập
        </Link>
      </LockBox>
    );
  if (auth.profile?.role !== "admin")
    return (
      <LockBox
        title="Không có quyền"
        hint="Trang này chỉ dành cho quản trị viên. Tài khoản của bạn là học viên."
      />
    );

  const doCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice("");
    setError("");
    const r = await adminApi("create", {
      email: newEmail.trim(),
      kidName: newKid.trim(),
      role: newRole,
    });
    if (!r.ok) {
      setError(r.error);
      return;
    }
    const u = (r.data as { user: { email: string; tempPassword: string } }).user;
    setCreatedPw({ email: u.email, pw: u.tempPassword });
    setNewEmail("");
    setNewKid("");
    void load();
  };

  const doReset = async (id: string) => {
    setError("");
    setNotice("");
    const r = await adminApi("resetPassword", { userId: id, password: resetPw });
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setNotice("Đã đặt lại mật khẩu.");
    setResetFor(null);
    setResetPw("");
  };

  const doDelete = async (u: AdminUserRow) => {
    if (!window.confirm(`Xóa tài khoản ${u.email}? Toàn bộ tiến độ học sẽ mất theo.`)) return;
    setError("");
    setNotice("");
    const r = await adminApi("deleteUser", { userId: u.id });
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setNotice(`Đã xóa ${u.email}.`);
    void load();
  };

  const doSaveKid = async (u: AdminUserRow, kidName: string) => {
    const r = await adminApi("updateUser", { userId: u.id, kidName });
    if (!r.ok) setError(r.error);
    else {
      setNotice("Đã cập nhật tên bé.");
      void load();
    }
  };

  const viewProgress = async (u: AdminUserRow) => {
    setProgFor(u.id);
    setProg(null);
    setProgBusy(true);
    const r = await adminApi("progress", { userId: u.id });
    setProgBusy(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setProg(summarizeProgress(r.data));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold">🛠️ Quản trị tài khoản</h1>
      <p className="text-sm text-muted-foreground">
        {users.length} tài khoản · admin làm được mọi thao tác của user + quản lý tại đây
      </p>

      {error && (
        <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}
      {notice && (
        <p className="mt-4 rounded-xl bg-emerald-100 p-3 text-sm text-emerald-900">{notice}</p>
      )}

      {/* Tạo user mới */}
      <form onSubmit={doCreate} className="mt-6 rounded-3xl border-2 border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold">➕ Tạo tài khoản mới</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="email@vidu.com"
            className="min-w-0 flex-1 rounded-xl border-2 border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            value={newKid}
            onChange={(e) => setNewKid(e.target.value)}
            placeholder="Tên bé"
            className="w-36 rounded-xl border-2 border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as "user" | "admin")}
            className="rounded-xl border-2 border-border bg-background px-3 py-2 text-sm"
          >
            <option value="user">Học viên</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
          >
            Tạo
          </button>
        </div>
        {createdPw && (
          <p className="mt-3 rounded-xl bg-amber-100 p-3 text-sm font-bold text-amber-900">
            ⚠️ Mật khẩu tạm của <span className="font-mono">{createdPw.email}</span>:{" "}
            <span className="font-mono text-base">{createdPw.pw}</span> — lưu lại ngay, chỉ hiện 1
            lần.
          </p>
        )}
      </form>

      {/* Danh sách */}
      <div className="mt-6 overflow-x-auto rounded-3xl border-2 border-border bg-card">
        {loading ? (
          <p className="p-6 text-center text-muted-foreground">Đang tải…</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-border text-muted-foreground">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Tên bé</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Đăng nhập cuối</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <Fragment key={u.id}>
                  <tr className="border-b border-border align-top">
                    <td className="px-4 py-3 font-mono">{u.email}</td>
                    <td className="px-4 py-3">
                      <KidEditor initial={u.kid_name ?? ""} onSave={(v) => void doSaveKid(u, v)} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${u.role === "admin" ? "bg-violet-200 text-violet-900" : "bg-sky-100 text-sky-900"}`}
                      >
                        {u.role === "admin" ? "👑 admin" : "🎒 học viên"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {u.last_sign_in_at
                        ? new Date(u.last_sign_in_at).toLocaleString("vi-VN")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => void viewProgress(u)}
                          className="rounded-full border px-2.5 py-1 text-xs font-bold hover:bg-muted"
                        >
                          📊 Tiến độ
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setResetFor(u.id);
                            setResetPw("");
                          }}
                          className="rounded-full border px-2.5 py-1 text-xs font-bold hover:bg-muted"
                        >
                          🔑 Đổi MK
                        </button>
                        <button
                          type="button"
                          onClick={() => void doDelete(u)}
                          className="rounded-full border border-destructive/40 px-2.5 py-1 text-xs font-bold text-destructive hover:bg-destructive/10"
                        >
                          🗑 Xóa
                        </button>
                      </div>
                      {resetFor === u.id && (
                        <div className="mt-2 flex gap-1.5">
                          <input
                            type="text"
                            value={resetPw}
                            onChange={(e) => setResetPw(e.target.value)}
                            placeholder="Mật khẩu mới (≥6 ký tự)"
                            className="min-w-0 flex-1 rounded-lg border-2 border-border px-2 py-1 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => void doReset(u.id)}
                            className="rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground"
                          >
                            Lưu
                          </button>
                          <button
                            type="button"
                            onClick={() => setResetFor(null)}
                            className="rounded-lg border px-2.5 py-1 text-xs"
                          >
                            Hủy
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  {progFor === u.id && (
                    <tr className="border-b border-border bg-muted/40">
                      <td colSpan={5} className="px-4 py-3">
                        {progBusy ? (
                          <span className="text-xs text-muted-foreground">Đang tải tiến độ…</span>
                        ) : prog ? (
                          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
                            <span>
                              ⭐ <b>{prog.xp}</b> XP
                            </span>
                            <span>
                              🔥 Streak <b>{prog.streak}</b> ngày
                            </span>
                            <span>
                              📚 <b>{prog.lessonsDone}</b> bài có sao
                            </span>
                            <span>
                              🌟 Tổng <b>{prog.stars}</b> sao
                            </span>
                            <span className="text-muted-foreground">
                              Cập nhật:{" "}
                              {prog.updatedAt
                                ? new Date(prog.updatedAt).toLocaleString("vi-VN")
                                : "chưa có"}
                            </span>
                            <button
                              type="button"
                              onClick={() => setProgFor(null)}
                              className="underline"
                            >
                              Ẩn
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Chưa có dữ liệu.</span>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function KidEditor({ initial, onSave }: { initial: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initial);
  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="underline decoration-dotted"
      >
        {initial || <span className="text-muted-foreground">chưa đặt</span>} ✏️
      </button>
    );
  }
  return (
    <span className="flex gap-1">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-24 rounded-lg border-2 border-border px-2 py-0.5 text-xs"
      />
      <button
        type="button"
        onClick={() => {
          onSave(value);
          setEditing(false);
        }}
        className="rounded-lg bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground"
      >
        ✓
      </button>
      <button
        type="button"
        onClick={() => {
          setValue(initial);
          setEditing(false);
        }}
        className="rounded-lg border px-2 py-0.5 text-xs"
      >
        ✕
      </button>
    </span>
  );
}

function LockBox({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border-2 border-border bg-card p-8 text-center">
        <div className="text-5xl" aria-hidden>
          🔒
        </div>
        <h1 className="mt-2 font-display text-xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
        {children}
      </div>
    </div>
  );
}
