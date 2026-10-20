/**
 * OxfordBookSection — Mục "📖 Từ điển tranh Oxford (bản gốc Anh–Việt)" trong trang Giáo trình.
 * Dữ liệu trích từ chính cuốn The Oxford Picture Dictionary (Anh–Việt) mà gia đình cung cấp
 * (src/data/oxfordBook.ts): 12 units, mỗi chủ đề ghi rõ số trang sách để mở sách giấy đối chiếu.
 * Mỗi chủ đề được PHÂN CẤP Starters/Movers/Flyers theo wordlist Cambridge YLE + neo từ
 * 36 chủ đề Oxford thiếu nhi của app, và có ẢNH CHỤP THẬT minh hoạ từ Wikimedia Commons
 * (ghi nguồn + giấy phép dưới từng ảnh; không dùng ảnh vẽ/AI).
 * Bấm chủ đề để mở danh sách cặp từ Anh–Việt; bấm vào từ tiếng Anh để nghe phát âm.
 * Ô tra cứu tìm trên toàn bộ từ điển (không cần gõ dấu tiếng Việt).
 */
import { useMemo, useState } from "react";
import { ChevronDown, Search, Volume2 } from "lucide-react";
import {
  oxfordBookTopics,
  OXFORD_BOOK_SOURCE,
  type OxfordBookLevel,
  type OxfordBookTopic,
} from "@/data/oxfordBook";
import { OXFORD_LEVEL_META } from "@/data/oxfordPicture";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";

/** Bỏ dấu + thường hoá để tìm kiếm không cần gõ dấu. */
function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

type FlatEntry = {
  en: string;
  vi: string;
  topicEn: string;
  topicVi: string;
  pages: string;
  level: OxfordBookLevel;
  enFold: string;
  viFold: string;
};

const pagesOf = (t: OxfordBookTopic) =>
  t.bookPages[0] === t.bookPages[1] ? `${t.bookPages[0]}` : `${t.bookPages[0]}–${t.bookPages[1]}`;

const FLAT: FlatEntry[] = oxfordBookTopics.flatMap((t) =>
  t.entries.map((e) => ({
    en: e.en,
    vi: e.vi,
    topicEn: t.topicEn,
    topicVi: t.topicVi,
    pages: pagesOf(t),
    level: t.level,
    enFold: fold(e.en),
    viFold: fold(e.vi),
  })),
);

const UNITS = Array.from({ length: 12 }, (_, i) => i + 1).map((n) => {
  const first = oxfordBookTopics.find((t) => t.unit === n);
  const count = oxfordBookTopics.filter((t) => t.unit === n).length;
  return { n, en: first?.unitEn ?? "", vi: first?.unitVi ?? "", count };
});

const LEVELS: OxfordBookLevel[] = ["starters", "movers", "flyers"];
const LEVEL_BADGE: Record<OxfordBookLevel, string> = {
  starters: "bg-success/15 text-success",
  movers: "bg-sky/15 text-sky",
  flyers: "bg-grape/15 text-grape",
};
const TOTAL_WORDS = FLAT.length;

