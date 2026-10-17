import { useMemo, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { shuffle } from "@/lib/random";
import { speak } from "@/lib/speech";
import { SpeakButton } from "../SpeakButton";
import { cn } from "@/lib/utils";

type Item = { sentence: string; vi: string };

function tokens(s: string) {
  return s.trim().split(/\s+/);
}

/**
 * Sắp xếp từ thành câu đúng: bé chạm các thẻ từ theo thứ tự.
 * Luyện trật tự từ (word order) — kỹ năng Reading & Writing Part 4–6.
 */
export function SentenceScramble({
  items,
  onComplete,
}: {
  items: Item[];
  onComplete?: (correctCount: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [result, setResult] = useState<"ok" | "no" | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = items[idx];
  const words = useMemo(() => (current ? tokens(current.sentence) : []), [current]);
  const bank = useMemo(
    () => shuffle(words.map((w, i) => ({ w, i }))),
    // đổi câu mới thì xáo lại
    [words],
  );

  if (!current) return null;

  const built = picked.map((i) => words[i]).join(" ");
  const check = () => {
    const ok = built === current.sentence;
    setResult(ok ? "ok" : "no");
    if (ok) {
      speak(current.sentence);
      setCorrect((c) => c + 1);
    }
  };
  const next = () => {
    if (idx + 1 >= items.length) {
      setFinished(true);
      onComplete?.(correct);
      return;
    }
    setIdx((i) => i + 1);
    setPicked([]);
    setResult(null);
  };
  const restart = () => {
    setIdx(0);
    setPicked([]);
    setResult(null);
    setCorrect(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="card-pop animate-pop p-5 text-center">
        <p className="font-display text-2xl font-bold">
          🧱 Xếp câu: {correct}/{items.length} câu đúng ngay lần đầu
        </p>
        <button
          type="button"
          onClick={restart}
          className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-4 py-1.5 text-sm font-bold"
        >
          <RotateCcw className="size-4" /> Làm lại
        </button>
      </div>
    );
  }

  return (
    <div className="card-pop p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-xl font-bold">🧱 Xếp từ thành câu</h3>
        <span className="text-sm font-semibold text-muted-foreground">
          Câu {idx + 1}/{items.length}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">Nghĩa: {current.vi}</p>

      <div
        className={cn(
          "mt-3 flex min-h-14 flex-wrap items-center gap-2 rounded-xl border-2 border-dashed p-3",
          result === "ok" && "border-success bg-success/10",
          result === "no" && "border-destructive bg-destructive/10",
          !result && "border-border bg-muted/40",
        )}
        aria-live="polite"
      >
        {picked.length === 0 && (
          <span className="text-sm text-muted-foreground">
            Chạm vào các từ bên dưới để xếp câu…
          </span>
        )}
        {picked.map((i, pos) => (
          <button
            key={`${i}-${pos}`}
            type="button"
            disabled={result === "ok"}
            onClick={() => {
              setPicked((p) => p.filter((_, k) => k !== pos));
              setResult(null);
            }}
            className="rounded-lg bg-primary px-3 py-1.5 font-display text-lg font-bold text-primary-foreground"
          >
            {words[i]}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {bank.map(({ w, i }) => {
          const used = picked.includes(i);
          return (
            <button
              key={i}
              type="button"
              disabled={used || result === "ok"}
              onClick={() => {
                setPicked((p) => [...p, i]);
                setResult(null);
              }}
              className={cn(
                "rounded-lg border-2 px-3 py-1.5 font-display text-lg font-bold transition-all",
                used
                  ? "border-border bg-muted text-muted-foreground opacity-40"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              {w}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {result !== "ok" ? (
          <button
            type="button"
            disabled={picked.length !== words.length}
            onClick={check}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 font-display font-bold text-primary-foreground shadow-pop disabled:opacity-50"
          >
            <Check className="size-4" /> Kiểm tra
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="animate-pop inline-flex items-center gap-2 rounded-full bg-success px-5 py-2 font-display font-bold text-success-foreground shadow-pop"
          >
            {idx + 1 >= items.length ? "Hoàn thành 🎉" : "Câu tiếp theo →"}
          </button>
        )}
        <SpeakButton text={current.sentence} label="Nghe gợi ý" slow />
        {result === "no" && (
          <span className="inline-flex items-center gap-1 text-sm font-bold text-destructive">
            <X className="size-4" /> Chưa đúng, thử lại nhé!
          </span>
        )}
      </div>
    </div>
  );
}
