import { useMemo, useState } from "react";
import type { Lesson } from "@/data/curriculum";
import { sample, shuffleSeeded } from "@/lib/random";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";

export type BlankQuestion = {
  before: string;
  after: string;
  answer: string;
  options: string[];
  full: string;
  vi: string;
};

const SKIP = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "am",
  "was",
  "were",
  "to",
  "of",
  "in",
  "on",
  "at",
  "and",
  "my",
  "your",
  "his",
  "her",
  "our",
  "their",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "this",
  "these",
  "that",
  "those",
  "there",
  "have",
  "has",
  "got",
  "do",
  "does",
  "did",
  "not",
  "very",
  "for",
  "with",
]);

function clean(w: string) {
  return w.replace(/[^a-zA-Z'-]/g, "").toLowerCase();
}

/**
 * Sinh câu điền chỗ trống từ ví dụ ngữ pháp + đoạn đọc của bài.
 * Ưu tiên khoét từ vựng của bài; đáp án nhiễu lấy từ từ vựng khác cùng bài.
 */
export function buildBlankQuestions(lesson: Lesson, max = 6): BlankQuestion[] {
  const vocabWords = lesson.vocab.map((v) => v.word.toLowerCase());
  const pool: { en: string; vi: string }[] = [
    ...lesson.grammar.examples,
    ...lesson.reading.chunks.map((s) => ({
      en: s.map((c) => c.text).join(" ") + ".",
      vi: "",
    })),
  ];
  const out: BlankQuestion[] = [];
  for (const ex of pool) {
    const words = ex.en.split(" ");
    // tìm từ thuộc vocab
    let idx = words.findIndex((w) => vocabWords.includes(clean(w)));
    if (idx < 0) {
      // từ dài nhất không nằm trong danh sách bỏ qua, không viết hoa (tránh tên riêng)
      let best = -1;
      let bestLen = 0;
      words.forEach((w, i) => {
        const c = clean(w);
        if (c.length > bestLen && !SKIP.has(c) && !(i > 0 && /^[A-Z]/.test(w))) {
          best = i;
          bestLen = c.length;
        }
      });
      idx = best;
    }
    if (idx < 0) continue;
    const raw = words[idx]!;
    const answer = raw.replace(/[^a-zA-Z'-]/g, "");
    if (answer.length < 2) continue;
    const trailing = raw.slice(raw.indexOf(answer) + answer.length);
    const distractors = sample(
      lesson.vocab.map((v) => v.word),
      2,
      (w) => w.toLowerCase() === answer.toLowerCase(),
    );
    while (distractors.length < 2) distractors.push(answer.split("").reverse().join(""));
    out.push({
      before: words.slice(0, idx).join(" "),
      after: trailing + (idx + 1 < words.length ? " " + words.slice(idx + 1).join(" ") : ""),
      answer,
      options: shuffleSeeded([answer, ...distractors], ex.en),
      full: ex.en,
      vi: ex.vi,
    });
    if (out.length >= max) break;
  }
  return out;
}

export function FillBlank({
  lesson,
  onComplete,
}: {
  lesson: Lesson;
  onComplete?: (correct: number, total: number) => void;
}) {
  const questions = useMemo(() => buildBlankQuestions(lesson), [lesson]);
  const [picked, setPicked] = useState<Record<number, string>>({});
  const answered = Object.keys(picked).length;
  const correct = questions.filter((q, i) => picked[i] === q.answer).length;
  const [reported, setReported] = useState(false);

  if (answered === questions.length && questions.length > 0 && !reported) {
    setReported(true);
    onComplete?.(correct, questions.length);
  }

  return (
    <div className="card-pop p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-xl font-bold">✏️ Điền từ vào chỗ trống</h3>
        <span className="text-sm font-semibold text-muted-foreground">
          {correct}/{questions.length} đúng
        </span>
      </div>
      <div className="mt-4 space-y-4">
        {questions.map((q, i) => {
          const chosen = picked[i];
          return (
            <div key={q.full} className="rounded-xl bg-muted/60 p-3">
              <p className="font-display text-lg font-semibold">
                {i + 1}. {q.before}{" "}
                <span
                  className={cn(
                    "inline-block min-w-16 rounded-lg border-b-4 px-2 text-center",
                    !chosen && "border-primary text-primary",
                    chosen === q.answer && "border-success bg-success/15 text-success",
                    chosen &&
                      chosen !== q.answer &&
                      "border-destructive bg-destructive/15 text-destructive",
                  )}
                >
                  {chosen ?? "____"}
                </span>
                {q.after}
              </p>
              {q.vi && <p className="text-xs text-muted-foreground">{q.vi}</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    disabled={Boolean(chosen)}
                    onClick={() => {
                      setPicked((p) => ({ ...p, [i]: opt }));
                      if (opt === q.answer) speak(q.full);
                    }}
                    className={cn(
                      "rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-colors",
                      !chosen && "border-border bg-card hover:bg-muted",
                      chosen &&
                        opt === q.answer &&
                        "border-success bg-success text-success-foreground",
                      chosen === opt &&
                        opt !== q.answer &&
                        "border-destructive bg-destructive text-destructive-foreground",
                      chosen &&
                        chosen !== opt &&
                        opt !== q.answer &&
                        "border-border bg-card opacity-50",
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
