import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Volume2 } from "lucide-react";
import { lessons, levels, type Lesson } from "@/data/curriculum";
import { buildQuiz, type QuizQuestion } from "@/components/games/LessonQuiz";
import { Celebrate } from "@/components/Celebrate";
import { savePlacement, useProgress } from "@/lib/progress";
import { shuffleSeeded } from "@/lib/random";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/kiem-tra")({
  head: () => ({
    meta: [
      { title: "Kiểm tra đầu vào — bé đang ở cấp Starters, Movers hay Flyers? | Owly English" },
      {
        name: "description",
        content: "15 câu hỏi nhanh để xếp cấp độ Cambridge YLE phù hợp và gợi ý bài học bắt đầu.",
      },
    ],
  }),
  component: PlacementPage,
});

type Q = QuizQuestion & { level: Lesson["level"] };

function buildPlacement(seed: string): Q[] {
  const out: Q[] = [];
  for (const lv of ["starters", "movers", "flyers"] as const) {
    const pool = shuffleSeeded(
      lessons.filter((l) => l.level === lv),
      seed + lv,
    );
    let i = 0;
    while (out.filter((q) => q.level === lv).length < 5 && pool.length) {
      const lesson = pool[i % pool.length]!;
      const qs = buildQuiz(lesson, 10, seed + lesson.slug + i).filter(
        (q) => q.kind !== "listen" || true,
      );
      const pick = qs[i % qs.length];
      if (pick && !out.some((q) => q.prompt === pick.prompt)) out.push({ ...pick, level: lv });
      i++;
      if (i > 60) break;
    }
  }
  return out; // thứ tự dễ → khó
}

function PlacementPage() {
  const progress = useProgress();
  const [seed, setSeed] = useState(() => String(Date.now()));
  const questions = useMemo(() => buildPlacement(seed), [seed]);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState<Record<Lesson["level"], number>>({
    starters: 0,
    movers: 0,
    flyers: 0,
  });
  const [done, setDone] = useState(false);
  const [celebrate, setCelebrate] = useState(0);
  const [started, setStarted] = useState(false);

  const q = questions[idx];
  const total = questions.length;

  const choose = (opt: string) => {
    if (!q || chosen) return;
    setChosen(opt);
    if (opt === q.answer) setScore((s) => ({ ...s, [q.level]: s[q.level] + 1 }));
  };

  const finish = (final: typeof score) => {
    const totalScore = final.starters + final.movers + final.flyers;
    let level: Lesson["level"] = "starters";
    if (final.starters >= 4 && final.movers >= 3) level = "movers";
    if (final.starters >= 4 && final.movers >= 4 && final.flyers >= 3) level = "flyers";
    savePlacement({ level, score: totalScore, total, date: new Date().toISOString() });
    setDone(true);
    setCelebrate((c) => c + 1);
  };

  const next = () => {
    if (idx + 1 >= total) return finish(score);
    setIdx((i) => i + 1);
    setChosen(null);
  };

  const restart = () => {
    setSeed(String(Date.now()));
    setIdx(0);
    setChosen(null);
    setScore({ starters: 0, movers: 0, flyers: 0 });
    setDone(false);
    setStarted(true);
  };

  const result = progress.placement;
  const resultLevel = result ? levels.find((l) => l.id === result.level) : undefined;
  const firstLesson = result ? lessons.find((l) => l.level === result.level) : undefined;

  if (!started && !done) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-4xl font-extrabold">🧭 Kiểm tra đầu vào</h1>
        <p className="mt-3 text-muted-foreground">
          15 câu (5 câu mỗi cấp, từ dễ đến khó) · khoảng 5 phút · không giới hạn thời gian. Bé cứ
          làm thoải mái, sai cũng không sao — đây chỉ là để chọn điểm bắt đầu phù hợp.
        </p>
        {result && resultLevel && (
          <div className="card-pop mt-6 p-5">
            <p className="font-display text-lg font-bold">
              Kết quả lần trước: {resultLevel.emoji} {resultLevel.name} ({result.score}/
              {result.total} câu)
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(result.date).toLocaleDateString("vi-VN")}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={restart}
          className="mt-6 rounded-full bg-primary px-6 py-3 font-display text-lg font-bold text-primary-foreground shadow-pop"
        >
          {result ? "Làm lại bài kiểm tra" : "Bắt đầu kiểm tra"}
        </button>
      </main>
    );
  }

  if (done && result && resultLevel) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Celebrate trigger={celebrate} />
        <div className="card-pop animate-pop p-8 text-center">
          <p className="text-6xl">{resultLevel.emoji}</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold">
            Bé nên bắt đầu từ cấp {resultLevel.name}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Đúng {result.score}/{result.total} câu · Starters {score.starters}/5 · Movers{" "}
            {score.movers}/5 · Flyers {score.flyers}/5
          </p>
          <p className="mt-3 text-sm">{resultLevel.goal}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {firstLesson && (
              <Link
                to="/bai-hoc/$slug"
                params={{ slug: firstLesson.slug }}
                className="rounded-full bg-primary px-6 py-3 font-display font-bold text-primary-foreground shadow-pop"
              >
                Học bài đầu tiên: {firstLesson.emoji} {firstLesson.title} →
              </Link>
            )}
            <button
              type="button"
              onClick={restart}
              className="rounded-full border-2 border-border bg-card px-6 py-3 font-display font-bold"
            >
              Làm lại
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!q) return null;
  const lv = levels.find((l) => l.id === q.level);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold">🧭 Kiểm tra đầu vào</h1>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold">
          Câu {idx + 1}/{total} · {lv?.emoji} {lv?.name}
        </span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${(idx / total) * 100}%` }}
        />
      </div>

      <div className="card-pop mt-6 p-6 text-center">
        {q.big && <p className="text-6xl">{q.big}</p>}
        <p className="mt-2 font-display text-xl font-bold">{q.prompt}</p>
        {q.say && (
          <button
            type="button"
            onClick={() => speak(q.say!)}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 font-bold text-secondary-foreground"
          >
            <Volume2 className="size-4" /> Bấm để nghe
          </button>
        )}
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {q.options.map((opt) => {
            const isAns = opt === q.answer;
            const isPick = chosen === opt;
            return (
              <button
                key={opt}
                type="button"
                disabled={Boolean(chosen)}
                onClick={() => choose(opt)}
                className={cn(
                  "rounded-2xl border-2 px-4 py-3 font-display text-lg font-bold transition-all",
                  !chosen && "border-border bg-card hover:bg-muted",
                  chosen && isAns && "border-success bg-success text-success-foreground",
                  chosen &&
                    isPick &&
                    !isAns &&
                    "border-destructive bg-destructive text-destructive-foreground",
                  chosen && !isPick && !isAns && "border-border bg-card opacity-50",
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {chosen && (
          <button
            type="button"
            onClick={next}
            className="animate-pop mt-5 rounded-full bg-primary px-6 py-2 font-display font-bold text-primary-foreground shadow-pop"
          >
            {idx + 1 >= total ? "Xem kết quả" : "Câu tiếp →"}
          </button>
        )}
      </div>
    </main>
  );
}
