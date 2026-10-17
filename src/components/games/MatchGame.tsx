import { useMemo, useState } from "react";
import type { Vocab } from "@/data/curriculum";
import { shuffle } from "@/lib/random";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";

/**
 * Trò chơi ghép từ – hình: bé chạm 1 hình rồi chạm từ tương ứng.
 * Ghép đúng → thẻ sáng xanh + đọc từ; ghép sai → rung đỏ.
 */
export function MatchGame({
  vocab,
  onComplete,
}: {
  vocab: Vocab[];
  onComplete?: (mistakes: number) => void;
}) {
  const [round, setRound] = useState(0);
  const items = useMemo(() => shuffle(vocab).slice(0, 6), [vocab, round]);
  const left = useMemo(() => shuffle(items), [items]);
  const right = useMemo(() => shuffle(items), [items]);

  const [pickedEmoji, setPickedEmoji] = useState<string | null>(null);
  const [pickedWord, setPickedWord] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const done = matched.size === items.length && items.length > 0;

  const tryMatch = (emojiWord: string | null, word: string | null) => {
    if (!emojiWord || !word) return;
    if (emojiWord === word) {
      const next = new Set(matched);
      next.add(word);
      setMatched(next);
      speak(word);
      setPickedEmoji(null);
      setPickedWord(null);
      if (next.size === items.length) onComplete?.(mistakes);
    } else {
      setWrong(word);
      setMistakes((m) => m + 1);
      setTimeout(() => {
        setWrong(null);
        setPickedEmoji(null);
        setPickedWord(null);
      }, 500);
    }
  };

  const reset = () => {
    setRound((r) => r + 1);
    setMatched(new Set());
    setMistakes(0);
    setPickedEmoji(null);
    setPickedWord(null);
  };

  return (
    <div className="card-pop p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-xl font-bold">🧩 Ghép hình với từ</h3>
        <span className="text-sm font-semibold text-muted-foreground">
          {matched.size}/{items.length} cặp · sai {mistakes}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="grid grid-cols-2 gap-2">
          {left.map((v) => {
            const ok = matched.has(v.word);
            return (
              <button
                key={v.word}
                type="button"
                disabled={ok}
                aria-label={`Hình ${v.vi}`}
                onClick={() => {
                  setPickedEmoji(v.word);
                  tryMatch(v.word, pickedWord);
                }}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-2xl border-2 text-4xl transition-all",
                  ok && "border-success bg-success/15 opacity-60",
                  !ok && pickedEmoji === v.word && "border-primary bg-primary/15 scale-105",
                  !ok && pickedEmoji !== v.word && "border-border bg-card hover:bg-muted",
                )}
              >
                {v.emoji}
              </button>
            );
          })}
        </div>
        <div className="grid gap-2">
          {right.map((v) => {
            const ok = matched.has(v.word);
            return (
              <button
                key={v.word}
                type="button"
                disabled={ok}
                onClick={() => {
                  setPickedWord(v.word);
                  tryMatch(pickedEmoji, v.word);
                }}
                className={cn(
                  "rounded-2xl border-2 px-3 py-2 font-display text-lg font-bold transition-all",
                  ok && "border-success bg-success text-success-foreground",
                  !ok && wrong === v.word && "animate-wiggle border-destructive bg-destructive/15",
                  !ok &&
                    wrong !== v.word &&
                    pickedWord === v.word &&
                    "border-primary bg-primary/15",
                  !ok &&
                    wrong !== v.word &&
                    pickedWord !== v.word &&
                    "border-border bg-card hover:bg-muted",
                )}
              >
                {v.word}
              </button>
            );
          })}
        </div>
      </div>
      {done && (
        <div className="animate-pop mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-success/15 p-3">
          <p className="font-display text-lg font-bold text-success">
            🎉 Tuyệt vời! Bé ghép đúng hết rồi{mistakes === 0 ? " — không sai lần nào!" : "."}
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border-2 border-border bg-card px-4 py-1.5 text-sm font-bold"
          >
            Chơi lại
          </button>
        </div>
      )}
    </div>
  );
}
