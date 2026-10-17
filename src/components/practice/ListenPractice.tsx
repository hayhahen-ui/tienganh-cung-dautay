import { useState } from "react";
import { Check, X } from "lucide-react";
import type { ListenQuestion } from "@/data/curriculum";
import { SpeakButton } from "../SpeakButton";
import { cn } from "@/lib/utils";
import { shuffleSeeded } from "@/lib/random";

export function ListenPractice({
  questions,
  onAllDone,
}: {
  questions: ListenQuestion[];
  onAllDone?: (correct: number, total: number) => void;
}) {
  const [picked, setPicked] = useState<Record<number, string>>({});
  const pick = (i: number, opt: string) => {
    setPicked((prev) => {
      if (prev[i]) return prev; // chỉ tính lần chọn đầu
      const next = { ...prev, [i]: opt };
      if (Object.keys(next).length === questions.length) {
        const correct = questions.filter((q, k) => next[k] === q.answer).length;
        queueMicrotask(() => onAllDone?.(correct, questions.length));
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {questions.map((q, i) => {
        const chosen = picked[i];
        return (
          <div key={q.say} className="card-pop p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-display text-lg font-bold">
                {i + 1}. {q.prompt}
              </span>
              <SpeakButton text={q.say} label="Nghe lần 1" />
              <SpeakButton text={q.say} label="Nghe chậm" slow />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {shuffleSeeded(q.options, q.say).map((opt) => {
                const isChosen = chosen === opt;
                const correct = opt === q.answer;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => pick(i, opt)}
                    disabled={Boolean(chosen)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border-2 border-border px-4 py-2 font-semibold transition-colors",
                      !chosen && "bg-card hover:bg-muted",
                      chosen && correct && "bg-success text-success-foreground",
                      isChosen && !correct && "bg-destructive text-destructive-foreground",
                      chosen && !isChosen && !correct && "bg-card opacity-60",
                    )}
                  >
                    {opt}
                    {chosen && correct && <Check className="size-4" />}
                    {isChosen && !correct && <X className="size-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
