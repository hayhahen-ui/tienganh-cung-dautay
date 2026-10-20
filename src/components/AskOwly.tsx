/**
 * AskOwly — Chat UI with RAG-powered Q&A, typing challenge, and stats.
 * Helps kids practice typing while learning English.
 */
import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Send,
  Volume2,
  Sparkles,
  Keyboard,
  MessageCircle,
  RotateCcw,
  Play,
  Square,
  Settings,
} from "lucide-react";
import { retrieve } from "@/lib/rag/retriever";
import {
  composeAnswer,
  detectTranslationQuery,
  translatePhrase,
  type Answer,
} from "@/lib/rag/answerer";
import { suggestedQuestions } from "@/lib/rag/knowledge";
import { askLlm, isLlmOn } from "@/lib/rag/ask-server";
import { speak, stopSpeaking } from "@/lib/speech";
import { AiKeySettings } from "@/components/AiKeySettings";

// ── Types ───────────────────────────────────────────────────────────────

type Message = {
  id: number;
  role: "kid" | "owly";
  text: string;
  answer?: Answer | undefined;
  isLlm?: boolean | undefined;
};

type TypingStats = { words: number; chars: number; challenges: number };

const STATS_KEY = "owly-typing-stats";

function loadStats(): TypingStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw) as TypingStats;
  } catch {
    /* ignore */
  }
  return { words: 0, chars: 0, challenges: 0 };
}

function saveStats(s: TypingStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(s));
}

// ── Component ───────────────────────────────────────────────────────────

