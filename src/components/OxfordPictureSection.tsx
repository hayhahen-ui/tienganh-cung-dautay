/**
 * OxfordPictureSection — Mục "🖼️ Từ vựng tranh Oxford theo cấp độ" trong trang Giáo trình.
 * 36 chủ đề Oxford Picture Dictionary đã phân vào Starters / Movers / Flyers.
 * Bấm chủ đề để mở danh sách từ — bấm từng từ để nghe phát âm.
 */
import { useState } from "react";
import { ChevronDown, Volume2 } from "lucide-react";
import {
  oxfordPictureTopics,
  OXFORD_LEVEL_META,
  type OxfordLevel,
  type OxfordPictureTopic,
} from "@/data/oxfordPicture";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";

const FILTERS: ("all" | OxfordLevel)[] = ["all", "starters", "movers", "flyers"];

export function OxfordPictureSection() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const topics =
    filter === "all" ? oxfordPictureTopics : oxfordPictureTopics.filter((t) => t.level === filter);
  const totalWords = topics.reduce((n, t) => n + t.vocab.length, 0);

  return (
    <section>
      <h2 className="mt-14 font-display text-3xl font-bold">🖼️ Từ vựng tranh Oxford theo cấp độ</h2>
      <p className="mt-2 text-muted-foreground">
        36 chủ đề từ <strong>Oxford Picture Dictionary</strong> đã được xếp vào đúng cấp độ Starters
        → Movers → Flyers. Bấm vào chủ đề để xem từ vựng, bấm vào từng từ để nghe phát âm.
      </p>

      {/* Lọc theo cấp */}
      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f;
          const label =
            f === "all"
              ? `Tất cả (${oxfordPictureTopics.length})`
              : `${OXFORD_LEVEL_META[f].emoji} ${OXFORD_LEVEL_META[f].name} (${oxfordPictureTopics.filter((t) => t.level === f).length})`;
          return (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFilter(f);
                setOpenId(null);
              }}
              className={cn(
                "rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              {label}
            </button>
          );
        })}
        <span className="ml-auto self-center text-xs font-bold text-muted-foreground">
          {topics.length} chủ đề · {totalWords} từ
        </span>
      </div>

      {/* Danh sách chủ đề */}
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((t) => (
          <TopicCard
            key={t.id}
            topic={t}
            open={openId === t.id}
            onToggle={() => setOpenId(openId === t.id ? null : t.id)}
          />
        ))}
      </div>
    </section>
  );
}

function TopicCard({
  topic,
  open,
  onToggle,
}: {
  topic: OxfordPictureTopic;
  open: boolean;
  onToggle: () => void;
}) {
  const meta = OXFORD_LEVEL_META[topic.level];
  return (
    <div className="card-pop flex flex-col p-4">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex items-start gap-3 text-left"
      >
        <span className="text-3xl" aria-hidden>
          {topic.emoji}
        </span>
        <span className="flex-1">
          <span className="font-display text-base font-bold leading-snug">{topic.title}</span>
          <span className="block text-sm text-muted-foreground">{topic.titleVi}</span>
          <span className="mt-1.5 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">
              {meta.emoji} {meta.name}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
              {topic.vocab.length} từ
            </span>
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t-2 border-dashed border-border pt-3">
          {topic.vocab.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => speak(w, { rate: 0.8 })}
              title={`Nghe: ${w}`}
              className="inline-flex items-center gap-1 rounded-full bg-sky/15 px-3 py-1 text-sm font-bold text-sky transition-transform hover:-translate-y-0.5 hover:bg-sky/25"
            >
              <Volume2 className="size-3" />
              {w}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
