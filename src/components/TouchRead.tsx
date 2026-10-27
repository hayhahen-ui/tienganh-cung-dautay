/**
 * TouchRead.tsx — Công cụ "Đọc chạm" cho bé.
 *
 * Cơ chế theo video mẫu Book&Audio/EWA mà ba mẹ gửi 27/10/2026:
 *  - Mỗi câu gồm 2 dòng: tiếng Việt nhỏ mờ ở trên, tiếng Anh đậm ở dưới.
 *  - Giọng đọc chạy liên tục, từ đang đọc tô nền XANH LÁ chạy theo nhịp
 *    giọng (karaoke); văn bản tự cuộn tới từ đang đọc.
 *  - Tranh/cảnh minh họa đổi theo nội dung câu (mỗi câu có `scene`).
 *  - Bé chạm vào bất kỳ từ nào → giọng đọc nhảy ngay tới đó và đọc tiếp;
 *    chạm lại vào từ đang đọc → dừng.
 * Chế độ "🔤 Chạm từ": chạm 1 từ → chỉ đọc riêng từ đó + hiện thẻ nghĩa
 * tiếng Việt (tra từ điển YLE của app, nếu có).
 *
 * Kỹ thuật: đọc liền mạch = 1 utterance duy nhất từ từ được chạm đến hết
 * bài (ngữ điệu tự nhiên) + sự kiện boundary để tô sáng đúng từ đang đọc
 * (giống SpeakWords). Chế độ đọc liền mạch dùng giọng máy của thiết bị
 * (cần boundary); chạm từ dùng giọng đã chọn trong cài đặt (có thể là
 * giọng AI).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Square, Volume2 } from "lucide-react";
import { speak, stopSpeaking } from "@/lib/speech";
import { yleDictionary } from "@/data/dictionary";
import { cn } from "@/lib/utils";

export type TouchLine = {
  /** Câu tiếng Anh (bắt buộc). */
  en: string;
  /** Nghĩa tiếng Việt của câu (tùy chọn — đoạn dán tay không có). */
  vi?: string;
  /** Cảnh minh họa của câu, vd "🛏️ Thức dậy". Hiện khi đổi cảnh. */
  scene?: string;
};

type WordInfo = { word: string; start: number; end: number; line: number; global: number };

function splitWords(text: string, base: number, line: number, globalOffset: number): WordInfo[] {
  const out: WordInfo[] = [];
  const re = /[A-Za-z]+(?:'[A-Za-z]+)?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    out.push({
      word: m[0],
      start: base + m.index,
      end: base + m.index + m[0].length,
      line,
      global: globalOffset + out.length,
    });
  }
  return out;
}

function lookup(word: string) {
  const w = word.toLowerCase();
  const exact = yleDictionary.find((d) => d.en.toLowerCase() === w);
  if (exact) return exact;
  for (const cut of ["es", "s"]) {
    if (w.endsWith(cut)) {
      const s = yleDictionary.find((d) => d.en.toLowerCase() === w.slice(0, -cut.length));
      if (s) return s;
    }
  }
  return undefined;
}

type Mode = "from-here" | "word";

