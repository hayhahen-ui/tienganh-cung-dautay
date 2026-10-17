import { useState } from "react";
import { Check, Eye, X } from "lucide-react";
import type { WriteQuestion } from "@/data/curriculum";
import { normalize } from "@/lib/speech";
import { SpeakButton } from "../SpeakButton";
import { cn } from "@/lib/utils";

export function WritePractice({
  questions,
  onAllDone,
}: {
  questions: WriteQuestion[];
  onAllDone?: () => void;
}) {
  const [values, setValues] = useState<Record<number, string>>({});
  const [shown, setShown] = useState<Record<number, boolean>>({});
  const [fired, setFired] = useState(false);
  const allOk = questions.every((q, i) => normalize(values[i] ?? "") === normalize(q.answer));
  if (allOk && !fired && questions.length > 0) {
    setFired(true);
    onAllDone?.();
  }

  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-sun/40 p-3 text-sm font-semibold">
        ✍️ Ở cả 3 cấp Cambridge, viết sai chính tả = 0 điểm. Bé hãy viết thật cẩn thận nhé!
      </p>
      {allOk && (
        <p className="animate-pop rounded-xl bg-success/15 p-3 font-display font-bold text-success">
          🎉 Bé viết đúng chính tả tất cả các từ!
        </p>
      )}
      {questions.map((q, i) => {
        const val = values[i] ?? "";
        const ok = val.length > 0 && normalize(val) === normalize(q.answer);
        const wrong = val.length > 0 && !ok;
        return (
          <div key={q.answer} className="card-pop flex flex-wrap items-center gap-3 p-4">
            <span className="text-4xl" aria-hidden>
              {q.emoji}
            </span>
            <span className="font-semibold">{q.hint}</span>
            <input
              value={val}
              onChange={(e) => setValues((v) => ({ ...v, [i]: e.target.value }))}
              placeholder="Viết từ tiếng Anh…"
              aria-label={q.hint}
              className={cn(
                "min-w-40 flex-1 rounded-xl border-2 bg-card px-3 py-2 font-display text-lg outline-none",
                ok ? "border-success" : wrong ? "border-destructive" : "border-border",
              )}
            />
            {ok && <Check className="size-6 text-success" />}
            {wrong && <X className="size-6 text-destructive" />}
            <SpeakButton text={q.answer} label="Nghe từ" />
            <button
              type="button"
              onClick={() => setShown((s) => ({ ...s, [i]: !s[i] }))}
              className="inline-flex items-center gap-1 rounded-full border-2 border-border px-3 py-1.5 text-sm font-bold"
            >
              <Eye className="size-4" /> {shown[i] ? q.answer : "Gợi ý"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
