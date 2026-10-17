import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { lessons, levels } from "@/data/curriculum";
import {
  BADGES,
  dueCards,
  lastSevenDays,
  lessonPercent,
  rankFor,
  resetProgress,
  setProfile,
  useProgress,
} from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tien-do")({
  head: () => ({
    meta: [
      { title: "Tiến độ học của bé — XP, chuỗi ngày, huy hiệu | Owly English" },
      {
        name: "description",
        content:
          "Bảng theo dõi tiến độ: XP, streak, sao từng bài, huy hiệu và báo cáo tuần cho ba mẹ.",
      },
    ],
  }),
  component: ProgressPage,
});

const AVATARS = ["🦉", "🐯", "🐼", "🦊", "🐸", "🦄", "🐧", "🐙"];

function ProgressPage() {
  const p = useProgress();
  const rank = rankFor(p.xp);
  const week = lastSevenDays(p);
  const maxXp = Math.max(1, ...week.map((d) => d.xp));
  const completed = lessons.filter((l) => p.lessons[l.slug]?.completedAt).length;
  const stars = lessons.reduce((s, l) => s + (p.lessons[l.slug]?.stars ?? 0), 0);
  const due = dueCards(p, 999).length;
  const [confirm, setConfirm] = useState(false);
  const weekXp = week.reduce((s, d) => s + d.xp, 0);
  const activeDays = week.filter((d) => d.xp > 0).length;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {/* Hồ sơ */}
      <div className="card-pop flex flex-wrap items-center gap-5 p-6">
        <span className="text-7xl" aria-hidden>
          {p.avatar}
        </span>
        <div className="min-w-56 flex-1">
          <input
            value={p.name}
            onChange={(e) => setProfile({ name: e.target.value })}
            placeholder="Tên của bé…"
            aria-label="Tên của bé"
            className="w-full max-w-xs rounded-xl border-2 border-border bg-card px-3 py-1.5 font-display text-2xl font-extrabold outline-none focus:border-primary"
          />
          <p className="mt-1 font-bold text-primary">
            {rank.emoji} {rank.name} · Cấp {rank.level}
          </p>
          <div className="mt-2 h-3 w-full max-w-xs overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary"
              style={{ width: `${(rank.into / rank.next) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {rank.into}/{rank.next} XP đến cấp tiếp theo · Tổng {p.xp} XP
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                aria-label={`Chọn avatar ${a}`}
                onClick={() => setProfile({ avatar: a })}
                className={cn(
                  "rounded-lg border-2 px-1.5 text-xl",
                  a === p.avatar ? "border-primary bg-primary/10" : "border-transparent",
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center">
          <Stat label="Chuỗi ngày" value={`${p.streak.count} 🔥`} sub={`kỷ lục ${p.streak.best}`} />
          <Stat
            label="Bài hoàn thành"
            value={`${completed}/${lessons.length}`}
            sub={`${stars} ⭐`}
          />
          <Stat
            label="Từ cần ôn"
            value={String(due)}
            sub={`${Object.keys(p.srs).length} từ trong hộp`}
          />
          <Stat label="Huy hiệu" value={`${p.badges.length}/${BADGES.length}`} sub="🏅" />
        </div>
      </div>

      {/* Việc hôm nay */}
      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <Link to="/on-tap" className="card-pop p-4 transition-transform hover:-translate-y-1">
          <p className="text-3xl">🧠</p>
          <p className="font-display font-bold">Ôn {due} từ đến hạn</p>
          <p className="text-xs text-muted-foreground">5 phút mỗi ngày là đủ</p>
        </Link>
        {(() => {
          const nextLesson = lessons.find((l) => !p.lessons[l.slug]?.completedAt) ?? lessons[0]!;
          return (
            <Link
              to="/bai-hoc/$slug"
              params={{ slug: nextLesson.slug }}
              className="card-pop p-4 transition-transform hover:-translate-y-1"
            >
              <p className="text-3xl">{nextLesson.emoji}</p>
              <p className="font-display font-bold">Học tiếp: {nextLesson.title}</p>
              <p className="text-xs text-muted-foreground">
                {lessonPercent(p, nextLesson.slug)}% đã xong
              </p>
            </Link>
          );
        })()}
        <Link to="/kiem-tra" className="card-pop p-4 transition-transform hover:-translate-y-1">
          <p className="text-3xl">🧭</p>
          <p className="font-display font-bold">
            {p.placement ? "Kiểm tra lại cấp độ" : "Kiểm tra đầu vào"}
          </p>
          <p className="text-xs text-muted-foreground">
            {p.placement
              ? `Lần trước: ${levels.find((l) => l.id === p.placement!.level)?.name}`
              : "15 câu · 5 phút"}
          </p>
        </Link>
      </section>

      {/* Biểu đồ tuần */}
      <section className="card-pop mt-8 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-2xl font-bold">📊 Tuần này</h2>
          <p className="text-sm font-semibold text-muted-foreground">
            {weekXp} XP · học {activeDays}/7 ngày
          </p>
        </div>
        <div className="mt-4 flex h-40 items-end gap-2">
          {week.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs font-bold text-muted-foreground">{d.xp || ""}</span>
              <div
                className={cn(
                  "w-full rounded-t-xl transition-all",
                  d.xp > 0 ? "bg-primary" : "bg-muted",
                )}
                style={{ height: `${Math.max(6, (d.xp / maxXp) * 100)}%` }}
                title={`${d.key}: ${d.xp} XP`}
              />
              <span className="text-xs font-bold">{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Theo cấp */}
      <section className="mt-8">
        <h2 className="font-display text-2xl font-bold">📚 Tiến độ theo cấp</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {levels.map((lv) => {
            const items = lessons.filter((l) => l.level === lv.id);
            const doneCount = items.filter((l) => p.lessons[l.slug]?.completedAt).length;
            return (
              <div key={lv.id} className="card-pop p-5">
                <h3 className="font-display text-xl font-bold">
                  {lv.emoji} {lv.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {doneCount}/{items.length} bài
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-success"
                    style={{ width: `${(doneCount / Math.max(items.length, 1)) * 100}%` }}
                  />
                </div>
                <ul className="mt-3 space-y-1.5">
                  {items.map((l) => {
                    const lp = p.lessons[l.slug];
                    return (
                      <li key={l.slug}>
                        <Link
                          to="/bai-hoc/$slug"
                          params={{ slug: l.slug }}
                          className="flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-sm hover:bg-muted"
                        >
                          <span className={cn(lp?.completedAt && "text-success")}>
                            {lp?.completedAt ? "✓" : "○"} {l.title}
                          </span>
                          <span className="text-xs">
                            {lp?.stars ? "⭐".repeat(lp.stars) : `${lessonPercent(p, l.slug)}%`}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Huy hiệu */}
      <section className="mt-8">
        <h2 className="font-display text-2xl font-bold">🏅 Huy hiệu</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {BADGES.map((b) => {
            const has = p.badges.includes(b.id);
            return (
              <div
                key={b.id}
                className={cn("card-pop p-4 text-center", !has && "opacity-45 grayscale")}
              >
                <p className="text-4xl">{b.emoji}</p>
                <p className="mt-1 font-display font-bold">{b.name}</p>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ba mẹ */}
      <section className="card-pop mt-8 bg-sun/20 p-5">
        <h2 className="font-display text-xl font-bold">👨‍👩‍👧 Dành cho ba mẹ</h2>
        <p className="mt-1 text-sm">
          Tuần này bé học <strong>{activeDays} ngày</strong>, đạt <strong>{weekXp} XP</strong>, hoàn
          thành <strong>{completed}</strong> bài, đang giữ chuỗi{" "}
          <strong>{p.streak.count} ngày</strong>. Mục tiêu khuyến nghị: 30 phút/ngày × 6 ngày (≈ 1
          bài mới + ôn từ mỗi ngày).
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to="/ba-me"
            className="rounded-full border-2 border-border bg-card px-4 py-1.5 text-sm font-bold"
          >
            Góc ba mẹ →
          </Link>
          {!confirm ? (
            <button
              type="button"
              onClick={() => setConfirm(true)}
              className="rounded-full px-4 py-1.5 text-sm font-bold text-destructive"
            >
              Xóa toàn bộ tiến độ
            </button>
          ) : (
            <span className="inline-flex items-center gap-2 text-sm">
              Chắc chắn chứ?
              <button
                type="button"
                onClick={() => {
                  resetProgress();
                  setConfirm(false);
                }}
                className="rounded-full bg-destructive px-3 py-1 text-xs font-bold text-destructive-foreground"
              >
                Xóa
              </button>
              <button
                type="button"
                onClick={() => setConfirm(false)}
                className="rounded-full border-2 border-border px-3 py-1 text-xs font-bold"
              >
                Hủy
              </button>
            </span>
          )}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl bg-muted/60 px-4 py-3">
      <p className="font-display text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-bold">{label}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}
