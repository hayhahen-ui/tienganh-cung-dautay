import { createFileRoute } from "@tanstack/react-router";
import { levels, roadmap, syllabus, weekPlan, canDoStatements } from "@/data/curriculum";

export const Route = createFileRoute("/lo-trinh")({
  head: () => ({
    meta: [
      { title: "Lộ trình 24–30 tháng chinh phục Cambridge YLE | Owly English" },
      {
        name: "description",
        content:
          "Lộ trình học tiếng Anh cho bé 8 tuổi: nền móng phonics, Starters, Movers, Flyers kèm lịch học mẫu 6 buổi mỗi tuần.",
      },
      { property: "og:title", content: "Lộ trình 24–30 tháng chinh phục Cambridge YLE" },
      {
        property: "og:description",
        content: "Bốn giai đoạn học, mốc từ vựng, cấu trúc đề thi và lịch học 30 phút mỗi ngày.",
      },
    ],
  }),
  component: Roadmap,
});

function Roadmap() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-4xl font-extrabold">🗺️ Lộ trình 24–30 tháng</h1>
      <p className="mt-3 text-muted-foreground">
        Bé đi lần lượt Pre A1 Starters → A1 Movers → A2 Flyers theo khung CEFR. Không có “đỗ –
        trượt”: mỗi bài thi tối đa 5 khiên, tổng 15 khiên, chứng chỉ không có thời hạn.
      </p>

      <div className="mt-8 space-y-4">
        {roadmap.map((r, i) => (
          <div key={r.phase} className="card-pop flex flex-wrap items-start gap-4 p-5">
            <span className="text-4xl" aria-hidden>
              {r.emoji}
            </span>
            <div className="min-w-56 flex-1">
              <h2 className="font-display text-2xl font-bold">
                {i + 1}. {r.phase}
              </h2>
              <p className="text-sm text-muted-foreground">{r.time}</p>
              <p className="mt-2">{r.focus}</p>
              {"books" in r && r.books && (
                <p className="mt-2 text-sm font-semibold text-primary">📚 {r.books}</p>
              )}
            </div>
            <p className="rounded-xl bg-success/15 p-3 text-sm font-semibold text-success">
              🎯 {r.output}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 font-display text-3xl font-bold">📋 Cấu trúc đề thi từng cấp</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {levels.map((lv) => (
          <div key={lv.id} className="card-pop p-5">
            <h3 className="font-display text-xl font-bold">
              {lv.emoji} {lv.name}
            </h3>
            <p className="mt-1 text-xs font-bold text-primary">CEFR {lv.cefr}</p>
            <p className="mt-2 text-sm">{lv.exam}</p>
            <p className="mt-1 text-sm text-muted-foreground">{lv.totalItems}</p>
            <p className="mt-2 text-sm text-muted-foreground">Vốn từ cộng dồn: {lv.words}</p>
            <p className="mt-2 rounded-lg bg-muted/60 p-2 text-xs">{lv.canDo}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-xl bg-sun/40 p-4 text-sm font-semibold">
        ⚠️ Phần Listening luôn được nghe 2 lần. Phần Reading &amp; Writing bắt buộc viết đúng chính
        tả mới được tính điểm — đây là lỗi mất điểm phổ biến nhất.
      </p>

      <h2 className="mt-12 font-display text-3xl font-bold">
        📘 Giáo trình chuẩn quốc tế theo cấp
      </h2>
      <p className="mt-2 text-muted-foreground">
        Các bài học trong app được xây bám theo bộ giáo trình quốc tế phổ biến nhất cho lứa 8–12
        tuổi.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {syllabus.map((s) => {
          const lv = levels.find((l) => l.id === s.level)!;
          return (
            <div key={s.level} className="card-pop p-5">
              <h3 className="font-display text-xl font-bold">
                {lv.emoji} {lv.name}
              </h3>
              <p className="mt-2 text-sm font-semibold">{s.book}</p>
              <p className="mt-2 text-sm text-muted-foreground">Chủ đề: {s.units}</p>
              <p className="mt-2 text-xs font-bold text-primary">🏁 Luyện đề: {s.exam}</p>
            </div>
          );
        })}
      </div>

      <h2 className="mt-12 font-display text-3xl font-bold">⏱️ Lịch học mẫu trong tuần</h2>
      <p className="mt-2 text-muted-foreground">
        30 phút/ngày × 6 ngày tốt hơn nhiều so với 3 giờ dồn vào cuối tuần.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {weekPlan.map((d) => (
          <div key={d.day} className="card-pop p-4">
            <p className="font-display text-lg font-bold">{d.day}</p>
            <p className="text-sm">{d.act}</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">{d.skill}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 font-display text-3xl font-bold">🎯 Bé có thể làm gì sau mỗi cấp?</h2>
      <p className="mt-2 text-muted-foreground">
        Năng lực đạt được theo khung CEFR, trích từ Handbook for Teachers 2024 của Cambridge.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {canDoStatements.map((cd, i) => {
          const lv = levels.find((l) => l.name === cd.level);
          return (
            <div key={i} className="card-pop p-5">
              <h3 className="font-display text-lg font-bold">
                {lv?.emoji} {cd.level} — {cd.skill}
              </h3>
              <ul className="mt-3 space-y-1.5">
                {cd.statements.map((s, j) => (
                  <li key={j} className="flex gap-2 text-sm">
                    <span className="text-success">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </main>
  );
}
