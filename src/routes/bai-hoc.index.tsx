import { createFileRoute, Link } from "@tanstack/react-router";
import { levels, lessons } from "@/data/curriculum";
import { lessonPercent, useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bai-hoc/")({
  head: () => ({
    meta: [
      { title: "Thư viện bài học tiếng Anh cho bé | Owly English" },
      {
        name: "description",
        content:
          "Danh sách bài học theo cấp Starters, Movers, Flyers: từ vựng có hình, video, ngữ pháp và bài tập nghe nói viết.",
      },
      { property: "og:title", content: "Thư viện bài học tiếng Anh cho bé" },
      {
        property: "og:description",
        content: "Chọn bài học theo cấp độ và luyện đủ 4 kỹ năng cùng chú cú Owly.",
      },
    ],
  }),
  component: LessonList,
});

function LessonList() {
  const p = useProgress();
  const recommended = p.placement?.level;
  const completed = lessons.filter((l) => p.lessons[l.slug]?.completedAt).length;
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl font-extrabold">📚 Thư viện bài học</h1>
      <p className="mt-3 text-muted-foreground">
        {lessons.length} bài · mỗi bài 9 phần: từ vựng → video → ngữ pháp → đọc → nghe → nói → viết
        → trò chơi → quiz. Bé đã hoàn thành {completed}/{lessons.length} bài.
      </p>
      {!recommended && (
        <Link
          to="/kiem-tra"
          className="card-pop mt-5 flex flex-wrap items-center justify-between gap-3 bg-sun/30 p-4 transition-transform hover:-translate-y-0.5"
        >
          <span className="text-sm font-semibold">
            🧭 Chưa biết bắt đầu từ đâu? Làm bài kiểm tra đầu vào 5 phút để Owly gợi ý cấp độ phù
            hợp.
          </span>
          <span className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            Kiểm tra →
          </span>
        </Link>
      )}

      {levels.map((lv) => {
        const items = lessons.filter((l) => l.level === lv.id);
        if (!items.length) return null;
        return (
          <section key={lv.id} className="mt-10">
            <h2 className="font-display text-2xl font-bold">
              {lv.emoji} {lv.name}
              <span className="ml-2 text-sm font-semibold text-muted-foreground">
                CEFR {lv.cefr} · {items.length} bài
              </span>
              {recommended === lv.id && (
                <span className="ml-2 rounded-full bg-success/15 px-3 py-0.5 text-xs font-bold text-success">
                  ✓ Cấp đề xuất cho bé
                </span>
              )}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((l) => {
                const lp = p.lessons[l.slug];
                const pct = lessonPercent(p, l.slug);
                return (
                  <Link
                    key={l.slug}
                    to="/bai-hoc/$slug"
                    params={{ slug: l.slug }}
                    className={cn(
                      "card-pop relative p-5 transition-transform hover:-translate-y-1",
                      lp?.completedAt && "border-success",
                    )}
                  >
                    {lp?.stars ? (
                      <span
                        className="absolute right-3 top-3 text-sm"
                        aria-label={`${lp.stars} sao`}
                      >
                        {"⭐".repeat(lp.stars)}
                      </span>
                    ) : null}
                    <span className="text-4xl" aria-hidden>
                      {l.emoji}
                    </span>
                    <h3 className="mt-2 font-display text-xl font-bold">
                      Bài {l.order}. {l.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{l.titleVi}</p>
                    <p className="mt-2 text-sm">{l.summary}</p>
                    <p className="mt-3 text-xs font-bold text-primary">
                      {l.vocab.length} từ mới · 🎧 {l.listen.length} · 🗣️ {l.speak.length} · ✍️{" "}
                      {l.write.length}
                    </p>
                    {pct > 0 && (
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-success" style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
