import { Link } from "@tanstack/react-router";
import { VoiceSettings } from "./VoiceSettings";
import { dueCards, rankFor, useProgress } from "@/lib/progress";

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
  const due = dueCards(p, 99).length;
  const rank = rankFor(p.xp);
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
        >
          <span aria-hidden>{p.avatar}</span>
          <span>{p.xp} XP</span>
          <span className="text-muted-foreground">·</span>
          <span>🔥 {p.streak.count}</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">· {rank.name}</span>
        </Link>
        <VoiceSettings compact />
      </nav>
    </header>
  );
}