export function AskOwly() {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 0,
      role: "owly",
      text: '🦉 Chào bé! Cô là **Owly** — cô cú thông thái. Bé gõ câu hỏi tiếng Anh ở ô bên dưới nhé! Ví dụ: "apple nghĩa là gì?" hoặc "cách dùng a an".',
      answer: {
        text: "",
        sources: [],
        speakText: "Hello! I am Owly. Ask me a question about English!",
        corrective: false,
      },
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<TypingStats>(loadStats);
  const [llmStatus, setLlmStatus] = useState<"unknown" | "checking" | "on" | "off">("checking");
  const [llmError, setLlmError] = useState<string | null>(null);
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  const [chips, setChips] = useState<string[]>(() => pickRandom(suggestedQuestions, 4));
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  const refreshLlmStatus = useCallback(() => {
    setLlmStatus("checking");
    void isLlmOn().then((on) => {
      setLlmStatus(on ? "on" : "off");
      if (on) setLlmError(null);
    });
  }, []);

  // Kiểm tra AI đã bật chưa: key trên server HOẶC key ba mẹ đã lưu trên máy này.
  // (GET health-check + localStorage — không tốn token, không gửi key đi đâu.)
  useEffect(() => {
    let active = true;
    void isLlmOn().then((on) => {
      if (!active) return;
      setLlmStatus(on ? "on" : "off");
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const rotateChips = useCallback(() => {
    setChips(pickRandom(suggestedQuestions, 4));
  }, []);

  const handleSend = useCallback(async () => {
    const q = input.trim();
    if (!q || loading) return;

    // Update typing stats
    const wordCount = q.split(/\s+/).length;
    const newStats = { ...stats, words: stats.words + wordCount, chars: stats.chars + q.length };
    setStats(newStats);
    saveStats(newStats);

    // Add kid message
    const kidMsg: Message = { id: nextId.current++, role: "kid", text: q };
    setMessages((prev) => [...prev, kidMsg]);
    setInput("");
    setLoading(true);

    try {
      // 1. Retrieve locally (instant)
      const results = retrieve(q, 5);
      const localAnswer = composeAnswer(q, results);

      // 2. Try LLM — ALWAYS call when available, even if RAG didn't find an answer
      //    This fixes the "không biết" issue: when RAG fails, LLM can still answer
      let finalAnswer = localAnswer;
      let isLlm = false;

      if (llmStatus !== "off") {
        try {
          const context = results
            .slice(0, 3)
            .map((r) => r.chunk.text)
            .join("\n\n");
          // Câu hỏi dịch Việt→Anh: lệnh AI dịch TOÀN BỘ câu gốc một cách tự
          // nhiên, đầy đủ mọi mệnh đề. Danh sách từ điển chỉ là GỢI Ý tham khảo —
          // lệnh cũ "ghép câu từ các từ đã dịch" khiến AI bỏ mất cả mệnh đề mà
          // từ điển không có (vd "vì bé có cú thông thái hỗ trợ"). (20/10/2026)
          const trPhrase = detectTranslationQuery(q);
          const trWords = trPhrase
            ? translatePhrase(trPhrase).map((h) => h.entry.word.split("/")[0]!.trim())
            : [];
          const isTranslation = !!trPhrase && trPhrase.split(/\s+/).filter(Boolean).length >= 2;
          const llmQuestion = isTranslation
            ? `${q}\n\n[Yêu cầu bắt buộc: Đây là câu hỏi dịch Việt→Anh. Hãy dịch TOÀN BỘ câu tiếng Việt "${trPhrase}" sang tiếng Anh một cách TỰ NHIÊN như người bản xứ và ĐẦY ĐỦ mọi ý — dịch hết từng mệnh đề, không bỏ sót phần nào. ${trWords.length ? `Từ gợi ý từ giáo trình: ${trWords.join(", ")} (chỉ tham khảo — hãy chọn bất cứ từ tiếng Anh nào đúng ngữ cảnh nhất, không bị giới hạn ở các từ gợi ý). ` : ""}Viết câu dịch hoàn chỉnh trong dấu ngoặc kép ở đầu câu trả lời, rồi giải thích ngắn gọn bằng tiếng Việt.]`
            : q;
          let llmResult = await askLlm({ data: { question: llmQuestion, context } });
          // AI trả về rỗng → thử lại 1 lần trước khi bỏ cuộc.
          if (llmResult.mode === "llm" && !(llmResult.text || "").trim() && isTranslation) {
            llmResult = await askLlm({ data: { question: llmQuestion, context } });
          }

          if (llmResult.mode === "not-configured") {
            setLlmStatus("off");
          } else if (llmResult.mode === "llm" && (llmResult.text || "").trim()) {
            setLlmStatus("on");
            isLlm = true;
            // If RAG found a confident answer, enhance it with LLM
            // If RAG failed (corrective), use LLM answer directly
            finalAnswer = {
              ...localAnswer,
              // RAG tự tin → giữ câu trả lời giáo trình, nối thêm giải thích của AI.
              // RAG không tìm thấy → dùng thẳng câu trả lời AI.
              text: localAnswer.corrective
                ? `🤖 ${llmResult.text}`
                : `${localAnswer.text}\n\n🤖 **${isTranslation ? "Cô Owly dịch cả câu" : "Cô Owly giải thích thêm"}:** ${llmResult.text}`,
              speakText: extractFirstEnglish(llmResult.text) || localAnswer.speakText,
              corrective: false,
              // Keep RAG sources if they exist, otherwise empty
              sources: localAnswer.sources,
            };
          } else if (llmResult.mode === "llm") {
            // AI trả về rỗng sau khi thử lại → giữ nguyên đáp án giáo trình,
            // KHÔNG in header "giải thích thêm" trống.
            setLlmError("AI chưa trả lời được câu này, bé xem phần giáo trình nhé.");
          } else {
            // Lỗi tạm thời (mạng, hết quota, key sai) → giữ nguyên trạng thái
            // badge, chỉ hiện lỗi; KHÔNG tắt AI hẳn vì key vẫn còn trên máy.
            if (llmResult.mode === "error") setLlmError(llmResult.error);
          }
        } catch (err) {
          setLlmError(err instanceof Error ? err.message : "Error calling LLM");
        }
      }

      // 3. Add owly message
      const owlyMsg: Message = {
        id: nextId.current++,
        role: "owly",
        text: finalAnswer.text,
        answer: finalAnswer,
        isLlm,
      };
      setMessages((prev) => [...prev, owlyMsg]);
      rotateChips();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: "owly",
          text: "🦉 Ôi, có lỗi xảy ra. Bé thử hỏi lại nhé!",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, stats, llmStatus, rotateChips]);

  const handleChipClick = useCallback((q: string) => {
    setInput(q);
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 140px)" }}>
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-3 border-b-2 border-border px-4 py-2 text-sm">
        <span className="flex items-center gap-1.5 font-bold text-primary">
          <Keyboard className="size-4" />
          {stats.words} từ đã gõ
        </span>
        <span className="flex items-center gap-1.5 font-bold text-success">
          <MessageCircle className="size-4" />
          {messages.filter((m) => m.role === "kid").length} câu hỏi
        </span>
        <span className="flex items-center gap-1.5 font-bold text-grape">
          <Sparkles className="size-4" />
          {stats.challenges} thử thách
        </span>
        <div className="ml-auto flex items-center gap-2">
          {llmError && (
            <span className="text-xs text-destructive font-mono bg-destructive/10 px-2 py-0.5 rounded">
              {llmError}
            </span>
          )}
          <button
            type="button"
            onClick={() => setKeyDialogOpen(true)}
            title="Cài đặt AI — dán API key của ba mẹ"
            aria-label="Cài đặt AI"
            className="rounded-full border-2 border-border bg-card p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Settings className="size-3.5" />
          </button>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              llmStatus === "on"
                ? "bg-success/20 text-success"
                : llmStatus === "checking"
                  ? "bg-sun/20 text-sun-foreground animate-pulse"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {llmStatus === "on"
              ? "🤖 AI + giáo trình"
              : llmStatus === "checking"
                ? "⏳ Đang kiểm tra AI…"
                : "📚 Giáo trình (AI chưa bật)"}
          </span>
        </div>
      </div>

      <AiKeySettings
        open={keyDialogOpen}
        onOpenChange={setKeyDialogOpen}
        onSaved={refreshLlmStatus}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "kid" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "kid"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card border-2 border-border rounded-bl-md shadow-pop"
              }`}
            >
              <RichText text={msg.text} />

              {msg.answer && (
                <div className="mt-3 space-y-2">
                  {/* Speak button */}
                  {msg.answer.speakText && (
                    <button
                      type="button"
                      onClick={() => speak(msg.answer!.speakText)}
                      className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground transition-transform hover:-translate-y-0.5"
                    >
                      <Volume2 className="size-3.5" /> Nghe phát âm
                    </button>
                  )}

                  {/* Speak words — bé bấm từng từ để nghe riêng */}
                  {msg.answer.speakText && msg.answer.speakText.split(" ").length > 1 && (
                    <SpeakWords text={msg.answer.speakText} />
                  )}

                  {/* Source chips */}
                  {msg.answer.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.answer.sources.map((s, i) =>
                        s.lessonSlug ? (
                          <Link
                            key={i}
                            to="/bai-hoc/$slug"
                            params={{ slug: s.lessonSlug }}
                            className="rounded-full bg-sky/15 px-2.5 py-0.5 text-xs font-bold text-sky hover:bg-sky/25 transition-colors"
                          >
                            📘 {s.label}
                          </Link>
                        ) : (
                          <span
                            key={i}
                            className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground"
                          >
                            📌 {s.label}
                          </span>
                        ),
                      )}
                    </div>
                  )}

                  {/* Suggestion chips (corrective) */}
                  {msg.answer.suggestions && msg.answer.suggestions.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-muted-foreground">💡 Thử hỏi:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.answer.suggestions.map((sq, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleChipClick(sq)}
                            className="rounded-full bg-sun/20 px-3 py-1 text-xs font-bold text-sun-foreground hover:bg-sun/40 transition-colors"
                          >
                            {sq}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Typing challenge */}
                  {msg.answer.typingChallenge && (
                    <TypingChallenge
                      target={msg.answer.typingChallenge}
                      onComplete={() => {
                        const ns = { ...stats, challenges: stats.challenges + 1 };
                        setStats(ns);
                        saveStats(ns);
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-card border-2 border-border px-4 py-3 shadow-pop">
              <span className="animate-pulse text-lg">🦉 Cô Owly đang tìm…</span>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Suggestion chips */}
      <div className="flex items-center gap-2 overflow-x-auto border-t border-border px-4 py-2">
        <button
          type="button"
          onClick={rotateChips}
          className="shrink-0 rounded-full border-2 border-border p-1.5 text-muted-foreground hover:bg-muted transition-colors"
          aria-label="Đổi gợi ý"
        >
          <RotateCcw className="size-3.5" />
        </button>
        {chips.map((q, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleChipClick(q)}
            className="shrink-0 whitespace-nowrap rounded-full border-2 border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="border-t-2 border-border bg-card px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
          className="mx-auto flex max-w-3xl items-center gap-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Bé gõ câu hỏi ở đây… (tập gõ thật đẹp nhé ⌨️)"
            aria-label="Câu hỏi của bé"
            maxLength={200}
            className="flex-1 rounded-full border-2 border-border bg-background px-5 py-3 text-base font-semibold outline-none transition-colors focus:border-primary"
            disabled={loading}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-pop transition-transform hover:-translate-y-0.5 disabled:opacity-40"
          >
            <Send className="size-5" />
          </button>
        </form>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Bấm gợi ý để điền sẵn — bé tự nhấn Enter nhé ⌨️
        </p>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────

/**
 * Simple markdown-lite renderer: **bold**, «em» and line breaks.
 * Không dùng dangerouslySetInnerHTML — nội dung từ LLM/bé gõ được render
 * thành React node nên không thể chèn HTML/script (an toàn cho trẻ em).
 */
function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => (
        <p key={i}>{renderInline(line)}</p>
      ))}
    </div>
  );
}

function renderInline(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|«(.+?)»/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) out.push(line.slice(last, m.index));
    if (m[1] !== undefined) out.push(<strong key={k++}>{m[1]}</strong>);
    else if (m[2] !== undefined)
      out.push(
        <em key={k++} className="font-bold text-primary">
          {m[2]}
        </em>,
      );
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

/** Typing challenge card: kid types English sentence, per-char color feedback. */
function TypingChallenge({ target, onComplete }: { target: string; onComplete: () => void }) {
  const [value, setValue] = useState("");
  const [done, setDone] = useState(false);
  const [startTime] = useState(() => Date.now());

  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

  useEffect(() => {
    if (norm(value) === norm(target) && !done) {
      setDone(true);
      onComplete();
    }
  }, [value, target, done, onComplete]);

  const elapsed = done ? ((Date.now() - startTime) / 1000).toFixed(1) : null;

  return (
    <div className="mt-2 rounded-xl border-2 border-dashed border-sun bg-sun/10 p-3">
      <p className="text-xs font-bold text-sun-foreground mb-1.5">
        ✍️ Thử thách đánh máy — gõ lại câu này:
      </p>
      <p className="mb-2 font-display text-sm font-bold text-foreground">{target}</p>

      {/* Character comparison */}
      {value.length > 0 && !done && (
        <div className="mb-2 font-mono text-sm leading-relaxed">
          {value.split("").map((ch, i) => {
            const expected = target[i]?.toLowerCase() ?? "";
            const correct = ch.toLowerCase() === expected;
            return (
              <span
                key={i}
                className={
                  correct ? "text-success font-bold" : "text-destructive font-bold underline"
                }
              >
                {ch}
              </span>
            );
          })}
        </div>
      )}

      {done ? (
        <div className="rounded-lg bg-success/15 p-2 text-center">
          <p className="font-display text-sm font-bold text-success">
            🎉 Tuyệt vời! Hoàn thành trong {elapsed}s!
          </p>
        </div>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Gõ ở đây…"
          className="w-full rounded-lg border-2 border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
          autoComplete="off"
          spellCheck={false}
        />
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function pickRandom<T>(arr: T[], n: number): T[] {
  // Fisher–Yates: xáo trộn đều, không thiên lệch như sort(random).
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a.slice(0, n);
}

function extractFirstEnglish(text: string): string {
  const match = text.match(/"([A-Z][^"]*[.!?])"/);
  return match ? match[1]! : "";
}

// ── SpeakWords: tách câu thành từng từ, bé bấm từ nào nghe từ đó ────────

/** Tách câu tiếng Anh thành từng từ, giữ nguyên dấu câu. */
function splitWords(text: string): string[] {
  return text
    .replace(/([.,!?;:'"()])/g, " $1 ")
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

/** Component: hiển thị câu dạng từng từ, bấm để nghe phát âm riêng. */
function SpeakWords({ text }: { text: string }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [playingAll, setPlayingAll] = useState(false);
  const words = splitWords(text);
  // Dựng lại câu tự nhiên để ĐỌC LIỀN MẠCH 1 utterance (không khoảng trắng thừa trước dấu câu).
  const sentence = words.join(" ").replace(/\s+([.,!?;:'")\]])/g, "$1");
  // Offset ký tự của từng từ trong câu → map boundary event thành highlight.
  const offsets: number[] = [];
  {
    let pos = 0;
    for (const w of words) {
      pos = sentence.indexOf(w, pos);
      offsets.push(pos);
      pos += w.length;
    }
  }
  const playIdRef = useRef(0);

  const stopAll = () => {
    playIdRef.current++;
    stopSpeaking();
    setPlayingAll(false);
    setActiveIdx(null);
  };

  const speakWord = (word: string, idx: number) => {
    playIdRef.current++;
    setPlayingAll(false);
    setActiveIdx(idx);
    speak(word, { rate: 0.7 });
    // Reset highlight after a short delay (approximate word duration)
    setTimeout(
      () => setActiveIdx((cur) => (cur === idx ? null : cur)),
      Math.max(600, word.length * 120),
    );
  };

  const speakAll = () => {
    if (playingAll) {
      stopAll();
      return;
    }
    const id = ++playIdRef.current;
    setPlayingAll(true);
    setActiveIdx(0);
    // ĐỌC CẢ CÂU TRONG 1 UTTERANCE — ngữ điệu liền mạch như người bản địa
    // (trước đây đọc từng từ riêng lẻ nên nghe rời rạc). Highlight từng từ
    // qua boundary event (trình duyệt/voice nào không hỗ trợ thì chỉ không
    // highlight, tiếng vẫn liền mạch).
    const ok = speak(sentence, {
      onBoundary: (charIndex) => {
        if (playIdRef.current !== id) return;
        let idx = 0;
        for (let i = 0; i < offsets.length; i++) {
          if (offsets[i]! <= charIndex) idx = i;
          else break;
        }
        setActiveIdx(idx);
      },
      onEnd: () => {
        if (playIdRef.current !== id) return;
        setPlayingAll(false);
        setActiveIdx(null);
      },
    });
    if (!ok) {
      setPlayingAll(false);
      setActiveIdx(null);
    }
  };

  return (
    <div className="mt-2 rounded-xl border-2 border-dashed border-sky bg-sky/10 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-sky">🔊 Bấm vào từng từ để nghe phát âm riêng:</p>
        <button
          type="button"
          onClick={() => speakAll()}
          className="inline-flex items-center gap-1 rounded-full border-2 border-sky bg-sky/20 px-2.5 py-0.5 text-xs font-bold text-sky transition-colors hover:bg-sky/30"
        >
          {playingAll ? <Square className="size-3" /> : <Play className="size-3" />}
          {playingAll ? "Dừng" : "Đọc cả câu"}
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {words.map((w, i) => (
          <button
            key={i}
            type="button"
            onClick={() => speakWord(w, i)}
            className={`rounded-lg px-2 py-1 font-display text-sm font-bold transition-all ${
              activeIdx === i
                ? "scale-110 bg-sky text-sky-foreground shadow-pop"
                : "bg-card text-foreground hover:bg-sky/20"
            }`}
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}
