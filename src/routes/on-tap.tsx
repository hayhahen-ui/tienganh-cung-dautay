import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { lessons, type Vocab } from "@/data/curriculum";
import { SpeakButton } from "@/components/SpeakButton";
import { Celebrate } from "@/components/Celebrate";
import { dueCards, reviewCard, useProgress, XP } from "@/lib/progress";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/on-tap")({
  head: () => ({
    meta: [
      { title: "Ôn tập từ vựng theo lịch nhắc lại ngắt quãng | Owly English" },
      {
        name: "description",
        content:
          "Flashcard ôn từ vựng đã học theo thuật toán nhắc lại ngắt quãng (spaced repetition) — nhớ lâu, ôn ít.",
      },
    ],
  }),
  component: ReviewPage,
});

const vocabIndex: Record<string, Vocab & { lessonSlug: string; lessonTitle: string }> = {};
for (const l of lessons)
  for (const v of l.vocab) vocabIndex[v.word] = { ...v, lessonSlug: l.slug, lessonTitle: l.title };

function ReviewPage() {
  const progress = useProgress();
  const total = Object.keys(progress.srs).length;
  const [sessionSeed, setSessionSeed] = useState(0);
  const queue = useMemo(() => dueCards(progress, 20).map((c) => c.word), [sessionSeed]); // eslint-disable-line react-hooks/exhaustive-deps
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [celebrate, setCelebrate] = useState(0);

  const word = queue[pos];
  const card = word ? vocabIndex[word] : undefined;
  const dueNow = dueCards(progress, 999).length;

  const grade = (g: 0 | 1 | 2 | 3) => {
    if (!word) return;
    reviewCard(word, g);
    setReviewed((r) => r + 1);
    setFlipped(false);
    if (pos + 1 >= queue.length) {
      setCelebrate((c) => c + 1);
      setPos(queue.length);
    } else setPos((p) => p + 1);
  };

  const restart = () => {
    setSessionSeed((s) => s + 1);
    setPos(0);
    setReviewed(0);
    setFlipped(false);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Celebrate trigger={celebrate} />
      <h1 className="font-display text-4xl font-extrabold">🧠 Ôn tập từ vựng</h1>
      <p className="mt-3 text-muted-foreground">
        Thẻ nào bé nhớ tốt sẽ lâu gặp lại; thẻ hay quên sẽ xuất hiện sớm hơn. Mỗi thẻ +
        {XP.reviewCard} XP.
      </p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
        <span className="rounded-full bg-muted px-3 py-1">📦 {total} từ trong hộp</span>
        <span className="rounded-full bg-sun/50 px-3 py-1">⏰ {dueNow} từ đến hạn</span>
        <span className="rounded-full bg-success/15 px-3 py-1 text-success">
          ✓ {reviewed} đã ôn hôm nay
        </span>
      </div>

      {total === 0 ? (
        <div className="card-pop mt-8 p-6 text-center">
          <p className="text-5xl">📭</p>
          <p className="mt-3 font-display text-xl font-bold">Hộp ôn tập còn trống</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Vào một bài học, bấm “Tớ đã học xong từ vựng” — các từ sẽ tự chạy vào đây.
          </p>
          <Link
            to="/bai-hoc"
            className="mt-4 inline-block rounded-full bg-primary px-5 py-2 font-display font-bold text-primary-foreground shadow-pop"
          >
            Đi học thôi →
          </Link>
        </div>
      ) : !card ? (
        <div className="card-pop animate-pop mt-8 p-6 text-center">
          <p className="text-5xl">🎉</p>
          <p className="mt-3 font-display text-xl font-bold">
            {reviewed > 0
              ? `Tuyệt! Bé đã ôn xong ${reviewed} thẻ.`
              : "Hôm nay không có thẻ nào đến hạn."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {dueNow > 0
              ? `Còn ${dueNow} thẻ cần ôn lại ngay.`
              : "Quay lại vào ngày mai nhé, hoặc học bài mới!"}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {dueNow > 0 && (
              <button
                type="button"
                onClick={restart}
                className="rounded-full bg-primary px-5 py-2 font-display font-bold text-primary-foreground shadow-pop"
              >
                Ôn tiếp →
              </button>
            )}
            <Link
              to="/bai-hoc"
              className="rounded-full border-2 border-border bg-card px-5 py-2 font-display font-bold"
            >
              Học bài mới
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <p className="text-center text-sm font-semibold text-muted-foreground">
            Thẻ {pos + 1}/{queue.length} · từ bài {card.lessonTitle}
          </p>
          <button
            type="button"
            onClick={() => {
              setFlipped((f) => !f);
              if (!flipped) speak(card.word);
            }}
            className={cn(
              "card-pop mt-3 flex min-h-64 w-full flex-col items-center justify-center gap-3 p-8 text-center transition-transform active:scale-[0.98]",
              flipped && "bg-secondary",
            )}
            aria-label="Lật thẻ"
          >
            <span className="text-7xl" aria-hidden>
              {card.emoji}
            </span>
            {flipped ? (
              <>
                <span className="font-display text-3xl font-extrabold">{card.word}</span>
                <span className="text-sm text-muted-foreground">{card.ipa}</span>
                <span className="font-semibold text-accent">{card.vi}</span>
              </>
            ) : (
              <span className="text-sm font-bold text-muted-foreground">
                Từ này tiếng Anh là gì? Chạm để lật
              </span>
            )}
          </button>

          {flipped ? (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => grade(0)}
                className="rounded-2xl border-2 border-destructive bg-destructive/10 px-3 py-3 font-display font-bold text-destructive"
              >
                😵 Quên
                <span className="block text-xs font-normal">ôn lại ngay</span>
              </button>
              <button
                type="button"
                onClick={() => grade(1)}
                className="rounded-2xl border-2 border-sun bg-sun/30 px-3 py-3 font-display font-bold text-sun-foreground"
              >
                🤔 Khó
                <span className="block text-xs font-normal">gặp lại sớm</span>
              </button>
              <button
                type="button"
                onClick={() => grade(2)}
                className="rounded-2xl border-2 border-sky bg-sky/15 px-3 py-3 font-display font-bold text-sky"
              >
                🙂 Nhớ
                <span className="block text-xs font-normal">vài ngày nữa</span>
              </button>
              <button
                type="button"
                onClick={() => grade(3)}
                className="rounded-2xl border-2 border-success bg-success/15 px-3 py-3 font-display font-bold text-success"
              >
                😎 Dễ
                <span className="block text-xs font-normal">lâu mới gặp</span>
              </button>
            </div>
          ) : (
            <div className="mt-4 flex justify-center gap-2">
              <SpeakButton text={card.word} label="Nghe gợi ý" />
              <button
                type="button"
                onClick={() => setFlipped(true)}
                className="rounded-full bg-primary px-5 py-2 font-display font-bold text-primary-foreground shadow-pop"
              >
                Lật thẻ
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