export function TouchRead({ lines, title }: { lines: TouchLine[]; title?: string }) {
  const [mode, setMode] = useState<Mode>("from-here");
  const [current, setCurrent] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const playIdRef = useRef(0);
  const wordRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Văn bản đọc = các câu tiếng Anh nối nhau bằng 1 khoảng trắng; mỗi từ
  // giữ vị trí ký tự trong văn bản đó để map boundary -> từ.
  const { spoken, words, lineWords } = useMemo(() => {
    const words: WordInfo[] = [];
    const lineWords: WordInfo[][] = [];
    let spoken = "";
    lines.forEach((l, li) => {
      if (li > 0) spoken += " ";
      const base = spoken.length;
      spoken += l.en;
      const ws = splitWords(l.en, base, li, words.length);
      lineWords.push(ws);
      words.push(...ws);
    });
    return { spoken, words, lineWords };
  }, [lines]);

  // Đổi bài đọc -> reset trạng thái phát.
  useEffect(() => {
    playIdRef.current += 1;
    stopSpeaking();
    setPlaying(false);
    setCurrent(null);
    setSelected(null);
  }, [lines]);

  useEffect(() => () => stopSpeaking(), []);

  const stop = () => {
    playIdRef.current += 1;
    stopSpeaking();
    setPlaying(false);
    setCurrent(null);
  };

  /** Đọc liền mạch từ từ thứ `from` đến hết bài, tô sáng từng từ. */
  const readFrom = (from: number) => {
    if (from < 0 || from >= words.length) return;
    const playId = ++playIdRef.current;
    stopSpeaking();
    const slice = spoken.slice(words[from]!.start);
    const base = words[from]!.start;
    setPlaying(true);
    setCurrent(from);
    setSelected(null);
    speak(slice, {
      onBoundary: (charIndex) => {
        if (playIdRef.current !== playId) return;
        const global = base + charIndex;
        let lo = from;
        let hi = words.length - 1;
        let found = from;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          if (words[mid]!.start <= global) {
            found = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }
        setCurrent(found);
        wordRefs.current[found]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      },
      onEnd: () => {
        if (playIdRef.current !== playId) return;
        setPlaying(false);
        setCurrent(null);
      },
    });
  };

  const onWordTap = (idx: number) => {
    if (mode === "word") {
      stopSpeaking();
      playIdRef.current += 1;
      setPlaying(false);
      setCurrent(null);
      setSelected(idx);
      speak(words[idx]!.word);
      return;
    }
    // Chế độ "Đọc từ đây": chạm vào từ đang đọc thì dừng, chạm từ khác thì nhảy tới đó.
    if (playing && current === idx) {
      stop();
      return;
    }
    readFrom(idx);
  };

  const meaning = selected !== null ? lookup(words[selected]!.word) : undefined;

  return (
    <div>
      {title && <h3 className="font-display text-xl font-bold">{title}</h3>}

      {/* Chế độ + nút điều khiển */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="flex rounded-full border-2 border-border">
          {(
            [
              { id: "from-here", label: "▶ Đọc từ đây" },
              { id: "word", label: "🔤 Chạm từ" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id);
                stop();
                setSelected(null);
              }}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-bold transition-colors",
                mode === m.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => readFrom(0)}
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-1.5 text-sm font-bold text-secondary-foreground"
        >
          <Play className="size-4" /> Đọc cả bài
        </button>
        <button
          type="button"
          onClick={stop}
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-card px-4 py-1.5 text-sm font-bold"
        >
          {playing ? <Pause className="size-4" /> : <Square className="size-4" />} Dừng
        </button>
        <span className="text-sm font-semibold text-muted-foreground">
          {playing && current !== null
            ? `Đang đọc từ ${current + 1}/${words.length}`
            : `${words.length} từ — chạm vào 1 từ để ${
                mode === "word" ? "nghe riêng từ đó" : "đọc từ đó trở đi"
              }`}
        </span>
      </div>

      {/* Bài đọc song ngữ từng câu */}
      <div
        className="mt-4 rounded-3xl border-2 border-border bg-card p-5 shadow-pop md:p-6"
        role="region"
        aria-label="Bài đọc chạm"
      >
        {lines.map((l, li) => {
          const ws = lineWords[li]!;
          // Tách câu thành: khoảng trắng/dấu câu (span thường) + từ (nút chạm).
          const segs: { text: string; global: number | null }[] = [];
          let last = 0;
          // Base của câu trong `spoken`: tổng độ dài các câu trước + khoảng trắng nối.
          const lineBase = lines.slice(0, li).reduce((acc, p) => acc + p.en.length + 1, 0);
          ws.forEach((w) => {
            const local = w.start - lineBase;
            if (local > last) segs.push({ text: l.en.slice(last, local), global: null });
            segs.push({ text: w.word, global: w.global });
            last = local + w.word.length;
          });
          if (last < l.en.length) segs.push({ text: l.en.slice(last), global: null });

          const showScene = l.scene && (li === 0 || lines[li - 1]!.scene !== l.scene);
          return (
            <div key={li} className="mb-5 last:mb-0">
              {showScene && (
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
                  {l.scene}
                </div>
              )}
              {l.vi && <p className="text-sm text-muted-foreground">{l.vi}</p>}
              <p className="text-xl font-bold leading-loose md:text-2xl">
                {segs.map((s, i) =>
                  s.global === null ? (
                    <span key={i} className="whitespace-pre-wrap">
                      {s.text}
                    </span>
                  ) : (
                    <button
                      key={i}
                      type="button"
                      ref={(el) => {
                        wordRefs.current[s.global!] = el;
                      }}
                      onClick={() => onWordTap(s.global!)}
                      className={cn(
                        "rounded-md px-0.5 py-0.5 transition-all",
                        current === s.global &&
                          "bg-green-400 text-black scale-110 shadow-pop dark:bg-green-500",
                        current !== null && s.global < current && "text-muted-foreground/70",
                        selected === s.global && "bg-sky-300 text-black dark:bg-sky-400",
                        "hover:bg-primary/15 active:scale-95",
                      )}
                    >
                      {s.text}
                    </button>
                  ),
                )}
              </p>
            </div>
          );
        })}
      </div>

      {/* Thẻ nghĩa của từ vừa chạm (chế độ Chạm từ) */}
      {mode === "word" && selected !== null && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border-2 border-dashed border-primary/50 bg-primary/5 p-4">
          <span className="text-3xl">{meaning?.emoji ?? "🔤"}</span>
          <div className="flex-1">
            <p className="font-display text-xl font-bold">{words[selected]!.word}</p>
            {meaning ? (
              <p className="text-sm text-muted-foreground">
                {meaning.vi} · {meaning.ipa} ·{" "}
                {meaning.level === "starters" ? "🌱 Starters" : meaning.level === "movers" ? "🌿 Movers" : "🌳 Flyers"}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Chưa có nghĩa trong từ điển của app — hỏi cô Owly để biết nghĩa nhé.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => speak(words[selected]!.word)}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-sm font-bold text-secondary-foreground"
          >
            <Volume2 className="size-4" /> Nghe lại
          </button>
        </div>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        💡 Mẹo cho bé: chế độ "Đọc từ đây" đọc liền mạch như người bản địa, từ đang đọc sáng
        xanh lá chạy theo giọng. Chạm sang từ khác để nhảy ngay tới đó — không cần nghe lại từ
        đầu. Giọng đọc lấy theo cài đặt "Giọng đọc" ở đầu trang (Cô/Thầy, Chậm/Vừa).
      </p>
    </div>
  );
}
