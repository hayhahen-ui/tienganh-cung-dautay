import { createFileRoute, Link } from "@tanstack/react-router";
import { Headphones, Mic, PenLine, BookOpen } from "lucide-react";
import hero from "@/assets/hero-kids.jpg";
import { levels, lessons } from "@/data/curriculum";
import { dueCards, lessonPercent, useProgress } from "@/lib/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Owly English — Học tiếng Anh online cho bé theo chuẩn Cambridge" },
      {
        name: "description",
        content:
          "Bé học tiếng Anh qua hình ảnh, video và đoạn văn có cấu trúc ngữ pháp rõ ràng, kèm luyện nghe, nói, viết ngay trên trình duyệt.",
      },
      { property: "og:title", content: "Owly English — Học tiếng Anh vui cho bé" },
      {
        property: "og:description",
        content:
          "Lộ trình Starters → Movers → Flyers với bài học trực quan và phần thực hành 4 kỹ năng.",
      },
    ],
  }),
  component: Home,
});

const features = [
  { emoji: "⭐", title: "Sao & XP", desc: "Mỗi phần học xong có XP, quiz cuối bài lấy tới 3 sao." },
  {
    emoji: "🔥",
    title: "Chuỗi ngày",
    desc: "Học mỗi ngày để giữ lửa — huy hiệu 3 và 7 ngày liên tiếp.",
  },
  {
    emoji: "🧠",
    title: "Hộp ôn từ",
    desc: "Nhắc lại ngắt quãng: từ hay quên gặp sớm, từ nhớ tốt gặp thưa.",
  },
  { emoji: "🎮", title: "3 trò chơi/bài", desc: "Ghép hình–từ, điền chỗ trống, xếp từ thành câu." },
];

const skills = [
  {
    icon: Headphones,
    title: "Nghe",
    desc: "Nghe câu 2 lần, có chế độ nghe chậm như đề thi thật.",
    color: "bg-sky/15 text-sky",
  },
  {
    icon: Mic,
    title: "Nói",
    desc: "Bé nói vào micro, app chấm độ khớp phát âm ngay.",
    color: "bg-primary/15 text-primary",
  },
  {
    icon: BookOpen,
    title: "Đọc",
    desc: "Đoạn văn tô màu theo chủ ngữ – động từ – tân ngữ.",
    color: "bg-success/15 text-success",
  },
  {
    icon: PenLine,
    title: "Viết",
    desc: "Chính tả theo tranh, kiểm tra đúng sai từng chữ.",
    color: "bg-grape/15 text-grape",
  },
];

