import { useState } from "react";
import type { ParagraphChunk } from "@/data/curriculum";
import { SpeakButton } from "./SpeakButton";
import { cn } from "@/lib/utils";

const roleStyle: Record<string, string> = {
  subject: "bg-sky/20 text-sky",
  verb: "bg-primary/20 text-primary",
  object: "bg-success/20 text-success",
  adverb: "bg-grape/20 text-grape",
};

const roleLabel: Record<string, string> = {
  subject: "Chủ ngữ",
  verb: "Động từ",
  object: "Tân ngữ / bổ ngữ",
  adverb: "Trạng ngữ (thời gian, nơi chốn)",
};

export function ReadingBlock({
  title,
  chunks,
  viTranslation,
}: {
  title: string;
  chunks: ParagraphChunk[][];
  viTranslation: string;
}) {
  const [showVi, setShowVi] = useState(false);
  const fullText = chunks.map((s) => s.map((c) => c.text).join(" ") + ".").join(" ");

  return (
    <div className="card-pop p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-2xl font-bold">📖 {title}</h3>
        <SpeakButton text={fullText} label="Nghe cả đoạn" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
        {Object.keys(roleLabel).map((r) => (
          <span key={r} className={cn("rounded-full px-3 py-1", roleStyle[r])}>
            {roleLabel[r]}
          </span>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {chunks.map((sentence, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/60 p-3">
            <span className="font-display text-sm text-muted-foreground">{i + 1}.</span>
            {sentence.map((c, j) => (
              <span
                key={j}
                className={cn(
                  "rounded-lg px-2 py-1 font-display text-lg font-semibold",
                  c.role ? roleStyle[c.role] : "",
                )}
              >
                {c.text}
              </span>
            ))}
            <SpeakButton
              text={sentence.map((c) => c.text).join(" ")}
              label="Nghe câu"
              className="ml-auto"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowVi((v) => !v)}
        className="mt-4 rounded-full border-2 border-border bg-card px-4 py-1.5 text-sm font-bold"
      >
        {showVi ? "Ẩn bản dịch" : "Xem bản dịch tiếng Việt"}
      </button>
      {showVi && <p className="mt-3 text-sm text-muted-foreground">{viTranslation}</p>}
    </div>
  );
}
