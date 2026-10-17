import { useMemo, useState } from "react";
import { Volume2 } from "lucide-react";
import type { Lesson } from "@/data/curriculum";
import { sample, shuffleSeeded } from "@/lib/random";
import { speak } from "@/lib/speech";
import { starsFromScore } from "@/lib/progress";
import { buildBlankQuestions } from "./FillBlank";
import { cn } from "@/lib/utils";

export type QuizQuestion = {
  kind: "vi-en" | "en-vi" | "emoji" | "listen" | "blank";
  prompt: string;
  say?: string;
  big?: string;
  options: string[];
  answer: string;
  explain: string;
};

/** Sinh ~10 câu quiz ổn định (seed theo slug) từ dữ liệu bài học. */
export function buildQuiz(lesson: Lesson, count = 10, seed = lesson.slug): QuizQuestion[] {
  const qs: QuizQuestion[] = [];
  const vocab = lesson.vocab;
  const others = (w: string) =>
    sample(
      vocab.map((v) => v.word),
      2,
      (x) => x === w,
    );
  const othersVi = (w: string) =>
    sample(
      vocab.map((v) => v.vi),
      2,
      (x) => x === w,
    );

  const vs = shuffleSeeded(vocab, seed);
  vs.slice(0, 3).forEach((v) => {
    qs.push({
      kind: "vi-en",
      prompt: `"${v.vi}" tiếng Anh là gì?`,
      options: shuffleSeeded([v.word, ...others(v.word)], seed + v.word),
      answer: v.word,
      explain: `${v.word} ${v.ipa} = ${v.vi}`,
    });
  });
  vs.slice(3, 5).forEach((v) => {
    qs.push({
      kind: "emoji",
      prompt: "Hình này là từ nào?",
      big: v.emoji,
      options: shuffleSeeded([v.word, ...others(v.word)], seed + "e" + v.word),
      answer: v.word,
      explain: `${v.emoji} = ${v.word} (${v.vi})`,
    });
  });
  vs.slice(5, 7).forEach((v) => {
    qs.push({
      kind: "en-vi",
      prompt: `"${v.word}" nghĩa là gì?`,
      options: shuffleSeeded([v.vi, ...othersVi(v.vi)], seed + "v" + v.word),
      answer: v.vi,
      explain: `${v.word} ${v.ipa} = ${v.vi}`,
    });
  });
  shuffleSeeded(lesson.listen, seed)
    .slice(0, 2)
    .forEach((l) => {
      qs.push({
        kind: "listen",
        prompt: l.prompt,
        say: l.say,
        options: shuffleSeeded(l.options, seed + l.say),
        answer: l.answer,
        explain: `Câu nghe: "${l.say}"`,
      });
    });
  buildBlankQuestions(lesson, 2).forEach((b) => {
    qs.push({
      kind: "blank",
      prompt: `${b.before} ____${b.after}`,
      options: b.options,
      answer: b.answer,
      explain: b.full,
    });
  });
  return shuffleSeeded(qs, seed + "all").slice(0, count);
}

export function LessonQuiz({
  lesson,
  onFinish,
}: {
  lesson: Lesson;
  onFinish: (score: number) => void;
}) {
  const [attempt, setAttempt] = useState(0);
  const questions = useMemo(() => buildQuiz(lesson, 10, lesson.slug + attempt), [lesson, attempt]);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[idx];
  const total = questions.length;
  const score = Math.round((correct / Math.max(total, 1)) * 100);

  const choose = (opt: string) => {
    if (chosen || !q) return;
    setChosen(opt);
    if (opt === q.answer) setCorrect((c) => c + 1);
  };
  const next = () => {
    if (idx + 1 >= total) {
      setDone(true);
      onFinish(score);
      return;
    }
    setIdx((i) => i + 1);
    setChosen(null);
  };
  const restart = () => {
    setAttempt((a) => a + 1);
    setIdx(0);
    setChosen(null);
    setCorrect(0);
    setDone(false);
  };

  if (done) {
    const stars = starsFromScore(score);
    return (
      <div className="card-pop animate-pop p-6 text-center">
        <p className="text-5xl" aria-label={`${stars} sao`}>
          {"⭐".repeat(stars)}
          {"☆".repeat(3 - stars)}
        </p>
        <p className="mt-2 font-display text-3xl font-extrabold">{score}%</p>
        <p className="mt-1 text-muted-foreground">
          Bé trả lời đúng {correct}/{total} câu.{" "}
          {score === 100
            ? "Xuất sắc! 💯"
            : score >= 70
              ? "Giỏi lắm! Ôn lại vài từ là đạt 3 sao."
              : "Xem lại từ vựng rồi thử lần nữa nhé 💪"}
        </p>
        <button
          type="button"
          onClick={restart}
          className="mt-4 rounded-full border-2 border-border bg-card px-5 py-2 font-display font-bold"
        >
          Làm lại đề mới
        </button>
      </div>
    );
  }
  if (!q) return null;

  return (
    <div className="card-pop p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-xl font-bold">🏁 Quiz cuối bài</h3>
        <span className="text-sm font-semibold text-muted-foreground">
          Câu {idx + 1}/{total} · ✅ {correct}
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${(idx / total) * 100}%` }}
        />
      </div>

      <div className="mt-5 text-center">
        {q.big && (
          <p className="text-6xl" aria-hidden>
            {q.big}
          </p>
        )}
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
      </div>

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
                !chosen && "border-border bg-card hover:-translate-y-0.5 hover:bg-muted",
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
        <div className="animate-pop mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted p-3">
          <p className="text-sm">
            {chosen === q.answer ? "✅ Đúng rồi! " : "❌ Chưa đúng. "}
            <span className="text-muted-foreground">{q.explain}</span>
          </p>
          <button
            type="button"
            onClick={next}
            className="rounded-full bg-primary px-5 py-2 font-display font-bold text-primary-foreground shadow-pop"
          >
            {idx + 1 >= total ? "Xem kết quả" : "Tiếp →"}
          </button>
        </div>
      )}
    </div>
  );
}
