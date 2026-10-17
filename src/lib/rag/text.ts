/**
 * RAG text utilities — normalize, tokenize, trigram similarity.
 * Handles Vietnamese diacritics stripping for fuzzy kid-typed queries.
 */

/** Strip Vietnamese diacritics: ờ→o, đ→d, etc. Kids often type without diacritics. */
export function stripVi(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[ơƠ]/g, "o")
    .replace(/[ưƯ]/g, "u");
}

/** Lowercase + strip punctuation + Vietnamese diacritics for search matching. */
export function normalize(s: string): string {
  return stripVi(s.toLowerCase()).replace(/[^\w\s]/g, " ");
}

const STOP_WORDS = new Set([
  // English
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "am",
  "be",
  "been",
  "being",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "it",
  "its",
  "this",
  "that",
  "and",
  "or",
  "but",
  "not",
  "no",
  "if",
  "so",
  "do",
  "does",
  "did",
  "has",
  "have",
  "had",
  "will",
  "would",
  "can",
  "could",
  "may",
  "might",
  // Vietnamese (normalized/stripped)
  "la",
  "gi",
  "cua",
  "co",
  "khong",
  "nhu",
  "thi",
  "cung",
  "duoc",
  "nay",
  "day",
  "do",
  "va",
  "voi",
  "cho",
  "tu",
  "den",
  "bao",
  "nhieu",
  "roi",
  "ma",
  "se",
  "dang",
  "da",
  "mot",
  "cac",
  "nhung",
  "hay",
  "o",
  "ra",
]);

/** Tokenize text: normalize, split on whitespace, remove stop words + short tokens. */
export function tokenize(s: string): string[] {
  return normalize(s)
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

/** Build character trigrams from a string. */
export function trigrams(s: string): Set<string> {
  const norm = normalize(s);
  const grams = new Set<string>();
  for (let i = 0; i <= norm.length - 3; i++) {
    grams.add(norm.slice(i, i + 3));
  }
  return grams;
}

/** Jaccard similarity between two trigram sets. */
export function trigramSimilarity(a: string, b: string): number {
  const ta = trigrams(a);
  const tb = trigrams(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let intersection = 0;
  for (const g of ta) {
    if (tb.has(g)) intersection++;
  }
  return intersection / (ta.size + tb.size - intersection);
}