function Home() {
  const p = useProgress();
  const started = p.xp > 0;
  const nextLesson = lessons.find((l) => !p.lessons[l.slug]?.completedAt) ?? lessons[0]!;
  const due = dueCards(p, 99).length;
  return (
    <main className="mx-auto max-w-6xl px-4">
      <section className="grid items-center gap-8 py-10 md:grid-cols-2">
        <div>
          <span className="inline-block rounded-full bg-sun px-4 py-1.5 font-display text-sm font-bold text-sun-foreground">
            Cho bé 8–12 tuổi · Chuẩn Cambridge YLE · CEFR Pre A1 → A2
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight md:text-5xl">
            Bé học tiếng Anh mỗi ngày 30 phút, vui như chơi 🎈
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {lessons.length} bài học, mỗi bài 9 phần: từ vựng hình ảnh, video, ngữ pháp, đoạn văn
            phân tích, luyện nghe – nói – viết, 3 trò chơi và quiz lấy sao. Có XP, chuỗi ngày, huy
            hiệu và hộp ôn từ thông minh.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {started ? (
              <Link
                to="/bai-hoc/$slug"
                params={{ slug: nextLesson.slug }}
                className="rounded-full bg-primary px-6 py-3 font-display text-lg font-bold text-primary-foreground shadow-pop transition-transform hover:-translate-y-0.5"
              >
                ▶ Học tiếp: {nextLesson.emoji} {nextLesson.title} (
                {lessonPercent(p, nextLesson.slug)}%)
              </Link>
            ) : (
              <Link
                to="/kiem-tra"
                className="rounded-full bg-primary px-6 py-3 font-display text-lg font-bold text-primary-foreground shadow-pop transition-transform hover:-translate-y-0.5"
              >
                🧭 Kiểm tra đầu vào 5 phút
              </Link>
            )}
            <Link
              to="/bai-hoc"
              className="rounded-full border-2 border-border bg-card px-6 py-3 font-display text-lg font-bold"
            >
              Xem tất cả bài học
            </Link>
            {due > 0 && (
              <Link
                to="/on-tap"
                className="rounded-full border-2 border-sun bg-sun/40 px-6 py-3 font-display text-lg font-bold text-sun-foreground"
              >
                🧠 Ôn {due} từ đến hạn
              </Link>
            )}
            <Link
              to="/hoi-dap"
              className="rounded-full border-2 border-primary/40 bg-primary/10 px-6 py-3 font-display text-lg font-bold text-primary transition-transform hover:-translate-y-0.5"
            >
              💬 Hỏi cô Owly
            </Link>
          </div>
        </div>
        <img
          src={hero}
          alt="Bé vui vẻ học tiếng Anh cùng chú cú Owly"
          width={1400}
          height={900}
          className="rounded-3xl border-2 border-border shadow-soft"
        />
      </section>

      <section className="py-8">
        <h2 className="font-display text-3xl font-bold">Luyện đủ 4 kỹ năng</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((s) => (
            <div key={s.title} className="card-pop p-5">
              <span className={`inline-flex rounded-2xl p-3 ${s.color}`}>
                <s.icon className="size-6" />
              </span>
              <h3 className="mt-3 font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-8">
        <h2 className="font-display text-3xl font-bold">Học có động lực mỗi ngày</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="card-pop p-5">
              <span className="text-3xl" aria-hidden>
                {f.emoji}
              </span>
              <h3 className="mt-2 font-display text-xl font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-8">
        <h2 className="font-display text-3xl font-bold">Ba cấp độ của bé</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {levels.map((lv) => (
            <div key={lv.id} className="card-pop p-5">
              <span className="text-4xl" aria-hidden>
                {lv.emoji}
              </span>
              <h3 className="mt-2 font-display text-xl font-bold">{lv.name}</h3>
              <p className="text-sm text-muted-foreground">
                {lv.months} · {lv.words}
              </p>
              <p className="mt-2 text-sm">{lv.goal}</p>
              <p className="mt-3 rounded-xl bg-muted p-2 text-xs font-semibold">{lv.exam}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-8">
        <Link
          to="/giao-trinh"
          className="card-pop flex flex-wrap items-center justify-between gap-4 bg-sun/30 p-6 transition-transform hover:-translate-y-1"
        >
          <div>
            <h2 className="font-display text-2xl font-bold">
              📚 Giáo trình chuẩn quốc tế + tải miễn phí tài liệu Cambridge
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Family and Friends · Kid's Box · Wordlist 3 cấp · Đề thi mẫu có audio — tải PDF về
              máy, không cần đăng ký.
            </p>
          </div>
          <span className="rounded-full bg-primary px-5 py-2.5 font-display font-bold text-primary-foreground shadow-pop">
            Xem & tải ngay →
          </span>
        </Link>
      </section>

      <section className="py-8">
        <h2 className="font-display text-3xl font-bold">Bài học nổi bật</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            lessons[0]!,
            lessons.find((l) => l.level === "movers")!,
            lessons.find((l) => l.level === "flyers")!,
          ].map((l) => (
            <Link
              key={l.slug}
              to="/bai-hoc/$slug"
              params={{ slug: l.slug }}
              className="card-pop p-5 transition-transform hover:-translate-y-1"
            >
              <span className="text-4xl" aria-hidden>
                {l.emoji}
              </span>
              <h3 className="mt-2 font-display text-xl font-bold">{l.title}</h3>
              <p className="text-sm text-muted-foreground">{l.titleVi}</p>
              <p className="mt-2 text-sm">{l.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
