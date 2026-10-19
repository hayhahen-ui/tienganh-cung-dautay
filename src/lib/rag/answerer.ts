/**
 * Answer Composer + Grader — Corrective RAG: grade retrieval confidence,
 * compose local answers by intent detection, or fallback with suggestions.
 */
import { type RetrievedChunk } from "./retriever";
import { suggestedQuestions, faqEntries } from "./knowledge";
import { normalize, stripVi } from "./text";
import { lessons, type Vocab } from "@/data/curriculum";
import { yleDictionary } from "@/data/dictionary";

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

type DictEntry = Vocab & {
  lessonSlug?: string;
  lessonTitle?: string;
  theme?: string;
  level?: string;
};
let _dict: DictEntry[] | null = null;
/** Từ của 24 bài học đứng trước (có link bài), sau đó là toàn bộ wordlist YLE. */
function dictionary(): DictEntry[] {
  if (_dict) return _dict;
  const fromLessons: DictEntry[] = lessons.flatMap((l) =>
    l.vocab.map((v) => ({ ...v, lessonSlug: l.slug, lessonTitle: l.title })),
  );
  const seen = new Set(fromLessons.map((e) => e.word.toLowerCase()));
  const fromWordlist: DictEntry[] = yleDictionary
    .filter((w) => !seen.has(w.en.toLowerCase()))
    .map((w) => ({
      word: w.en,
      vi: w.vi,
      ipa: w.ipa,
      emoji: w.emoji,
      theme: w.theme,
      level: w.level,
    }));
  _dict = [...fromLessons, ...fromWordlist];
  return _dict;
}

const QUESTION_MARKERS =
  /\b(trong\s+)?tieng\s+(anh|viet)\b|\bnghia\s+(la|cua)\b|\bla\s+gi\b|\bgoi\s+la\b|\bnoi\s+(sao|the nao)\b|\bviet\s+(sao|the nao)\b|\bdoc\s+(sao|the nao)\b|\bdich\b|\btranslate\b|\bin\s+(english|vietnamese)\b|\bwhat\s+is\b|\bwhat'?s\b|\bmean(s|ing)?\b/g;
const TRAILING_FILLERS =
  /\b(vay|co|oi|nhe|nha|a|ạ|giup|giúp|minh|mình|nao|gi|sao|la|cua|the|nhu)\b\s*$/;
const LEADING_FILLERS =
  /^\s*(co|cô|oi|ơi|owly|cho|em|to|tớ|hoi|hỏi|xin|lam on|tu|từ|chu|chữ|cai|cái)\b/;

