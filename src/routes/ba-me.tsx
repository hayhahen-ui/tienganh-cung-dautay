import { createFileRoute, Link } from "@tanstack/react-router";
import { parentRules, resourceLinks, youtubeChannels } from "@/data/curriculum";

export const Route = createFileRoute("/ba-me")({
  head: () => ({
    meta: [
      { title: "Góc ba mẹ — Đồng hành cùng bé học tiếng Anh | Owly English" },
      {
        name: "description",
        content:
          "Nguyên tắc dạy con, học liệu Cambridge miễn phí, kênh YouTube luyện nghe và checklist 30 ngày đầu cho ba mẹ.",
      },
      { property: "og:title", content: "Góc ba mẹ — Đồng hành cùng bé học tiếng Anh" },
      {
        property: "og:description",
        content: "9 nguyên tắc, học liệu chính thống và checklist khởi động 30 ngày.",
      },
    ],
  }),
  component: Parents,
});

const checklist = [
  "Tải YLE Wordlist và Handbook bản PDF của Cambridge",
  "Chọn một bộ giáo trình chính và học xuyên suốt",
  "Tạo tài khoản British Council LearnEnglish Kids và Oxford Owl",
  "Cài 1 app từ vựng + 1 app phát âm",
  "Làm 1 đề Starters mẫu để biết điểm xuất phát",
  "Cố định khung giờ học 30 phút mỗi ngày",
  "Chuẩn bị hộp flashcard và bảng sticker khen thưởng",
  "Quay video nói đầu tiên làm mốc so sánh",
];

function Parents() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-4xl font-extrabold">👨‍👩‍👧 Góc ba mẹ</h1>
      <p className="mt-3 text-muted-foreground">
        Ba mẹ không cần giỏi tiếng Anh — chỉ cần đồng hành đều đặn cùng bé.
      </p>

      <h2 className="mt-10 font-display text-3xl font-bold">9 nguyên tắc vàng</h2>
      <ol className="mt-4 grid gap-3 sm:grid-cols-2">
        {parentRules.map((r, i) => (
          <li key={r} className="card-pop flex gap-3 p-4">
            <span className="font-display text-xl font-bold text-primary">{i + 1}</span>
            <span className="text-sm">{r}</span>
          </li>
        ))}
      </ol>

      <h2 className="mt-12 font-display text-3xl font-bold">📚 Học liệu gợi ý</h2>
      <Link
        to="/giao-trinh"
        className="card-pop mt-4 flex items-center justify-between gap-3 bg-sun/30 p-4 transition-transform hover:-translate-y-0.5"
      >
        <span className="text-sm font-semibold">
          📦 Xem đầy đủ giáo trình chuẩn quốc tế + link tải miễn phí wordlist, đề thi mẫu và
          handbook của Cambridge tại trang <strong>Giáo trình</strong>.
        </span>
        <span className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
          Mở →
        </span>
      </Link>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {resourceLinks.map((r) => (
          <a
            key={r.name}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card-pop block p-4 transition-transform hover:-translate-y-1"
          >
            <p className="font-display text-lg font-bold">🔗 {r.name}</p>
            <p className="text-sm text-muted-foreground">{r.use}</p>
            <span className="mt-2 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
              {r.fee}
            </span>
          </a>
        ))}
      </div>

      <h2 className="mt-12 font-display text-3xl font-bold">▶️ Kênh YouTube luyện nghe</h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
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

      <h2 className="mt-12 font-display text-3xl font-bold">✅ Checklist 30 ngày đầu</h2>
      <ul className="mt-4 space-y-2">
        {checklist.map((c) => (
          <li key={c} className="card-pop flex items-center gap-3 p-3 text-sm">
            <span className="text-lg" aria-hidden>
              ☑️
            </span>
            {c}
          </li>
        ))}
      </ul>

      <p className="mt-10 rounded-xl bg-destructive/10 p-4 text-sm font-semibold">
        🚫 Năm sai lầm phổ biến: chỉ luyện đề mà bỏ tắm ngôn ngữ; bỏ phonics; học từ rời rạc; bỏ bê
        chính tả; ép bé thi khi mới thuộc 60–70% wordlist.
      </p>
    </main>
  );
}
