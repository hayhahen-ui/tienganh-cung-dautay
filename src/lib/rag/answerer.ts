/**
 * Answer Composer + Grader — Corrective RAG: grade retrieval confidence,
 * compose local answers by intent detection, or fallback with suggestions.
 */
import { type RetrievedChunk } from "./retriever";
import { suggestedQuestions, faqEntries } from "./knowledge";
import { normalize, stripVi } from "./text";
import { lessons, thematicVocabLists, type Vocab } from "@/data/curriculum";

export type AnswerSource = {
  label: string;
  lessonSlug?: string | undefined;
};

export type Answer = {
  text: string;
  sources: AnswerSource[];
  speakText: string;
  typingChallenge?: string | undefined;
  suggestions?: string[] | undefined;
  corrective: boolean;
};

const CONFIDENCE_THRESHOLD = 0.008;

/** Grade whether retrieved chunks are confident enough to answer. */
export function grade(results: RetrievedChunk[]): boolean {
  if (results.length === 0) return false;
  return results[0]!.score >= CONFIDENCE_THRESHOLD;
}

// ── Tra từ điển trực tiếp (ưu tiên trước RAG) ───────────────────────────

type DictEntry = Vocab & { lessonSlug: string; lessonTitle: string };
let _dict: DictEntry[] | null = null;
function dictionary(): DictEntry[] {
  if (_dict) return _dict;
  _dict = lessons.flatMap((l) =>
    l.vocab.map((v) => ({ ...v, lessonSlug: l.slug, lessonTitle: l.title })),
  );
  return _dict;
}

