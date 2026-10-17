import { createFileRoute } from "@tanstack/react-router";
import { Download, ExternalLink } from "lucide-react";
import {
  cambridgeDownloads,
  coursebooks,
  examBooks,
  gradedReaders,
  levels,
  practicePlatforms,
  syllabus,
  youtubeChannels,
} from "@/data/curriculum";

export const Route = createFileRoute("/giao-trinh")({
  head: () => ({
    meta: [
      { title: "Giáo trình chuẩn quốc tế + tài liệu Cambridge tải miễn phí | Owly English" },
      {
        name: "description",
        content:
          "Giáo trình Family and Friends, Kid's Box bám chuẩn Cambridge YLE kèm link tải wordlist, đề thi mẫu và handbook chính thức miễn phí.",
      },
      { property: "og:title", content: "Giáo trình chuẩn quốc tế cho bé — Owly English" },
      {
        property: "og:description",
        content:
          "Chọn 1 giáo trình chính học xuyên suốt Starters → Movers → Flyers, tải miễn phí wordlist và đề mẫu Cambridge.",
      },
    ],
  }),
  component: Curriculum,
});

const levelBadge: Record<string, string> = {
  "Tất cả cấp": "bg-primary/15 text-primary",
  Starters: "bg-success/15 text-success",
  Movers: "bg-sky/15 text-sky",
  Flyers: "bg-grape/15 text-grape",
};

function Curriculum() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl font-extrabold">📚 Giáo trình chuẩn quốc tế</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        Nguyên tắc vàng: <strong>chọn 1 bộ giáo trình chính và học xuyên suốt</strong>, luyện thi
        bằng sách chuyên biệt ở 4–6 tháng cuối mỗi cấp. Toàn bộ tài liệu Cambridge bên dưới là bản
        chính thức, tải miễn phí về máy.
      </p>

      {/* ── 1. Tải miễn phí từ Cambridge ─────────────────────────────── */}
      <h2 className="mt-12 font-display text-3xl font-bold">
        ⬇️ Tải miễn phí từ Cambridge (bản chính thức)
      </h2>
      <p className="mt-2 text-muted-foreground">
        Nguồn: cambridgeenglish.org — đã kiểm tra link còn hoạt động. PDF tải thẳng về máy, không
        cần đăng ký.
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {cambridgeDownloads.map((d) => (
          <div key={d.name} className="card-pop flex flex-col gap-2 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${levelBadge[d.level]}`}>
                {d.level}
              </span>
              <span className="rounded-full bg-muted px-3 py-0.5 text-xs font-bold">{d.type}</span>
            </div>
            <p className="font-display text-lg font-bold leading-snug">{d.name}</p>
            <p className="text-sm text-muted-foreground">{d.desc}</p>
            <a
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-pop transition-transform hover:-translate-y-0.5"
            >
              <Download className="size-4" />
              {d.type === "Trang web" ? "Mở trang tải" : "Tải về máy"}
            </a>
          </div>
        ))}
      </div>

      {/* ── 2. Giáo trình chính theo cấp ──────────────────────────────── */}
      <h2 className="mt-14 font-display text-3xl font-bold">🎯 Giáo trình chính theo từng cấp</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
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

      {/* ── 3. Bộ giáo trình chuẩn quốc tế ────────────────────────────── */}
      <h2 className="mt-14 font-display text-3xl font-bold">📘 Các bộ giáo trình chuẩn quốc tế</h2>
      <p className="mt-2 text-muted-foreground">
        Chỉ cần <strong>một</strong> bộ chính. Link dẫn tới trang chính thức của nhà xuất bản (xem
        mẫu unit, tải audio kèm sách, tìm nơi mua bản quyền).
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coursebooks.map((b) => (
          <div key={b.name} className="card-pop flex flex-col gap-2 p-5">
            {b.tag && (
              <span className="w-fit rounded-full bg-sun px-3 py-0.5 text-xs font-bold text-sun-foreground">
                {b.tag}
              </span>
            )}
            <p className="font-display text-lg font-bold leading-snug">{b.name}</p>
            <p className="text-xs font-bold text-muted-foreground">
              {b.publisher} · {b.levels}
            </p>
            <p className="text-sm">{b.fit}</p>
            <p className="text-sm text-muted-foreground">💡 {b.note}</p>
            <a
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex w-fit items-center gap-2 rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-bold transition-transform hover:-translate-y-0.5"
            >
              <ExternalLink className="size-4" /> Trang NXB
            </a>
          </div>
        ))}
      </div>

      {/* ── 4. Sách luyện thi ─────────────────────────────────────────── */}
      <h2 className="mt-14 font-display text-3xl font-bold">📝 Sách luyện thi chuyên biệt</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {examBooks.map((b) => (
          <a
            key={b.name}
            href={b.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card-pop block p-4 transition-transform hover:-translate-y-1"
          >
            <p className="font-display text-lg font-bold">🔗 {b.name}</p>
            <p className="text-sm text-muted-foreground">{b.when}</p>
          </a>
        ))}
      </div>

      {/* ── 5. Truyện đọc phân cấp ────────────────────────────────────── */}
      <h2 className="mt-14 font-display text-3xl font-bold">📖 Truyện đọc phân cấp</h2>
      <p className="mt-2 text-muted-foreground">
        Quy tắc 5 ngón tay: mở một trang bất kỳ, bé không biết quá 5 từ → sách quá khó, hạ một cấp.
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {gradedReaders.map((r) => (
          <a
            key={r.name}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card-pop block p-4 transition-transform hover:-translate-y-1"
          >
            <p className="font-display text-lg font-bold">🔗 {r.name}</p>
            <p className="text-xs font-bold text-primary">{r.level}</p>
            <p className="mt-1 text-sm text-muted-foreground">{r.note}</p>
          </a>
        ))}
      </div>

      {/* ── 6. App/web luyện 4 kỹ năng ────────────────────────────────── */}
      <h2 className="mt-14 font-display text-3xl font-bold">💻 App & web luyện 4 kỹ năng</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {practicePlatforms.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card-pop block p-4 transition-transform hover:-translate-y-1"
          >
            <p className="font-display text-base font-bold">{p.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{p.skill}</p>
            <span className="mt-2 inline-block rounded-full bg-secondary px-3 py-0.5 text-xs font-bold text-secondary-foreground">
              {p.fee}
            </span>
          </a>
        ))}
      </div>

      {/* ── 7. Kênh YouTube luyện nghe ────────────────────────────────── */}
      <h2 className="mt-14 font-display text-3xl font-bold">▶️ Kênh YouTube luyện nghe</h2>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {youtubeChannels.map((c) => (
          <li key={c.name}>
            <a
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl bg-muted p-3 text-sm font-semibold hover:bg-muted/70"
            >
              ▶️ {c.name}
              <span className="block text-xs font-normal text-muted-foreground">{c.note}</span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-12 rounded-xl bg-success/15 p-4 text-sm font-semibold text-success">
        ✅ Cách dùng cùng app: bé học bài trong mục "Bài học" (mỗi bài đã ghi rõ bám giáo trình nào)
        → ba mẹ in Wordlist Picture Book tương ứng để ôn từ → cuối mỗi cấp làm đề mẫu Cambridge tải
        ở mục 1.
      </p>
    </main>
  );
}
