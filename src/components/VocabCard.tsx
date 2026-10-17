import { useState } from "react";
import type { Vocab } from "@/data/curriculum";
import { SpeakButton } from "./SpeakButton";

const colourSwatch: Record<string, string> = {
  red: "#e63946",
  blue: "#2f6fed",
  green: "#2ea44f",
  yellow: "#f5c518",
  orange: "#f2820d",
  purple: "#8b5cf6",
  pink: "#ec4899",
  brown: "#8b5e34",
  black: "#1f2937",
  white: "#ffffff",
  grey: "#9ca3af",
  gray: "#9ca3af",
};

export function VocabCard({ item }: { item: Vocab }) {
  const [flipped, setFlipped] = useState(false);
  const swatch = colourSwatch[item.word.toLowerCase()];
  return (
    <div className="card-pop flex flex-col items-center gap-2 p-4 text-center transition-transform hover:-translate-y-1">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="text-5xl"
        aria-label={`Lật thẻ ${item.word}`}
      >
        {swatch ? (
          <span
            aria-hidden
            className="block size-12 rounded-full border-2 border-border"
            style={{ backgroundColor: swatch }}
          />
        ) : (
          <span aria-hidden>{item.emoji}</span>
        )}
      </button>
      <p className="font-display text-xl font-bold">{item.word}</p>
      <p className="text-xs text-muted-foreground">{item.ipa}</p>
      {flipped ? (
        <p className="text-sm font-semibold text-accent">{item.vi}</p>
      ) : (
        <button
          type="button"
          onClick={() => setFlipped(true)}
          className="text-xs font-semibold text-muted-foreground underline"
        >
          Xem nghĩa
        </button>
      )}
      <SpeakButton text={item.word} label="Đọc" />
    </div>
  );
}
