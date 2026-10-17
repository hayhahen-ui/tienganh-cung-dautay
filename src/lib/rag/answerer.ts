/**
 * Answer Composer + Grader — Corrective RAG: grade retrieval confidence,
 * compose local answers by intent detection, or fallback with suggestions.
 */
import { type RetrievedChunk } from "./retriever";
import { suggestedQuestions } from "./knowledge";
import { normalize } from "./text";

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

/** Compose a local answer from retrieved chunks based on intent detection. */
export function composeAnswer(query: string, results: RetrievedChunk[]): Answer {
  if (!grade(results)) {
    return correctiveFallback(query);
  }

  const top = results[0]!;
  const sourceType = top.chunk.source.type;
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