export function OxfordBookSection() {
  const [unit, setUnit] = useState<number | "all">("all");
  const [level, setLevel] = useState<OxfordBookLevel | "all">("all");
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const q = fold(query.trim());
  const searching = q.length >= 2;
  const results = useMemo(() => {
    if (!searching) return [];
    return FLAT.filter((e) => e.enFold.includes(q) || e.viFold.includes(q)).slice(0, 60);
  }, [q, searching]);

  const topics = oxfordBookTopics.filter(
    (t) => (unit === "all" || t.unit === unit) && (level === "all" || t.level === level),
  );

  return (
    <section>
      <h2 className="mt-14 font-display text-3xl font-bold">
        📖 Từ điển tranh Oxford — bản gốc Anh–Việt
      </h2>
      <p className="mt-2 text-muted-foreground">
        Toàn bộ từ vựng của cuốn <strong>{OXFORD_BOOK_SOURCE}</strong> đã được đưa vào app:{" "}
        <strong>
          {TOTAL_WORDS.toLocaleString("vi-VN")} cặp từ Anh–Việt · {oxfordBookTopics.length} chủ đề ·
          12 units
        </strong>
        . Mỗi chủ đề đã được <strong>phân cấp 🌱 Starters · 🌿 Movers · 🌳 Flyers</strong> theo
        wordlist Cambridge YLE để ba mẹ chọn đúng tầm của bé, ghi số trang để mở sách giấy đối
        chiếu, và minh hoạ bằng <strong>ảnh chụp thật</strong> (Wikimedia Commons, ghi nguồn dưới
        ảnh). Bấm vào từ tiếng Anh để nghe phát âm. Cô Owly ở mục "Hỏi cô Owly" cũng tra cứu từ
        chính nguồn này.
      </p>

      {/* Ô tra cứu nhanh */}
      <div className="relative mt-4 max-w-xl">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tra từ trong từ điển Oxford… (vd: crosswalk, giặt, bệnh viện)"
          className="w-full rounded-full border-2 border-border bg-card py-2.5 pl-11 pr-4 text-sm font-semibold shadow-pop outline-none transition-colors placeholder:font-normal focus:border-primary"
          aria-label="Tra từ trong từ điển Oxford"
        />
      </div>

      {searching ? (
        <div className="mt-4">
          <p className="text-xs font-bold text-muted-foreground">
            {results.length > 0
              ? `Tìm thấy ${results.length}${results.length === 60 ? "+" : ""} mục cho “${query.trim()}”:`
              : `Không thấy mục nào cho “${query.trim()}” trong phần đã số hoá — thử từ ngắn hơn, hoặc hỏi cô Owly nhé.`}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {results.map((r, i) => (
              <button
                key={`${r.en}-${i}`}
                type="button"
                onClick={() => speak(r.en, { rate: 0.8 })}
                title={`${r.topicEn} — sách Oxford trang ${r.pages}. Bấm để nghe.`}
                className="inline-flex items-center gap-1.5 rounded-full bg-sky/15 px-3 py-1 text-sm transition-transform hover:-translate-y-0.5 hover:bg-sky/25"
              >
                <Volume2 className="size-3 shrink-0" />
                <span className="font-bold">{r.en}</span>
                <span className="text-muted-foreground">= {r.vi}</span>
                <span className="rounded-full bg-card px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                  {OXFORD_LEVEL_META[r.level].emoji} {r.topicVi} · tr.{r.pages}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Lọc theo cấp độ YLE */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Cấp độ:
            </span>
            <button
              type="button"
              onClick={() => {
                setLevel("all");
                setOpenSlug(null);
              }}
              className={cn(
                "rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-colors",
                level === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              Tất cả cấp ({oxfordBookTopics.length})
            </button>
            {LEVELS.map((lv) => (
              <button
                key={lv}
                type="button"
                onClick={() => {
                  setLevel(lv);
                  setOpenSlug(null);
                }}
                className={cn(
                  "rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-colors",
                  level === lv
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-muted",
                )}
              >
                {OXFORD_LEVEL_META[lv].emoji} {OXFORD_LEVEL_META[lv].name} (
                {oxfordBookTopics.filter((t) => t.level === lv).length})
              </button>
            ))}
          </div>

          {/* Lọc theo unit */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Unit:
            </span>
            <button
              type="button"
              onClick={() => {
                setUnit("all");
                setOpenSlug(null);
              }}
              className={cn(
                "rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-colors",
                unit === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              Tất cả ({oxfordBookTopics.length})
            </button>
            {UNITS.map((u) => (
              <button
                key={u.n}
                type="button"
                onClick={() => {
                  setUnit(u.n);
                  setOpenSlug(null);
                }}
                className={cn(
                  "rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-colors",
                  unit === u.n
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-muted",
                )}
              >
                {u.n}. {u.en} ({u.count})
              </button>
            ))}
          </div>

          {/* Danh sách chủ đề theo unit */}
          {topics.length === 0 && (
            <p className="mt-6 text-sm font-semibold text-muted-foreground">
              Không có chủ đề nào khớp cả hai bộ lọc — thử bỏ bớt một bộ lọc nhé.
            </p>
          )}
          {UNITS.filter((u) => unit === "all" || unit === u.n).map((u) => {
            const unitTopics = topics.filter((t) => t.unit === u.n);
            if (unitTopics.length === 0) return null;
            return (
              <div key={u.n} className="mt-6">
                <h3 className="font-display text-xl font-bold">
                  Unit {u.n}: {u.en}{" "}
                  <span className="text-base font-semibold text-muted-foreground">({u.vi})</span>
                </h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {unitTopics.map((t) => (
                    <BookTopicCard
                      key={t.slug}
                      topic={t}
                      open={openSlug === t.slug}
                      onToggle={() => setOpenSlug(openSlug === t.slug ? null : t.slug)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          <p className="mt-4 text-xs text-muted-foreground">
            ℹ️ Cách phân cấp: đối chiếu từng từ với wordlist Cambridge YLE chính thức + thừa hưởng
            cấp từ 36 chủ đề Oxford thiếu nhi của app, chủ đề người lớn/trừu tượng xếp 🌳 Flyers.
            Một số chủ đề là trang bản đồ/tranh toàn cảnh (chữ in đè lên tranh) nên chưa số hoá
            được — ba mẹ xem trực tiếp trong sách giấy. Ảnh minh hoạ là ảnh chụp thật từ Wikimedia
            Commons (giấy phép mở, ghi nguồn ở từng ảnh) — không dùng ảnh vẽ hay ảnh AI.
          </p>
        </>
      )}
    </section>
  );
}

function BookTopicCard({
  topic,
  open,
  onToggle,
}: {
  topic: OxfordBookTopic;
  open: boolean;
  onToggle: () => void;
}) {
  const meta = OXFORD_LEVEL_META[topic.level];
  return (
    <div className="card-pop flex flex-col overflow-hidden p-0">
      {topic.image && (
        <figure className="relative">
          <img
            src={topic.image.src}
            alt={`Ảnh thật minh hoạ chủ đề ${topic.topicEn}`}
            loading="lazy"
            className="h-36 w-full object-cover"
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white">
            📷 {topic.image.credit}
            {topic.image.license ? ` · ${topic.image.license}` : ""} ·{" "}
            <a
              href={topic.image.page}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              onClick={(e) => e.stopPropagation()}
            >
              Wikimedia Commons
            </a>
          </figcaption>
        </figure>
      )}
      <div className="flex flex-1 flex-col p-4">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex items-start gap-3 text-left"
        >
          <span className="flex-1">
            <span className="font-display text-base font-bold leading-snug">{topic.topicEn}</span>
            <span className="block text-sm text-muted-foreground">{topic.topicVi}</span>
            <span className="mt-1.5 flex flex-wrap gap-1.5">
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-bold",
                  LEVEL_BADGE[topic.level],
                )}
              >
                {meta.emoji} {meta.name}
              </span>
              <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">
                📖 Sách tr.{pagesOf(topic)}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                {topic.entries.length} từ
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
          <ul className="mt-3 space-y-1 border-t-2 border-dashed border-border pt-3">
            {topic.entries.map((e) => (
              <li key={e.en} className="flex items-baseline gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => speak(e.en, { rate: 0.8 })}
                  title={`Nghe: ${e.en}`}
                  className="inline-flex shrink-0 items-center gap-1 font-bold text-sky hover:underline"
                >
                  <Volume2 className="size-3" />
                  {e.en}
                </button>
                <span className="text-muted-foreground">= {e.vi}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
