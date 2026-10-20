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

/** Từ chung chung — không tính là "từ nội dung" khi kiểm tra chunk có liên quan. */
const GRADE_STOP = new Set([
  "cho",
  "be",
  "con",
  "cai",
  "cua",
  "voi",
  "va",
  "thi",
  "nhu",
  "the",
  "nao",
  "cach",
  "dung",
  "sao",
  "khi",
  "o",
  "de",
  "duoc",
  "mot",
  "nhung",
  "cac",
  "nay",
  "do",
  "em",
  "minh",
  "hoi",
  "tu",
  "biet",
]);

/** Tách các từ nội dung (đã bỏ khung câu hỏi + từ đệm) khỏi câu hỏi của bé. */
function contentTokens(query: string): string[] {
  let q = normalize(query).replace(/[?!.,"'«»]/g, " ");
  q = q.replace(QUESTION_MARKERS, " ");
  QUESTION_MARKERS.lastIndex = 0;
  return q.split(/\s+/).filter((w) => w.length >= 3 && !GRADE_STOP.has(w));
}

/**
 * Grade whether retrieved chunks are confident enough to answer.
 * Chắn false-positive (vd: hỏi "con bướm…" mà trả lời "viết hoa thứ/ngày"):
 * chunk top phải chứa ít nhất 1 từ nội dung của câu hỏi.
 */
export function grade(results: RetrievedChunk[], query = ""): boolean {
  if (results.length === 0) return false;
  const top = results[0]!;
  if (top.score < CONFIDENCE_THRESHOLD) return false;
  if (!query) return true;
  const toks = contentTokens(query);
  if (toks.length === 0) return true;
  const hay = normalize(`${top.chunk.text} ${top.chunk.keywords}`);
  return toks.some((t) => hay.includes(t));
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

// ── Dịch Việt → Anh ("con bướm đậu trên bông hoa tiếng anh là gì?") ──────

const VI2EN_PATTERNS = [
  /dich\s+(.+?)\s+sang\s+tieng\s+anh/,
  /(.+?)\s+(trong\s+)?tieng\s+anh\s+(la\s+gi|nghia\s+la\s+gi|nghia\s+cua\s+la\s+gi|nghia\s+gi|noi\s+(sao|the\s+nao)|viet\s+(sao|the\s+nao)|doc\s+(sao|the\s+nao))/,
];

/** Lượng từ có dấu (bản giữ dấu của VI_CLASSIFIERS) để tách "con bướm" → "bướm". */
const VI_CLASSIFIERS_DIA =
  /^(con|cái|quả|củ|chiếc|màu|số|cây|bông|đôi|cặp|người|bộ|cuốn|tờ|bộ môn|môn|loại|phòng|nghề|hai|những|các)\s+/;

function viFormsDia(vi: string): string[] {
  const base = vi
    .toLowerCase()
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
    out.add(p.replace(VI_CLASSIFIERS_DIA, ""));
  }
  return [...out];
}

/**
 * Nhận diện ý định dịch Việt→Anh; trả về cụm tiếng Việt cần dịch (GIỮ DẤU) hoặc null.
 * Giữ dấu để "đậu" không bị nhầm với "đầu".
 * LƯU Ý: KHÔNG cắt "tiếng anh" khỏi cụm — đó là nội dung dịch ("học tiếng anh" =
 * study English), và từ điển đã có entry "tiếng Anh → English" nên greedy khớp
 * 2 từ trước, không còn khớp nhầm "anh" → brother. (20/10/2026)
 */
export function detectTranslationQuery(query: string): string | null {
  const qDia = query
    .toLowerCase()
    .replace(/[?!.,"'«»]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const q = stripVi(qDia);
  for (const re of VI2EN_PATTERNS) {
    const m = q.match(re);
    if (m && m[1]) {
      let phraseStrip = m[1].trim();
      for (let i = 0; i < 4; i++) {
        phraseStrip = phraseStrip.replace(TRAILING_FILLERS, "").replace(LEADING_FILLERS, "").trim();
      }
      if (phraseStrip.length < 2) continue;
      // Ánh xạ cụm không dấu về cụm có dấu trong câu gốc (so theo từng từ).
      const diaWords = qDia.split(" ").filter(Boolean);
      const stripWords = diaWords.map((w) => stripVi(w));
      const pw = phraseStrip.split(" ").filter(Boolean);
      for (let s = 0; s + pw.length <= stripWords.length; s++) {
        if (pw.every((w, k) => stripWords[s + k] === w)) {
          return diaWords.slice(s, s + pw.length).join(" ");
        }
      }
      return phraseStrip;
    }
  }
  return null;
}

type TranslationHit = { vi: string; entry: DictEntry };

let _viFormMap: Map<string, DictEntry> | null = null;
/** Map nghĩa Việt (đã bỏ dấu, đã bỏ lượng từ) → entry từ điển; form dài đứng trước. */
function viFormMap(): Map<string, DictEntry> {
  if (_viFormMap) return _viFormMap;
  const map = new Map<string, DictEntry>();
  const forms: { form: string; entry: DictEntry }[] = [];
  for (const e of dictionary()) {
    for (const f of viForms(e.vi)) {
      if (f.length >= 2) forms.push({ form: f, entry: e });
    }
  }
  forms.sort((a, b) => b.form.length - a.form.length);
  for (const { form, entry } of forms) {
    if (!map.has(form)) map.set(form, entry);
  }
  _viFormMap = map;
  return map;
}

let _viDiaFormMap: Map<string, DictEntry> | null = null;
/** Map nghĩa Việt GIỮ DẤU → entry; ưu tiên khi bé gõ có dấu ("đậu" ≠ "đầu"). */
function viDiaFormMap(): Map<string, DictEntry> {
  if (_viDiaFormMap) return _viDiaFormMap;
  const map = new Map<string, DictEntry>();
  const forms: { form: string; entry: DictEntry }[] = [];
  for (const e of dictionary()) {
    for (const f of viFormsDia(e.vi)) {
      if (f.length >= 2) forms.push({ form: f, entry: e });
    }
  }
  forms.sort((a, b) => b.form.length - a.form.length);
  for (const { form, entry } of forms) {
    if (!map.has(form)) map.set(form, entry);
  }
  _viDiaFormMap = map;
  return map;
}

/** true khi từ còn dấu (stripVi làm đổi chuỗi). */
const hasMarks = (w: string): boolean => stripVi(w) !== w;

/**
 * Dịch cụm tiếng Việt (giữ dấu) sang tiếng Anh bằng khớp tham lam cụm dài nhất.
 * - Lượt 1: khớp chính xác có dấu (bé gõ "đậu" thì không nhầm "đầu").
 * - Lượt 2: bỏ dấu — chỉ cho từ bé gõ không dấu.
 */
export function translatePhrase(phraseDia: string): TranslationHit[] {
  const wordsDia = phraseDia.toLowerCase().split(/\s+/).filter(Boolean);
  const wordsStrip = wordsDia.map((w) => stripVi(w));
  const diaMap = viDiaFormMap();
  const stripMap = viFormMap();
  const hits: TranslationHit[] = [];
  const seenEn = new Set<string>();
  let i = 0;
  while (i < wordsDia.length) {
    let matched: DictEntry | null = null;
    let len = 0;
    for (let l = Math.min(4, wordsDia.length - i); l >= 1; l--) {
      const cand = wordsDia.slice(i, i + l).join(" ");
      const e = diaMap.get(cand);
      if (e && !seenEn.has(e.word)) {
        matched = e;
        len = l;
        break;
      }
    }
    if (!matched) {
      for (let l = Math.min(4, wordsStrip.length - i); l >= 1; l--) {
        if (wordsDia.slice(i, i + l).some(hasMarks)) continue;
        const cand = wordsStrip.slice(i, i + l).join(" ");
        const e = stripMap.get(cand);
        if (e && !seenEn.has(e.word)) {
          matched = e;
          len = l;
          break;
        }
      }
    }
    if (matched) {
      seenEn.add(matched.word);
      hits.push({ vi: wordsDia.slice(i, i + len).join(" "), entry: matched });
      i += len;
    } else {
      i++;
    }
  }
  return hits;
}

function translationAnswer(hits: TranslationHit[], phraseDia?: string): Answer {
  const lines = hits.map((h) => `${h.entry.emoji} **${h.entry.word}** ${h.entry.ipa} — ${h.vi}`);
  const enWords = hits.map((h) => h.entry.word.split("/")[0]!.trim());
  const sources: AnswerSource[] = hits.map((h) =>
    h.entry.lessonSlug
      ? { label: `${h.entry.emoji} ${h.entry.word}`, lessonSlug: h.entry.lessonSlug }
      : { label: `${h.entry.emoji} ${h.entry.word}` },
  );
  const speakText = enWords.join(", ");
  // Độ phủ: tỉ lệ từ của câu gốc được từ điển dịch. Phủ thấp → KHÔNG mạo danh
  // đây là bản dịch cả câu (trước đây câu 11 từ chỉ dịch được 2 từ vẫn đề
  // "Trong tiếng Anh:") — ghi rõ mới là một số từ. (20/10/2026)
  const totalWords = phraseDia ? phraseDia.split(/\s+/).filter(Boolean).length : 0;
  const matchedWords = hits.reduce((s, h) => s + h.vi.split(/\s+/).filter(Boolean).length, 0);
  const partial = totalWords >= 4 && matchedWords / Math.max(totalWords, 1) < 0.6;
  const header = partial ? "🌱 Một số từ trong câu của bé:" : "🌍 Trong tiếng Anh:";
  return {
    text: `${header}\n${lines.join("\n")}\n\n💬 Bé đọc: "${speakText}"`,
    sources,
    speakText,
    typingChallenge: enWords[0] && enWords[0].length <= 20 ? enWords[0] : undefined,
    corrective: false,
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
  // 0a. Dịch Việt → Anh: "con bướm đậu trên bông hoa tiếng anh là gì?"
  const trPhrase = detectTranslationQuery(query);
  if (trPhrase) {
    const trHits = translatePhrase(trPhrase);
    if (trHits.length > 0) return translationAnswer(trHits, trPhrase);
    // Không dịch được từ nào → rơi xuống luồng tra từ/RAG như cũ.
  }

  // 0b. Tra từ điển trực tiếp: "con hà mã tiếng Anh là gì?", "apple nghĩa là gì?"
  const term = detectDictionaryQuery(query);
  if (term) {
    const hits = lookup(term);
    if (hits.length) return dictionaryAnswer(term, hits);
    // Câu hỏi rõ ràng là tra từ mà không có trong giáo trình → trả lời thẳng, không lấy chunk nhiễu
    // (trừ khi RAG có chunk thật sự chứa từ đó, ví dụ chủ đề picture book).
    const top0 = results[0];
    const ragHasTerm =
      top0 &&
      grade(results, query) &&
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

  if (!grade(results, query)) {
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
