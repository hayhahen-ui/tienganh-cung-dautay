import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { publicApi, isAuthConfigured, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/setup")({
  component: SetupPage,
});

type CreatedUser = {
  id: string;
  email: string;
  role: string;
  kid_name: string | null;
  tempPassword: string;
};

/**
 * Trang khởi tạo LẦN ĐẦU: tạo tài khoản admin + 5 user.
 * - Khóa bằng OWLY_SETUP_TOKEN (env phía Vercel) — server kiểm tra.
 * - Server từ chối nếu đã có tài khoản (isSetupDone).
 * - Mật khẩu tạm của 5 user CHỈ hiện 1 lần trên màn hình này — không lưu ở đâu.
 */
function SetupPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [checking, setChecking] = useState(true);
  const [already, setAlready] = useState(false);
  const [token, setToken] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [users, setUsers] = useState(
    Array.from({ length: 5 }, (_, i) => ({
      email: `user${i + 1}@owly.app`,
      kidName: `Bé ${i + 1}`,
    })),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ adminEmail: string; users: CreatedUser[] } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await publicApi("status");
      if (alive && r.ok && r.data["setupDone"]) setAlready(true);
      if (alive) setChecking(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (auth.session) {
    void navigate({ to: "/" });
    return null;
  }

  const setUserField = (i: number, field: "email" | "kidName", value: string) => {
    setUsers((prev) => prev.map((u, j) => (j === i ? { ...u, [field]: value } : u)));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await publicApi("bootstrap", {
      token: token.trim(),
      adminEmail: adminEmail.trim(),
      adminPassword,
      users,
    });
    if (!r.ok) {
      setError(r.error);
    } else {
      const d = r.data as unknown as { admin: { email: string }; users: CreatedUser[] };
      setResult({ adminEmail: d.admin.email, users: d.users ?? [] });
    }
    setBusy(false);
  };

  if (checking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-muted-foreground">
        Đang kiểm tra…
      </div>
    );
  }

  if (already) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="rounded-3xl border-2 border-border bg-card p-8 text-center">
          <div className="text-5xl" aria-hidden>
            🔒
          </div>
          <h1 className="mt-2 font-display text-xl font-bold">Trang setup đã khóa</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Hệ thống đã được khởi tạo. Muốn tạo thêm user, đăng nhập tài khoản admin rồi vào trang
            Quản trị.
          </p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-3xl border-2 border-border bg-card p-8">
          <div className="text-center">
            <div className="text-5xl" aria-hidden>
              🎉
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold">Khởi tạo thành công!</h1>
            <p className="mt-2 rounded-xl bg-amber-100 p-3 text-sm font-bold text-amber-900">
              ⚠️ Mật khẩu tạm của 5 user CHỈ hiện 1 lần ở đây — hãy lưu lại ngay, rồi đổi khi bàn
              giao cho học viên.
            </p>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-border text-muted-foreground">
                  <th className="py-2 pr-2">Email</th>
                  <th className="py-2 pr-2">Tên bé</th>
                  <th className="py-2">Mật khẩu tạm</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-2 pr-2 font-bold">{result.adminEmail}</td>
                  <td className="py-2 pr-2">Quản trị (admin)</td>
                  <td className="py-2 text-muted-foreground">— (mật khẩu anh vừa đặt)</td>
                </tr>
                {result.users.map((u) => (
                  <tr key={u.id} className="border-b border-border">
                    <td className="py-2 pr-2 font-mono">{u.email}</td>
                    <td className="py-2 pr-2">{u.kid_name ?? "—"}</td>
                    <td className="py-2 font-mono font-bold text-primary">{u.tempPassword}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={() => navigate({ to: "/dang-nhap" })}
            className="mt-6 w-full rounded-full bg-primary px-4 py-3 font-display text-base font-bold text-primary-foreground"
          >
            🔑 Đi tới đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="rounded-3xl border-2 border-border bg-card p-8">
        <div className="text-center">
          <div className="text-5xl" aria-hidden>
            ⚙️
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold">Khởi tạo hệ thống</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chỉ chạy 1 lần duy nhất. Tạo tài khoản <b>admin</b> + <b>5 user</b>.
          </p>
        </div>
        {!isAuthConfigured() && (
          <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            Chưa cấu hình Supabase — trang này chưa dùng được.
          </p>
        )}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-bold">Mã setup (OWLY_SETUP_TOKEN trên Vercel)</span>
            <input
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Chuỗi bí mật anh đặt ở Vercel"
              className="mt-1 w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold">Email admin</span>
            <input
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@email.com"
              className="mt-1 w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold">Mật khẩu admin (từ 6 ký tự)</span>
            <input
              type="password"
              required
              minLength={6}
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <div>
            <p className="text-sm font-bold">5 tài khoản user</p>
            <div className="mt-2 space-y-2">
              {users.map((u, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={u.email}
                    onChange={(e) => setUserField(i, "email", e.target.value)}
                    className="min-w-0 flex-1 rounded-xl border-2 border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    value={u.kidName}
                    onChange={(e) => setUserField(i, "kidName", e.target.value)}
                    placeholder="Tên bé"
                    className="w-28 rounded-xl border-2 border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Mật khẩu của 5 user sẽ được tạo ngẫu nhiên và hiện 1 lần sau khi xong.
            </p>
          </div>
          {error && (
            <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
          )}
          <button
            type="submit"
            disabled={busy || !isAuthConfigured()}
            className="w-full rounded-full bg-primary px-4 py-3 font-display text-base font-bold text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Đang tạo…" : "🚀 Tạo admin + 5 user"}
          </button>
        </form>
      </div>
    </div>
  );
}