/** Nhận diện ý định tra từ; trả về từ cần tra (đã bỏ dấu) hoặc null. */
export function detectDictionaryQuery(query: string): string | null {
  const q = normalize(query)
    .replace(/[?!.,"'«»]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const isQuestion = QUESTION_MARKERS.test(q);
  QUESTION_MARKERS.lastIndex = 0;
  let term = q.replace(QUESTION_MARKERS, " ").replace(/\s+/g, " ").trim();
  // bóc từ đệm ở hai đầu (lặp vài lần)
  for (let i = 0; i < 4; i++) {
    term = term.replace(TRAILING_FILLERS, "").replace(LEADING_FILLERS, "").trim();
  }
  if (isQuestion) return term.length >= 2 && term.split(" ").length <= 4 ? term : null;
  // Không có dấu hiệu câu hỏi: chỉ coi là tra từ khi gõ 1–2 từ tiếng Anh
  if (/^[a-z][a-z' -]{1,20}$/.test(q) && q.split(" ").length <= 2) return q;
  return null;
}

const VI_CLASSIFIERS =
  /^(con|cai|qua|cu|chiec|mau|so|cay|bong|doi|cap|nguoi|bo|cuon|to|bo mon|mon|loai|phong|nghe|hai|nhung|cac)\s+/;
function viForms(vi: string): string[] {
  const base = normalize(vi)
    .replace(/\(.*?\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const parts = base
    .split(/[,;/]/)
    .map((p) => p.trim())
    .filter(Boolean);
  const out = new Set<string>();
  for (const p of parts) {
    out.add(p);
    out.add(p.replace(VI_CLASSIFIERS, ""));
  }
  return [...out];
}

function lookup(term: string): DictEntry[] {
  const t = stripVi(term).toLowerCase().trim();
  const tCore = t.replace(VI_CLASSIFIERS, "");
  const d = dictionary();
  const enKey = (e: DictEntry) => e.word.toLowerCase().split("/")[0]!.trim();
  // 1. khớp chính xác tiếng Anh hoặc tiếng Việt
  const exact = d.filter((e) => {
    if (enKey(e) === t || e.word.toLowerCase() === t) return true;
    return viForms(e.vi).some((f) => f === t || f === tCore);
  });
  if (exact.length) return exact;
  // 2. khớp mềm: nghĩa Việt chứa cụm từ, hoặc từ Anh bắt đầu bằng term
  const soft = d.filter((e) => {
    const forms = viForms(e.vi);
    return forms.some((f) => f.includes(tCore) && tCore.length >= 3) || enKey(e).startsWith(t);
  });
  if (soft.length) return soft.slice(0, 3);
  // 3. term chứa nghĩa Việt (ví dụ "la cay" chứa "la" của "chiếc lá"): ưu tiên nghĩa dài nhất
  const tWords = tCore.split(" ");
  const contained = d
    .map((e) => {
      const best = viForms(e.vi)
        .filter((f) => f.length >= 2 && f.split(" ").every((w) => tWords.includes(w)))
        .sort((a, b) => b.length - a.length)[0];
      return best ? { e, len: best.length } : null;
    })
    .filter((x): x is { e: DictEntry; len: number } => x !== null)
    .sort((a, b) => b.len - a.len);
  if (contained.length && contained[0]!.len >= Math.max(2, Math.floor(tCore.length / 2))) {
    return contained.slice(0, 2).map((x) => x.e);
  }
  return [];
}

function dictionaryAnswer(term: string, hits: DictEntry[]): Answer {
  const main = hits[0]!;
  const LEVEL_NAME: Record<string, string> = {
    starters: "Starters",
    movers: "Movers",
    flyers: "Flyers",
  };
  const lines = hits.slice(0, 3).map((h) => {
    const where = h.lessonTitle
      ? `«bài ${h.lessonTitle}»`
      : `«wordlist ${LEVEL_NAME[h.level ?? ""] ?? ""} · ${h.theme ?? ""}»`;
    return `${h.emoji} **${h.word}** ${h.ipa} — ${h.vi}  ${where}`;
  });
  const sources: AnswerSource[] = hits
    .slice(0, 3)
    .map((h) =>
      h.lessonSlug
        ? { label: `${h.emoji} ${h.word}`, lessonSlug: h.lessonSlug }
        : { label: `${h.emoji} ${h.word}` },
    );
  return {
    text: `📖 ${lines.join("\n")}`,
    sources,
    speakText: main.word,
    typingChallenge: main.word,
    corrective: false,
  };
}

function dictionaryMiss(term: string): Answer {
  const suggestions = pickSuggestions(term, 3);
  return {
    text: `🦉 Từ **«${term}»** chưa có trong từ điển Cambridge YLE (${dictionary().length} từ Starters → Flyers) của cô. Bé kiểm tra lại chính tả, thử từ gần nghĩa, hoặc nhờ ba mẹ bật chế độ AI để cô tra giúp nhé!`,
    sources: [],
    speakText: "Hmm, that word is not in our lessons yet!",
    suggestions,
    corrective: true,
  };
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
    if (inter >= 1 && score >= 0.6 && (!best || score > best.score)) best = { score, f };
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
    const faqHit = matchFaq(query);
    if (faqHit) return faqHit;
    if (!ragHasTerm && QUESTION_MARKERS.test(normalize(query))) {
      QUESTION_MARKERS.lastIndex = 0;
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
