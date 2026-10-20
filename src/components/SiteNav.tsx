import { Link, useNavigate } from "@tanstack/react-router";
import { VoiceSettings } from "./VoiceSettings";
import { dueCards, rankFor, useProgress } from "@/lib/progress";
import { signOut, useAuth } from "@/lib/auth";
import { flushProgress } from "@/lib/progressSync";

const items = [
  { to: "/", label: "Trang chủ" },
  { to: "/bai-hoc", label: "📚 Bài học" },
  { to: "/on-tap", label: "🧠 Ôn tập" },
  { to: "/hoi-dap", label: "💬 Hỏi cô Owly" },
  { to: "/lo-trinh", label: "Lộ trình" },
  { to: "/giao-trinh", label: "Giáo trình" },
  { to: "/ba-me", label: "Góc ba mẹ" },
] as const;

export function SiteNav() {
  const p = useProgress();
  const auth = useAuth();
  const navigate = useNavigate();
  const due = dueCards(p, 99).length;
  const rank = rankFor(p.xp);

  const doLogout = async () => {
    await flushProgress();
    await signOut();
    void navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-30 border-b-2 border-border bg-background/85 backdrop-blur">
      <nav
        className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3"
        aria-label="Điều hướng chính"
      >
        <Link to="/" className="mr-auto flex items-center gap-2">
          <span className="text-2xl" aria-hidden>
            🦉
          </span>
          <span className="font-display text-xl font-bold">Owly English</span>
        </Link>
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            activeOptions={{ exact: it.to === "/" }}
            className="relative rounded-full px-3 py-1.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted"
            activeProps={{ className: "bg-primary text-primary-foreground" }}
          >
            {it.label}
            {it.to === "/on-tap" && due > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                {due > 99 ? "99+" : due}
              </span>
            )}
          </Link>
        ))}
        <Link
          to="/tien-do"
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-card px-3 py-1 text-sm font-bold"
          activeProps={{ className: "border-primary" }}
          aria-label="Xem tiến độ"
          style={{ display: auth.session || !auth.configured ? undefined : "none" }}
        >
          <span aria-hidden>{p.avatar}</span>
          <span>{p.xp} XP</span>
          <span className="text-muted-foreground">·</span>
          <span>🔥 {p.streak.count}</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">· {rank.name}</span>
        </Link>
        {auth.configured && !auth.session ? (
          <Link
            to="/dang-nhap"
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground"
          >
            🔑 Đăng nhập
          </Link>
        ) : (
          auth.session && (
            <>
              {auth.profile?.role === "admin" && (
                <Link
                  to="/admin"
                  className="rounded-full border-2 border-violet-300 bg-violet-100 px-3 py-1 text-sm font-bold text-violet-900"
                  title="Quản trị tài khoản"
                >
                  🛠️
                </Link>
              )}
              <Link
                to="/tai-khoan"
                className="inline-flex max-w-36 items-center gap-1 truncate rounded-full border-2 border-border bg-card px-3 py-1 text-sm font-bold"
                title="Tài khoản"
              >
                🧒 {auth.profile?.kid_name || "Bé học"}
              </Link>
              <button
                type="button"
                onClick={() => void doLogout()}
                className="rounded-full border-2 border-border px-3 py-1 text-sm font-bold text-muted-foreground hover:text-destructive"
                title="Đăng xuất"
              >
                🚪
              </button>
            </>
          )
        )}
        <VoiceSettings compact />
      </nav>
    </header>
  );
}