const VI_PATTERNS: RegExp[] = [
  /^(?:con|cai|cái|quả|qua|củ|cu|chiếc|chiec|màu|mau)?\s*(.+?)\s+(?:trong\s+)?tieng\s+anh\s+(?:la|goi|noi|viet|doc)\s+(?:la\s+)?(?:gi|sao|the nao|nhu the nao)/i,
  /^(?:tu|chu)?\s*(.+?)\s+(?:nghia|dich)\s+(?:la|sang)?\s*(?:gi|tieng viet|tieng anh)/i,
  /^(?:dich|translate)\s+(?:tu|chu|cau)?\s*(.+)$/i,
  /^(?:what is|what's|whats)\s+(.+?)\s+in\s+(?:english|vietnamese)/i,
  /^(.+?)\s+(?:la|là)\s+gi/i,
];

function cleanTerm(t: string) {
  // chỉ bỏ từ đệm rõ ràng; KHÔNG bỏ "ha", "con", "a"… vì có thể là một phần của từ cần tra (hà mã, con mèo)
  return normalize(t)
    .replace(/\b(oi|vay|nhe|nha|giup|giúp|minh|mình)\b/g, " ")
    .replace(/[?!.,"'«»]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Khớp FAQ trực tiếp bằng từ khóa (không bỏ stop-word) — bắt được "cách dùng a an". */
function matchFaq(query: string): Answer | null {
  const q = normalize(query);
  const GENERIC = new Set([
    "cach",
    "dung",
    "la",
    "gi",
    "nhu",
    "the",
    "nao",
    "co",
    "oi",
    "cho",
    "minh",
    "biet",
    "hoi",
    "voi",
    "sao",
    "khi",
  ]);
  const qWords = new Set(q.split(/\s+/).filter((w) => w && !GENERIC.has(w)));
  let best: { score: number; f: (typeof faqEntries)[number] } | null = null;
  for (const f of faqEntries) {
    const kws = new Set(normalize(`${f.q} ${f.kw}`).split(/\s+/).filter(Boolean));
    let inter = 0;
    for (const w of qWords) if (kws.has(w)) inter++;
    const score = inter / Math.max(1, qWords.size);
    if (inter >= 2 && score >= 0.6 && (!best || score > best.score)) best = { score, f };
  }
  if (!best) return null;
  const speakText = extractEnglish(best.f.a);
  return {
    text: `🦉 ${best.f.a}`,
    sources: [{ label: "Hỏi đáp" }],
    speakText: speakText || "Let's learn English together!",
    typingChallenge: speakText.length > 5 ? speakText : undefined,
    corrective: false,
  };
}

/** Nhận diện ý định tra từ; trả về từ cần tra (đã bỏ dấu) hoặc null. */
export function detectDictionaryQuery(query: string): string | null {
  const q = normalize(query).replace(/\s+/g, " ").trim();
  for (const re of VI_PATTERNS) {
    const m = q.match(re);
    if (m?.[1]) {
      const term = cleanTerm(m[1]);
      if (term.length >= 2 && term.split(" ").length <= 4) return term;
    }
  }
  // Một từ tiếng Anh đơn lẻ, ví dụ "hippo" hoặc "hippo?"
  if (/^[a-z][a-z' -]{1,20}$/.test(q) && q.split(" ").length <= 2) return q;
  return null;
}

function lookup(term: string): DictEntry[] {
  const t = stripVi(term).toLowerCase();
  const d = dictionary();
  const exact = d.filter((e) => {
    const en = e.word.toLowerCase();
    const vi = normalize(e.vi)
      .replace(/\(.*?\)/g, "")
      .trim();
    const viCore = vi.replace(/^(con|cai|qua|cu|chiec|mau|so|bàn|ban|hai|nhung|cái|số)\s+/, "");
    return en === t || vi === t || viCore === t;
  });
  if (exact.length) return exact;
  return d
    .filter((e) => {
      const vi = normalize(e.vi);
      return (
        vi.split(/[,;(]/)[0]!.trim().split(" ").includes(t) || t.includes(e.word.toLowerCase())
      );
    })
    .slice(0, 3);
}

function dictionaryAnswer(term: string, hits: DictEntry[]): Answer {
  const main = hits[0]!;
  const lines = hits
    .slice(0, 3)
    .map((h) => `${h.emoji} **${h.word}** ${h.ipa} — ${h.vi}  «bài ${h.lessonTitle}»`);
  return {
    text: `📖 ${lines.join("\n")}`,
    sources: hits
      .slice(0, 3)
      .map((h) => ({ label: `${h.emoji} ${h.word}`, lessonSlug: h.lessonSlug })),
    speakText: main.word,
    typingChallenge: main.word,
    corrective: false,
  };
}

function dictionaryMiss(term: string): Answer {
  const suggestions = pickSuggestions(term, 3);
  // Từ tiếng Anh có trong wordlist Cambridge nhưng chưa có bài học riêng
  const t = term.toLowerCase();
  const inWordlist = thematicVocabLists.find((th) =>
    [...th.starters, ...th.movers, ...th.flyers].some((w) => w.toLowerCase() === t),
  );
  const extra = inWordlist
    ? ` Từ này có trong wordlist Cambridge chủ đề **${inWordlist.theme}** — bé xem trang Giáo trình nhé.`
    : "";
  return {
    text: `🦉 Từ **«${term}»** chưa có trong ${lessons.length} bài học Starters → Flyers của cô.${extra} Bé thử hỏi từ khác trong bài học, hoặc nhờ ba mẹ bật chế độ AI để cô tra giúp nhé!`,
    sources: [],
    speakText: "Hmm, that word is not in our lessons yet!",
    suggestions,
    corrective: true,
  };
}

const ANSWERABLE = new Set(["vocab", "grammar", "reading", "faq", "exam", "roadmap", "platform"]);

/** Compose a local answer from retrieved chunks based on intent detection. */
export function composeAnswer(query: string, results: RetrievedChunk[]): Answer {
  // 0. Tra từ điển trực tiếp: "con hà mã tiếng Anh là gì?", "apple nghĩa là gì?"
  const term = detectDictionaryQuery(query);
  if (term) {
    const hits = lookup(term);
    if (hits.length) return dictionaryAnswer(term, hits);
    // Câu hỏi rõ ràng là tra từ mà không có trong giáo trình → trả lời thẳng, không lấy chunk nhiễu
    // (trừ khi RAG có chunk thật sự chứa từ đó, ví dụ chủ đề picture book).
    const top0 = results[0];
    const ragHasTerm =
      top0 &&
      grade(results) &&
      ANSWERABLE.has(top0.chunk.source.type) &&
      normalize(top0.chunk.text).includes(stripVi(term).toLowerCase());
    if (!ragHasTerm && /tieng anh|nghia la|dich|in english|la gi/.test(normalize(query))) {
      return dictionaryMiss(term);
    }
  }

  const faq = matchFaq(query);
  if (faq) return faq;

  if (!grade(results)) {
    return correctiveFallback(query);
  }

  const top = results[0]!;
  const sourceType = top.chunk.source.type;
  if (!ANSWERABLE.has(sourceType)) return correctiveFallback(query);
  const sources = deduplicateSources(results.slice(0, 3));

  // Intent detection based on top chunk type
  switch (sourceType) {
    case "vocab":
      return vocabAnswer(top, sources);
    case "grammar":
      return grammarAnswer(top, results, sources);
    case "reading":
      return readingAnswer(top, sources);
    case "faq":
      return faqAnswer(top, sources);
    default:
      return generalAnswer(top, results, sources);
  }
}

// ── Intent-specific composers ───────────────────────────────────────────

function vocabAnswer(top: RetrievedChunk, sources: AnswerSource[]): Answer {
  const text = top.chunk.text;
  // Extract English word for TTS
  const wordMatch = text.match(/([a-zA-Z][\w\s]*?)\s+\//);
  const speakText = wordMatch ? wordMatch[1]!.trim() : extractEnglish(text);

  return {
    text: `📖 ${text}`,
    sources,
    speakText,
    typingChallenge: speakText.length > 2 ? speakText : undefined,
    corrective: false,
  };
}

function grammarAnswer(
  top: RetrievedChunk,
  results: RetrievedChunk[],
  sources: AnswerSource[],
): Answer {
  let text = `📝 ${top.chunk.text}`;

  // Add examples from subsequent grammar chunks
  const examples = results
    .slice(1, 4)
    .filter((r) => r.chunk.source.type === "grammar" && r.chunk.id.includes("-ex-"))
    .map((r) => r.chunk.text);

  if (examples.length > 0) {
    text += "\n\n" + examples.map((e) => `• ${e}`).join("\n");
  }

  const speakText = extractEnglish(text);

  return {
    text,
    sources,
    speakText,
    typingChallenge: speakText.length > 5 ? speakText : undefined,
    corrective: false,
  };
}

function readingAnswer(top: RetrievedChunk, sources: AnswerSource[]): Answer {
  return {
    text: `📖 ${top.chunk.text}`,
    sources,
    speakText: extractEnglish(top.chunk.text),
    corrective: false,
  };
}

function faqAnswer(top: RetrievedChunk, sources: AnswerSource[]): Answer {
  const parts = top.chunk.text.split("? ");
  const answer = parts.length > 1 ? parts.slice(1).join("? ") : top.chunk.text;
  const speakText = extractEnglish(answer);

  return {
    text: `🦉 ${answer}`,
    sources,
    speakText: speakText || "Let's learn English together!",
    typingChallenge: speakText.length > 5 ? speakText : undefined,
    corrective: false,
  };
}

function generalAnswer(
  top: RetrievedChunk,
  results: RetrievedChunk[],
  sources: AnswerSource[],
): Answer {
  let text = `📚 ${top.chunk.text}`;
  if (results.length > 1) {
    const extra = results
      .slice(1, 3)
      .map((r) => `• ${r.chunk.text.slice(0, 120)}${r.chunk.text.length > 120 ? "…" : ""}`)
      .join("\n");
    text += "\n\n" + extra;
  }

  return {
    text,
    sources,
    speakText: extractEnglish(top.chunk.text),
    corrective: false,
  };
}

// ── Corrective fallback ─────────────────────────────────────────────────

function correctiveFallback(query: string): Answer {
  const suggestions = pickSuggestions(query, 3);
  return {
    text: `🦉 Cô Owly chưa tìm thấy câu trả lời trong giáo trình cho câu hỏi này. Bé thử hỏi lại bằng cách khác hoặc chọn một câu gợi ý bên dưới nhé!`,
    sources: [],
    speakText: "Hmm, let's try another question!",
    suggestions,
    corrective: true,
  };
}

function pickSuggestions(query: string, count: number): string[] {
  const normQ = normalize(query);
  // Sort suggested questions by trigram similarity to the query
  const scored = suggestedQuestions.map((sq) => ({
    q: sq,
    sim: jaccardWords(normQ, normalize(sq)),
  }));
  scored.sort((a, b) => b.sim - a.sim);

  // Pick top N, but ensure variety
  return scored.slice(0, count).map((s) => s.q);
}

function jaccardWords(a: string, b: string): number {
  const wa = new Set(a.split(/\s+/).filter((t) => t.length > 1));
  const wb = new Set(b.split(/\s+/).filter((t) => t.length > 1));
  if (wa.size === 0 || wb.size === 0) return 0;
  let inter = 0;
  for (const w of wa) if (wb.has(w)) inter++;
  return inter / (wa.size + wb.size - inter);
}

// ── Helpers ─────────────────────────────────────────────────────────────

function extractEnglish(text: string): string {
  // Extract quoted English sentences
  const matches = text.match(/"([A-Z][^"]*[.!?])"/g);
  if (matches && matches.length > 0) {
    return matches[0]!.replace(/"/g, "");
  }
  // Fallback: find English-looking sentence
  const sentenceMatch = text.match(/([A-Z][a-zA-Z\s',]+[.!?])/);
  return sentenceMatch ? sentenceMatch[1]!.trim() : "";
}

function deduplicateSources(results: RetrievedChunk[]): AnswerSource[] {
  const seen = new Set<string>();
  const sources: AnswerSource[] = [];
  for (const r of results) {
    const key = r.chunk.source.label + (r.chunk.source.lessonSlug ?? "");
    if (!seen.has(key)) {
      seen.add(key);
      sources.push({
        label: r.chunk.source.label,
        lessonSlug: r.chunk.source.lessonSlug,
      });
    }
  }
  return sources;
}
