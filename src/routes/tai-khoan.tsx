import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { changeMyPassword, signOut, updateMyKidName, useAuth } from "@/lib/auth";
import { setProfile, useProgress } from "@/lib/progress";
import { flushProgress } from "@/lib/progressSync";

export const Route = createFileRoute("/tai-khoan")({
  component: AccountPage,
});

/** Trang tài khoản: user chỉ quản lý được CHÍNH MÌNH — đổi tên bé, đổi mật khẩu, xem tiến độ. */
function AccountPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const p = useProgress();
  const [kidName, setKidNameState] = useState(auth.profile?.kid_name ?? "");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  if (auth.loading) return <div className="mx-auto max-w-lg px-4 py-16 text-center">Đang tải…</div>;
  if (!auth.session) {
    void navigate({ to: "/dang-nhap" });
    return null;
  }

  const saveKid = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice("");
    setError("");
    const r = await updateMyKidName(kidName);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setProfile({ name: kidName.trim() });
    setNotice("Đã đổi tên bé học.");
  };

  const doChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice("");
    setError("");
    if (newPw !== confirmPw) {
      setError("Nhập lại mật khẩu chưa khớp.");
      return;
    }
    const r = await changeMyPassword(newPw);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setNewPw("");
    setConfirmPw("");
    setNotice("Đã đổi mật khẩu.");
  };

  const doLogout = async () => {
    await flushProgress();
    await signOut();
    void navigate({ to: "/" });
  };

  const lessonsDone = Object.values(p.lessons).filter((l) => l.stars > 0).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold">👤 Tài khoản</h1>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
        <span>
          Email: <b className="text-foreground">{auth.profile?.email ?? auth.session.user.email}</b>
        </span>
        <span>
          Vai trò:{" "}
          <b className="text-foreground">
            {auth.profile?.role === "admin" ? "👑 Admin" : "🎒 Học viên"}
          </b>
        </span>
      </div>
      {auth.profile?.role === "admin" && (
        <p className="mt-2">
          <Link to="/admin" className="font-bold text-primary underline">
            🛠️ Mở trang Quản trị tài khoản
          </Link>
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}
      {notice && (
        <p className="mt-4 rounded-xl bg-emerald-100 p-3 text-sm text-emerald-900">{notice}</p>
      )}

      {/* Tiến độ của tôi */}
      <div className="mt-6 rounded-3xl border-2 border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold">📊 Tiến độ học của bé</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="XP" value={`${p.xp}`} emoji="⭐" />
          <Stat label="Chuỗi ngày" value={`${p.streak.count}`} emoji="🔥" />
          <Stat label="Bài có sao" value={`${lessonsDone}`} emoji="📚" />
          <Stat label="Huy hiệu" value={`${p.badges.length}`} emoji="🏅" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Tiến độ tự động lưu theo tài khoản — đăng nhập trên thiết bị khác vẫn thấy đúng tiến độ.
        </p>
      </div>

      {/* Đổi tên bé */}
      <form onSubmit={saveKid} className="mt-6 rounded-3xl border-2 border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold">🧒 Tên bé học</h2>
        <div className="mt-3 flex gap-2">
          <input
            value={kidName}
            onChange={(e) => setKidNameState(e.target.value)}
            placeholder="Ví dụ: Bé Na"
            maxLength={30}
            className="min-w-0 flex-1 rounded-xl border-2 border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
          >
            Lưu tên
          </button>
        </div>
      </form>

      {/* Đổi mật khẩu */}
      <form onSubmit={doChangePw} className="mt-6 rounded-3xl border-2 border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold">🔑 Đổi mật khẩu của tôi</h2>
        <div className="mt-3 space-y-3">
          <input
            type="password"
            required
            minLength={6}
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="Mật khẩu mới (≥6 ký tự)"
            autoComplete="new-password"
            className="w-full rounded-xl border-2 border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            type="password"
            required
            minLength={6}
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            autoComplete="new-password"
            className="w-full rounded-xl border-2 border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
          >
            Đổi mật khẩu
          </button>
        </div>
      </form>

      <button
        type="button"
        onClick={() => void doLogout()}
        className="mt-6 w-full rounded-full border-2 border-destructive/50 px-4 py-3 font-display text-base font-bold text-destructive hover:bg-destructive/10"
      >
        🚪 Đăng xuất
      </button>
    </div>
  );
}

function Stat({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <div className="rounded-2xl bg-muted/60 p-3 text-center">
      <div className="text-xl" aria-hidden>
        {emoji}
      </div>
      <div className="font-display text-lg font-bold">{value}</div>
      <div className="text-[11px] font-bold uppercase text-muted-foreground">{label}</div>
    </div>
  );
}
