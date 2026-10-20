import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { signIn, useAuth, isAuthConfigured } from "@/lib/auth";

export const Route = createFileRoute("/dang-nhap")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (auth.session) {
    void navigate({ to: "/" });
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await signIn(email, password);
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    void navigate({ to: "/" });
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-3xl border-2 border-border bg-card p-8 shadow-pop">
        <div className="text-center">
          <div className="text-5xl" aria-hidden>
            🦉
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold">Đăng nhập</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Học viên đăng nhập để mở khóa toàn bộ nội dung và lưu tiến độ học.
          </p>
        </div>
        {!isAuthConfigured() && (
          <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            Chức năng đăng nhập chưa được cấu hình (thiếu Supabase). Liên hệ quản trị viên.
          </p>
        )}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-bold">Email</span>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vidu@email.com"
              className="mt-1 w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold">Mật khẩu</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          {error && (
            <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
          )}
          <button
            type="submit"
            disabled={busy || !isAuthConfigured()}
            className="w-full rounded-full bg-primary px-4 py-3 font-display text-base font-bold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {busy ? "Đang đăng nhập…" : "🔑 Đăng nhập"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Chưa có tài khoản? Liên hệ quản trị viên để được cấp.{" "}
          <Link to="/" className="underline">
            Về trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
